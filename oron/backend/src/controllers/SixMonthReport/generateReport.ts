import { Request, Response, NextFunction } from 'express';
import { getRepository, Between, In } from 'typeorm';
import { CustomError } from 'utils/response/custom-error/CustomError';

import { SixMonthReport, ReportStatus } from 'orm/entities/SixMonthReport/SixMonthReport';
import { TreatmentFullPlan } from 'orm/entities/TreatmentPlan/treatmentFullPlan';
import { IntakeFullForm } from 'orm/entities/IntakeForm/intakeFullForm';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { BehaviorManagement } from 'orm/entities/VisitLog/stepOne/behaviorManagement';
import { ConcernAndChallenges } from 'orm/entities/VisitLog/stepOne/concernAndChallenges';
import { SessionHighlights } from 'orm/entities/VisitLog/stepOne/sessionHighlights';
import { Communication } from 'orm/entities/VisitLog/stepOne/communication';
import { SelfManagement } from 'orm/entities/VisitLog/stepOne/selfManagement';
import { Socialization } from 'orm/entities/VisitLog/stepTwo/socialization';
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
      return next(new CustomError(400, 'General', 'Missing required fields'));
    }

    // Validate report type
    console.log('Validating report type:', report_type);
    console.log('Valid types:', Object.values(TreatmentPlanType));
    if (!Object.values(TreatmentPlanType).includes(report_type)) {
      console.log('ERROR: Invalid report type');
      return next(new CustomError(400, 'General', 'Invalid report type'));
    }

    // Get repositories
    console.log('Getting repositories...');
    const reportRepo = getRepository(SixMonthReport);
    const treatmentRepo = getRepository(TreatmentFullPlan);
    const visitRepo = getRepository(VisitFullForm);
    const behaviorRepo = getRepository(BehaviorManagement);
    const concernRepo = getRepository(ConcernAndChallenges);
    const sessionRepo = getRepository(SessionHighlights);
    const communicationRepo = getRepository(Communication);
    const selfManagementRepo = getRepository(SelfManagement);
    const socializationRepo = getRepository(Socialization);

    // Verify treatment plan exists
    console.log('Looking for treatment plan:', treatment_plan_id);
    const treatmentPlan = await treatmentRepo.findOne({
      where: { id: treatment_plan_id },
      relations: ['intakeFullForm'],
    });
    console.log('Treatment plan found:', treatmentPlan ? 'Yes' : 'No');
    console.log('Treatment plan intake_full_id:', treatmentPlan?.intake_full_id);

    if (!treatmentPlan) {
      console.log('ERROR: Treatment plan not found');
      return next(new CustomError(404, 'General', 'Treatment plan not found'));
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
      return next(new CustomError(409, 'General', 'Report already exists for this period'));
    }

    // Create new report or update existing draft
    console.log('Creating/updating report...');
    const report = existingReport || reportRepo.create();

    report.treatment_plan_id = treatment_plan_id;
    report.intake_id = treatmentPlan.intake_full_id;
    report.report_type = report_type;
    report.start_date = new Date(start_date);
    report.end_date = new Date(end_date);
    report.period = period;
    report.generated_by_id = req.jwtPayload.id;
    report.status = ReportStatus.GENERATING;

    console.log('Report data to save:', JSON.stringify({
      treatment_plan_id: report.treatment_plan_id,
      intake_id: report.intake_id,
      report_type: report.report_type,
      start_date: report.start_date,
      end_date: report.end_date,
      period: report.period,
      generated_by_id: report.generated_by_id,
      status: report.status,
    }, null, 2));

    await reportRepo.save(report);
    console.log('Report saved with ID:', report.id);

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
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return next(new CustomError(500, 'General', 'Failed to generate report'));
  }
};

// Async function to generate report data
async function generateReportData(reportId: string) {
  const reportRepo = getRepository(SixMonthReport);
  const visitRepo = getRepository(VisitFullForm);
  const behaviorRepo = getRepository(BehaviorManagement);
  const concernRepo = getRepository(ConcernAndChallenges);
  const sessionRepo = getRepository(SessionHighlights);
  
  const report = await reportRepo.findOne({
    where: { id: reportId },
    relations: ['treatmentPlan', 'intake'],
  });

  if (!report) {
    throw new Error('Report not found');
  }

  // Get all visits within the date range
  const visits = await visitRepo.find({
    where: {
      treatment_plan_id: report.treatment_plan_id,
      created_at: Between(report.start_date, report.end_date),
      status: Status.SUBMITTED,
    },
    relations: [
      'sessionHighlights',
      'selfManagement',
      'communication',
      'concernAndChallenges',
      'domesticSkillTraining',
      'personalCareAndBladderControl',
      'personalWorkReading',
      'playLeisure',
      'safetyAndSurvivalSkills',
      'sensoryNeedAndMotorDevelopment',
      'snackMealTime',
      'socialization',
      'utilizationOfMoney',
      'transportationTypeAndObjectives',
    ],
  });

  // Aggregate behavioral management data
  const behaviorIds = visits.flatMap(v => v.behavior_management_ids || []);
  const behaviors = behaviorIds.length > 0 
    ? await behaviorRepo.find({ where: { id: In(behaviorIds) } })
    : [];

  // Process behavioral data
  const behaviorFrequency = {};
  const behaviorInterventions = {};
  const behaviorOutcomes = {};

  behaviors.forEach(behavior => {
    const key = behavior.behavior_description || 'Unknown';
    behaviorFrequency[key] = (behaviorFrequency[key] || 0) + 1;

    if (!behaviorInterventions[key]) {
      behaviorInterventions[key] = new Set();
    }
    if (behavior.other_crisis_intervention) {
      behaviorInterventions[key].add(behavior.other_crisis_intervention);
    }

    if (!behaviorOutcomes[key]) {
      behaviorOutcomes[key] = [];
    }
    if (behavior.consequence) {
      behaviorOutcomes[key].push(behavior.consequence);
    }
  });

  // Process concerns and challenges
  const concernsAndChallenges = [];
  const significantEvents = [];

  for (const visit of visits) {
    if (visit.concernAndChallenges) {
      const concern = visit.concernAndChallenges;
      const concernDescription = concern.describe_circumstances_involved || '';
      concernsAndChallenges.push({
        date: visit.created_at,
        concern: concernDescription,
        severity: determineSeverity(concernDescription),
        action_taken: 'Not specified',
        follow_up_needed: concern.supervisor_to_contact_during_session || false,
        resolution_status: 'ongoing',
      });

      // Add to significant events if high severity
      if (determineSeverity(concernDescription) === 'high') {
        significantEvents.push({
          date: visit.created_at,
          event: concernDescription,
          category: 'challenge',
          impact: 'Not specified',
          response: 'Not specified',
        });
      }
    }
  }

  // Process session highlights
  const sessionHighlights = [];
  for (const visit of visits) {
    if (visit.sessionHighlights) {
      sessionHighlights.push({
        date: visit.created_at,
        highlights: [visit.sessionHighlights.location || ''],
        activities: [visit.sessionHighlights.level_of_compliance || ''],
        outcomes: [visit.sessionHighlights.ti_onsite_locations || ''],
      });
    }
  }

  // Calculate skills progress
  const skillsProgress = {
    communication: calculateSkillProgress(visits, 'communication'),
    self_management: calculateSkillProgress(visits, 'selfManagement'),
    socialization: calculateSkillProgress(visits, 'socialization'),
    daily_living: calculateDailyLivingProgress(visits),
    behavioral_management: calculateBehaviorProgress(behaviors),
  };

  // Visit attendance statistics
  const visitAttendance = {
    total_scheduled: visits.length,
    total_attended: visits.filter(v => v.status === Status.SUBMITTED).length,
    total_cancelled: visits.filter(v => v.status === Status.REJECTED).length,
    total_rescheduled: 0,
    attendance_rate: visits.length > 0
      ? (visits.filter(v => v.status === Status.SUBMITTED).length / visits.length) * 100
      : 0,
    cancellation_reasons: [],
  };

  // Goals assessment
  const goalsAssessment = await calculateGoalsAssessment(report.treatment_plan_id);

  // Executive summary
  const executiveSummary = {
    total_visits: visits.length,
    total_hours: visits.length * 2, // Assuming 2 hours per visit
    key_achievements: extractKeyAchievements(visits, skillsProgress),
    areas_of_concern: extractAreasOfConcern(concernsAndChallenges, behaviorFrequency),
    overall_progress: determineOverallProgress(skillsProgress, goalsAssessment),
  };

  // Behavioral management summary
  const behavioralManagement = {
    behaviors: Object.keys(behaviorFrequency).map(behavior => ({
      behavior,
      frequency: behaviorFrequency[behavior] as number,
      interventions: Array.from(behaviorInterventions[behavior] || []) as string[],
      outcomes: (behaviorOutcomes[behavior] || []) as string[],
      trend: determineBehaviorTrend(behaviorOutcomes[behavior] || []),
    })),
    most_frequent_behaviors: Object.keys(behaviorFrequency)
      .sort((a, b) => behaviorFrequency[b] - behaviorFrequency[a])
      .slice(0, 5),
    successful_interventions: extractSuccessfulInterventions(behaviorInterventions, behaviorOutcomes),
    recommendations: generateBehaviorRecommendations(behaviorFrequency, behaviorOutcomes),
  };

  // Update report with generated data
  await reportRepo.update(reportId, {
    executive_summary: executiveSummary,
    behavioral_management: behavioralManagement,
    significant_life_events: significantEvents,
    skills_progress: skillsProgress,
    session_highlights_summary: sessionHighlights,
    concerns_and_challenges_summary: concernsAndChallenges,
    visit_attendance: visitAttendance,
    goals_assessment: goalsAssessment,
    recommendations: generateRecommendations(executiveSummary, behavioralManagement, skillsProgress),
    next_period_goals: generateNextPeriodGoals(skillsProgress, behavioralManagement),
    status: ReportStatus.COMPLETED,
    updated_at: new Date(),
  });
}

// Helper functions
function determineSeverity(concern: string): 'low' | 'medium' | 'high' {
  const highKeywords = ['emergency', 'crisis', 'severe', 'urgent', 'critical'];
  const mediumKeywords = ['moderate', 'concern', 'issue', 'problem'];
  
  const lowerConcern = concern.toLowerCase();
  
  if (highKeywords.some(keyword => lowerConcern.includes(keyword))) {
    return 'high';
  }
  if (mediumKeywords.some(keyword => lowerConcern.includes(keyword))) {
    return 'medium';
  }
  return 'low';
}

function calculateSkillProgress(visits: any[], skillType: string) {
  const baseline = 50; // Default baseline
  let totalProgress = 0;
  let count = 0;
  
  visits.forEach(visit => {
    if (visit[skillType]) {
      totalProgress += 10; // Simplified progress calculation
      count++;
    }
  });
  
  const current = Math.min(100, baseline + totalProgress);
  
  return {
    baseline,
    current,
    goals_met: current >= 70 ? ['Progress target achieved'] : [],
    areas_for_improvement: current < 70 ? ['Continued practice needed'] : [],
  };
}

function calculateDailyLivingProgress(visits: any[]) {
  const baseline = 50;
  let totalProgress = 0;
  
  visits.forEach(visit => {
    if (visit.domesticSkillTraining || visit.personalCareAndBladderControl) {
      totalProgress += 5;
    }
  });
  
  const current = Math.min(100, baseline + totalProgress);
  
  return {
    baseline,
    current,
    goals_met: current >= 70 ? ['Independence in daily activities improved'] : [],
    areas_for_improvement: current < 70 ? ['More support needed for daily tasks'] : [],
  };
}

function calculateBehaviorProgress(behaviors: any[]) {
  const baseline = 50;
  const positiveOutcomes = behaviors.filter(b => 
    b.outcome && b.outcome.toLowerCase().includes('improve')
  ).length;
  
  const current = Math.min(100, baseline + (positiveOutcomes * 5));
  
  return {
    baseline,
    current,
    goals_met: current >= 70 ? ['Behavior management successful'] : [],
    areas_for_improvement: current < 70 ? ['Continued intervention needed'] : [],
  };
}

function determineBehaviorTrend(outcomes: string[]): 'improving' | 'stable' | 'declining' {
  if (outcomes.length === 0) return 'stable';
  
  const positiveCount = outcomes.filter(o => 
    o.toLowerCase().includes('improve') || o.toLowerCase().includes('better')
  ).length;
  
  const ratio = positiveCount / outcomes.length;
  
  if (ratio > 0.6) return 'improving';
  if (ratio < 0.3) return 'declining';
  return 'stable';
}

function extractKeyAchievements(visits: any[], skillsProgress: any): string[] {
  const achievements = [];
  
  if (skillsProgress.communication.current >= 70) {
    achievements.push('Significant improvement in communication skills');
  }
  if (skillsProgress.self_management.current >= 70) {
    achievements.push('Enhanced self-management capabilities');
  }
  if (visits.length > 20) {
    achievements.push('Consistent attendance and participation');
  }
  
  return achievements.length > 0 ? achievements : ['Steady progress maintained'];
}

function extractAreasOfConcern(concerns: any[], behaviorFrequency: any): string[] {
  const areas = [];
  
  const highSeverityConcerns = concerns.filter(c => c.severity === 'high');
  if (highSeverityConcerns.length > 0) {
    areas.push('High severity concerns requiring immediate attention');
  }
  
  const frequentBehaviors = Object.keys(behaviorFrequency)
    .filter(b => behaviorFrequency[b] > 10);
  if (frequentBehaviors.length > 0) {
    areas.push('Frequent behavioral challenges observed');
  }
  
  return areas.length > 0 ? areas : ['No major concerns identified'];
}

function determineOverallProgress(skillsProgress: any, goalsAssessment: any): string {
  const avgProgress = (
    skillsProgress.communication.current +
    skillsProgress.self_management.current +
    skillsProgress.socialization.current +
    skillsProgress.daily_living.current +
    skillsProgress.behavioral_management.current
  ) / 5;
  
  if (avgProgress >= 80) return 'Excellent progress';
  if (avgProgress >= 60) return 'Good progress';
  if (avgProgress >= 40) return 'Moderate progress';
  return 'Limited progress';
}

function extractSuccessfulInterventions(interventions: any, outcomes: any): string[] {
  const successful = [];
  
  Object.keys(interventions).forEach(behavior => {
    const behaviorOutcomes = outcomes[behavior] || [];
    const successRate = behaviorOutcomes.filter((o: string) => 
      o.toLowerCase().includes('improve') || o.toLowerCase().includes('success')
    ).length / behaviorOutcomes.length;
    
    if (successRate > 0.5) {
      Array.from(interventions[behavior]).forEach((intervention: string) => {
        if (!successful.includes(intervention)) {
          successful.push(intervention);
        }
      });
    }
  });
  
  return successful.slice(0, 5);
}

function generateBehaviorRecommendations(frequency: any, outcomes: any): string[] {
  const recommendations = [];
  
  Object.keys(frequency).forEach(behavior => {
    if (frequency[behavior] > 5) {
      const trend = determineBehaviorTrend(outcomes[behavior] || []);
      if (trend === 'declining' || trend === 'stable') {
        recommendations.push(`Review and adjust intervention for: ${behavior}`);
      }
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('Continue current behavioral intervention strategies');
  }
  
  return recommendations;
}

function generateRecommendations(summary: any, behavioral: any, skills: any): string {
  const recommendations = [];
  
  if (summary.overall_progress === 'Limited progress') {
    recommendations.push('Consider adjusting treatment approach and goals');
  }
  
  if (behavioral.most_frequent_behaviors.length > 3) {
    recommendations.push('Focus on addressing top behavioral concerns');
  }
  
  Object.keys(skills).forEach(skill => {
    if (skills[skill].current < 60) {
      recommendations.push(`Increase focus on ${skill.replace('_', ' ')} development`);
    }
  });
  
  return recommendations.join('\n');
}

function generateNextPeriodGoals(skills: any, behavioral: any): string {
  const goals = [];
  
  Object.keys(skills).forEach(skill => {
    if (skills[skill].current < 80) {
      goals.push(`Achieve ${skill.replace('_', ' ')} progress target of ${skills[skill].current + 20}%`);
    }
  });
  
  if (behavioral.most_frequent_behaviors.length > 0) {
    goals.push(`Reduce frequency of top behavioral concerns by 50%`);
  }
  
  return goals.join('\n');
}

async function calculateGoalsAssessment(treatmentPlanId: string) {
  // This would query the treatment goals from the database
  // For now, returning mock data
  return {
    goals_set: 10,
    goals_achieved: 6,
    goals_in_progress: 3,
    goals_not_started: 1,
    achievement_rate: 60,
    revised_goals: [],
  };
}