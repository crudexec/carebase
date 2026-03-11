import { Request, Response, NextFunction } from 'express';
import { getRepository, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { CustomError } from 'utils/response/custom-error/CustomError';

import { SixMonthReport, ReportStatus } from 'orm/entities/SixMonthReport/SixMonthReport';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { TreatmentGoal } from 'orm/entities/TreatmentPlan/treatmentGoal';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { BehaviorManagement } from 'orm/entities/VisitLog/stepOne/behaviorManagement';
import { ConcernAndChallenges } from 'orm/entities/VisitLog/stepOne/concernAndChallenges';
import { TreatmentPlanType, Status } from 'types/genericEnums';

export const generateSixMonthReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== SIX MONTH REPORT GENERATION STARTED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.jwtPayload?.id);

    const {
      treatment_plan_id,
      start_date,
      end_date,
      report_type,
      period = 'custom',
    } = req.body;

    // Validate required fields
    if (!treatment_plan_id || !start_date || !end_date || !report_type) {
      console.log('ERROR: Missing required fields', { treatment_plan_id, start_date, end_date, report_type });
      const customError = new CustomError(400, 'General', 'Missing required fields');
      return next(customError);
    }

    // Validate report type
    console.log('Validating report type:', report_type);
    if (!Object.values(TreatmentPlanType).includes(report_type)) {
      console.log('ERROR: Invalid report type');
      const customError = new CustomError(400, 'General', 'Invalid report type');
      return next(customError);
    }

    // Get repositories
    console.log('Getting repositories...');
    const reportRepo = getRepository(SixMonthReport);
    const treatmentRepo = getRepository(TreatmentFullPlan);

    // Verify treatment plan exists and get intake info
    console.log('Looking for treatment plan:', treatment_plan_id);
    const treatmentPlan = await treatmentRepo.findOne({
      where: { id: treatment_plan_id },
      select: ['id', 'intake_full_id'],
    });
    console.log('Treatment plan found:', treatmentPlan ? 'Yes' : 'No');
    console.log('Treatment plan intake_full_id:', treatmentPlan?.intake_full_id);

    if (!treatmentPlan) {
      console.log('ERROR: Treatment plan not found');
      const customError = new CustomError(404, 'General', 'Treatment plan not found');
      return next(customError);
    }

    // Check if report already exists for this period
    const existingReport = await reportRepo.findOne({
      where: {
        treatment_plan_id,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        deleted_at: null,
      },
    });

    if (existingReport && existingReport.status === ReportStatus.COMPLETED) {
      const customError = new CustomError(409, 'General', 'Report already exists for this period');
      return next(customError);
    }

    // Create new report or update existing draft
    const report = existingReport || reportRepo.create();
    
    report.treatment_plan_id = treatment_plan_id;
    report.intake_id = treatmentPlan.intake_full_id;
    report.report_type = report_type;
    report.start_date = new Date(start_date);
    report.end_date = new Date(end_date);
    report.period = period;
    report.generated_by_id = req.jwtPayload.id;
    report.status = ReportStatus.GENERATING;

    await reportRepo.save(report);

    // Start async report generation
    generateReportData(report.id).catch(error => {
      console.error('Report generation failed:', error);
      reportRepo.update(report.id, { status: ReportStatus.FAILED });
    });

    res.customSuccess(200, 'Report generation started', {
      report_id: report.id,
      status: report.status,
      message: 'Report is being generated. Check status for updates.',
    });
  } catch (error) {
    console.error('=== SIX MONTH REPORT GENERATION ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const customError = new CustomError(500, 'General', 'Failed to generate report');
    return next(customError);
  }
};

// Async function to generate report data from real database records
async function generateReportData(reportId: string) {
  console.log('=== GENERATING REPORT DATA ===');
  console.log('Report ID:', reportId);

  const reportRepo = getRepository(SixMonthReport);
  const visitRepo = getRepository(VisitFullForm);
  const behaviorRepo = getRepository(BehaviorManagement);
  const goalRepo = getRepository(TreatmentGoal);
  const concernRepo = getRepository(ConcernAndChallenges);

  const report = await reportRepo.findOne({
    where: { id: reportId },
  });

  if (!report) {
    throw new Error('Report not found');
  }

  console.log('Report found:', {
    treatment_plan_id: report.treatment_plan_id,
    intake_id: report.intake_id,
    start_date: report.start_date,
    end_date: report.end_date,
  });

  // Fetch visits within the date range using intake_id (visits link via intake_full_id, not treatment_plan_id)
  const visits = await visitRepo.find({
    where: {
      intake_full_id: report.intake_id,
      date_of_visit: Between(report.start_date, report.end_date),
      deleted_at: null,
    },
    relations: ['sessionHighlights', 'selfManagement', 'communication', 'concernAndChallenges', 'socialization'],
    order: { date_of_visit: 'ASC' },
  });

  console.log('Visits found:', visits.length);

  // Get visit IDs for querying related records
  const visitIds = visits.map(v => v.id);

  // Fetch behavior management records linked to these visits
  let behaviors: BehaviorManagement[] = [];
  if (visitIds.length > 0) {
    behaviors = await behaviorRepo.find({
      where: {
        visit_full_form_id: In(visitIds),
        deleted_at: null,
      },
    });
  }

  console.log('Behaviors found:', behaviors.length);

  // Fetch treatment goals using intake_id (goals link via intake_full_id)
  const goals = await goalRepo.find({
    where: {
      intake_full_id: report.intake_id,
      deleted_at: null,
    },
  });

  console.log('Goals found:', goals.length);

  // Fetch concerns and challenges linked to these visits
  let concerns: ConcernAndChallenges[] = [];
  if (visitIds.length > 0) {
    concerns = await concernRepo.find({
      where: {
        visit_full_form_id: In(visitIds),
        deleted_at: null,
      },
    });
  }

  console.log('Concerns found:', concerns.length);

  // Calculate visit statistics
  const completedVisits = visits.filter(v => v.status === Status.COMPLETED || v.status === Status.APPROVED);
  const totalHours = visits.reduce((acc, visit) => {
    if (visit.start_time && visit.end_time) {
      const start = new Date(`1970-01-01T${visit.start_time}`);
      const end = new Date(`1970-01-01T${visit.end_time}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return acc + (hours > 0 ? hours : 0);
    }
    return acc;
  }, 0);

  // Aggregate behavior data
  const behaviorCounts: Record<string, number> = {};
  const interventions: Set<string> = new Set();

  behaviors.forEach(b => {
    if (b.behavior_type) {
      behaviorCounts[b.behavior_type] = (behaviorCounts[b.behavior_type] || 0) + 1;
    }
    if (b.consequence) {
      interventions.add(b.consequence);
    }
  });

  const sortedBehaviors = Object.entries(behaviorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Aggregate goal statistics
  const goalsAchieved = goals.filter(g => g.goal_status === 'achieved' || g.goal_status === 'mastered').length;
  const goalsInProgress = goals.filter(g => g.goal_status === 'in_progress' || g.goal_status === 'ongoing').length;
  const goalsNotStarted = goals.filter(g => g.goal_status === 'not_started' || !g.goal_status).length;

  // Build key achievements from completed goals
  const keyAchievements = goals
    .filter(g => g.goal_status === 'achieved' || g.goal_status === 'mastered')
    .map(g => g.short_term_objective || g.target_skill)
    .filter(Boolean)
    .slice(0, 5);

  // Build areas of concern from concerns
  const areasOfConcern = concerns
    .filter(c => c.was_there_any_concerns_or_challenges)
    .map(c => c.describe_circumstances_involved)
    .filter(Boolean)
    .slice(0, 5);

  // Generate executive summary
  const executiveSummary = {
    total_visits: completedVisits.length,
    total_hours: Math.round(totalHours * 10) / 10,
    key_achievements: keyAchievements.length > 0 ? keyAchievements : ['Data collection in progress'],
    areas_of_concern: areasOfConcern.length > 0 ? areasOfConcern : ['No significant concerns reported'],
    overall_progress: goals.length > 0
      ? `${goalsAchieved} of ${goals.length} goals achieved (${Math.round((goalsAchieved / goals.length) * 100)}%)`
      : 'Goal tracking in progress',
  };

  // Generate behavioral management summary
  const behavioralManagement = {
    behaviors: sortedBehaviors.map(([behavior, frequency]) => ({
      behavior,
      frequency,
      interventions: Array.from(interventions).slice(0, 3),
      outcomes: ['Documented in session notes'],
      trend: 'stable' as const,
    })),
    most_frequent_behaviors: sortedBehaviors.map(([b]) => b),
    successful_interventions: Array.from(interventions).slice(0, 5),
    recommendations: behaviors.length > 0
      ? ['Continue monitoring behavioral patterns', 'Review intervention effectiveness']
      : ['No behaviors recorded in this period'],
  };

  // Generate skills progress based on visit data
  const skillsProgress = {
    communication: {
      baseline: 0,
      current: visits.filter(v => v.communication_id).length,
      goals_met: goals.filter(g => g.goal_area === 'communication' && g.goal_status === 'achieved').map(g => g.target_skill).filter(Boolean) as string[],
      areas_for_improvement: goals.filter(g => g.goal_area === 'communication' && g.goal_status !== 'achieved').map(g => g.target_skill).filter(Boolean) as string[],
    },
    self_management: {
      baseline: 0,
      current: visits.filter(v => v.self_management_id).length,
      goals_met: goals.filter(g => g.goal_area === 'self_management' && g.goal_status === 'achieved').map(g => g.target_skill).filter(Boolean) as string[],
      areas_for_improvement: goals.filter(g => g.goal_area === 'self_management' && g.goal_status !== 'achieved').map(g => g.target_skill).filter(Boolean) as string[],
    },
    socialization: {
      baseline: 0,
      current: visits.filter(v => v.socialization_id).length,
      goals_met: goals.filter(g => g.goal_area === 'socialization' && g.goal_status === 'achieved').map(g => g.target_skill).filter(Boolean) as string[],
      areas_for_improvement: goals.filter(g => g.goal_area === 'socialization' && g.goal_status !== 'achieved').map(g => g.target_skill).filter(Boolean) as string[],
    },
    daily_living: {
      baseline: 0,
      current: visits.filter(v => v.domestic_skill_training_id || v.personal_care_and_bladder_control_id).length,
      goals_met: goals.filter(g => g.goal_area === 'daily_living' && g.goal_status === 'achieved').map(g => g.target_skill).filter(Boolean) as string[],
      areas_for_improvement: goals.filter(g => g.goal_area === 'daily_living' && g.goal_status !== 'achieved').map(g => g.target_skill).filter(Boolean) as string[],
    },
    behavioral_management: {
      baseline: 0,
      current: behaviors.length,
      goals_met: goals.filter(g => g.goal_area === 'behavior' && g.goal_status === 'achieved').map(g => g.target_skill).filter(Boolean) as string[],
      areas_for_improvement: goals.filter(g => g.goal_area === 'behavior' && g.goal_status !== 'achieved').map(g => g.target_skill).filter(Boolean) as string[],
    },
  };

  // Generate visit attendance summary
  const visitAttendance = {
    total_scheduled: visits.length,
    total_attended: completedVisits.length,
    total_cancelled: visits.filter(v => v.status === Status.REJECTED).length,
    total_rescheduled: 0, // Would need rescheduled status tracking
    attendance_rate: visits.length > 0
      ? Math.round((completedVisits.length / visits.length) * 1000) / 10
      : 0,
    cancellation_reasons: [] as string[],
  };

  // Generate goals assessment
  const goalsAssessment = {
    goals_set: goals.length,
    goals_achieved: goalsAchieved,
    goals_in_progress: goalsInProgress,
    goals_not_started: goalsNotStarted,
    achievement_rate: goals.length > 0
      ? Math.round((goalsAchieved / goals.length) * 1000) / 10
      : 0,
    revised_goals: goals
      .filter(g => g.goal_status !== 'achieved' && g.goal_status !== 'mastered')
      .map(g => g.short_term_objective || g.target_skill)
      .filter(Boolean) as string[],
  };

  // Generate session highlights summary
  const sessionHighlightsSummary = visits
    .filter(v => v.sessionHighlights)
    .slice(0, 10)
    .map(v => ({
      date: v.date_of_visit,
      highlights: [v.sessionHighlights?.location || 'Session completed'].filter(Boolean),
      activities: [v.sessionHighlights?.level_of_compliance ? `Compliance: ${v.sessionHighlights.level_of_compliance}` : 'Activities documented'].filter(Boolean),
      outcomes: ['Session notes recorded'],
    }));

  // Generate concerns and challenges summary
  const concernsAndChallengesSummary = concerns
    .filter(c => c.was_there_any_concerns_or_challenges)
    .map(c => ({
      date: c.created_at,
      concern: c.describe_circumstances_involved || 'Concern documented',
      severity: 'medium' as const,
      action_taken: c.supervisor_to_contact_during_session ? 'Supervisor contacted' : 'Documented for review',
      follow_up_needed: c.supervisor_to_contact_during_session || false,
      resolution_status: 'ongoing' as const,
    }));

  // Generate recommendations based on data
  const recommendations = generateRecommendations(visits, behaviors, goals, concerns);

  // Generate next period goals
  const nextPeriodGoals = goals
    .filter(g => g.goal_status !== 'achieved' && g.goal_status !== 'mastered')
    .map(g => g.short_term_objective || g.target_skill)
    .filter(Boolean)
    .slice(0, 5)
    .join('; ') || 'Continue working on current goals';

  console.log('=== REPORT DATA GENERATION COMPLETE ===');

  // Update report with generated data
  await reportRepo.update(reportId, {
    executive_summary: executiveSummary,
    behavioral_management: behavioralManagement,
    skills_progress: skillsProgress,
    visit_attendance: visitAttendance,
    goals_assessment: goalsAssessment,
    session_highlights_summary: sessionHighlightsSummary,
    concerns_and_challenges_summary: concernsAndChallengesSummary,
    recommendations: recommendations,
    next_period_goals: nextPeriodGoals,
    status: ReportStatus.COMPLETED,
    updated_at: new Date(),
  });
}

// Helper function to generate recommendations based on data
function generateRecommendations(
  visits: VisitFullForm[],
  behaviors: BehaviorManagement[],
  goals: TreatmentGoal[],
  concerns: ConcernAndChallenges[]
): string {
  const recommendations: string[] = [];

  // Attendance recommendation
  const completedVisits = visits.filter(v => v.status === Status.COMPLETED || v.status === Status.APPROVED);
  const attendanceRate = visits.length > 0 ? (completedVisits.length / visits.length) * 100 : 0;

  if (attendanceRate < 80) {
    recommendations.push('Focus on improving session attendance rate to at least 80%.');
  } else if (attendanceRate >= 90) {
    recommendations.push('Excellent attendance maintained. Continue current scheduling approach.');
  }

  // Behavior recommendation
  if (behaviors.length > 10) {
    recommendations.push('Consider reviewing behavioral intervention strategies due to high frequency of behavioral incidents.');
  } else if (behaviors.length === 0) {
    recommendations.push('Continue current behavioral management approach - no significant incidents reported.');
  }

  // Goals recommendation
  const goalsAchieved = goals.filter(g => g.goal_status === 'achieved' || g.goal_status === 'mastered').length;
  const achievementRate = goals.length > 0 ? (goalsAchieved / goals.length) * 100 : 0;

  if (achievementRate < 50 && goals.length > 0) {
    recommendations.push('Review and potentially adjust goal difficulty or intervention strategies.');
  } else if (achievementRate >= 75) {
    recommendations.push('Strong goal achievement rate. Consider introducing more challenging objectives.');
  }

  // Concerns recommendation
  const significantConcerns = concerns.filter(c => c.was_there_any_concerns_or_challenges);
  if (significantConcerns.length > 5) {
    recommendations.push('Multiple concerns documented. Schedule team review meeting to address recurring issues.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue current intervention strategies and maintain consistent session delivery.');
  }

  return recommendations.join(' ');
}