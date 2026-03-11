"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSixMonthReport = void 0;
const typeorm_1 = require("typeorm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const SixMonthReport_1 = require("orm/entities/SixMonthReport/SixMonthReport");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const treatmentGoal_1 = require("orm/entities/TreatmentPlan/treatmentGoal");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const behaviorManagement_1 = require("orm/entities/VisitLog/stepOne/behaviorManagement");
const concernAndChallenges_1 = require("orm/entities/VisitLog/stepOne/concernAndChallenges");
const genericEnums_1 = require("types/genericEnums");
const generateSixMonthReport = async (req, res, next) => {
    try {
        console.log('=== SIX MONTH REPORT GENERATION STARTED ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User ID:', req.jwtPayload?.id);
        const { treatment_plan_id, start_date, end_date, report_type, period = 'custom', } = req.body;
        if (!treatment_plan_id || !start_date || !end_date || !report_type) {
            console.log('ERROR: Missing required fields', { treatment_plan_id, start_date, end_date, report_type });
            const customError = new CustomError_1.CustomError(400, 'General', 'Missing required fields');
            return next(customError);
        }
        console.log('Validating report type:', report_type);
        if (!Object.values(genericEnums_1.TreatmentPlanType).includes(report_type)) {
            console.log('ERROR: Invalid report type');
            const customError = new CustomError_1.CustomError(400, 'General', 'Invalid report type');
            return next(customError);
        }
        console.log('Getting repositories...');
        const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
        const treatmentRepo = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        console.log('Looking for treatment plan:', treatment_plan_id);
        const treatmentPlan = await treatmentRepo.findOne({
            where: { id: treatment_plan_id },
            select: ['id', 'intake_full_id'],
        });
        console.log('Treatment plan found:', treatmentPlan ? 'Yes' : 'No');
        console.log('Treatment plan intake_full_id:', treatmentPlan?.intake_full_id);
        if (!treatmentPlan) {
            console.log('ERROR: Treatment plan not found');
            const customError = new CustomError_1.CustomError(404, 'General', 'Treatment plan not found');
            return next(customError);
        }
        const existingReport = await reportRepo.findOne({
            where: {
                treatment_plan_id,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                deleted_at: null,
            },
        });
        if (existingReport && existingReport.status === SixMonthReport_1.ReportStatus.COMPLETED) {
            const customError = new CustomError_1.CustomError(409, 'General', 'Report already exists for this period');
            return next(customError);
        }
        const report = existingReport || reportRepo.create();
        report.treatment_plan_id = treatment_plan_id;
        report.intake_id = treatmentPlan.intake_full_id;
        report.report_type = report_type;
        report.start_date = new Date(start_date);
        report.end_date = new Date(end_date);
        report.period = period;
        report.generated_by_id = req.jwtPayload.id;
        report.status = SixMonthReport_1.ReportStatus.GENERATING;
        await reportRepo.save(report);
        generateReportData(report.id).catch(error => {
            console.error('Report generation failed:', error);
            reportRepo.update(report.id, { status: SixMonthReport_1.ReportStatus.FAILED });
        });
        res.customSuccess(200, 'Report generation started', {
            report_id: report.id,
            status: report.status,
            message: 'Report is being generated. Check status for updates.',
        });
    }
    catch (error) {
        console.error('=== SIX MONTH REPORT GENERATION ERROR ===');
        console.error('Error:', error);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        const customError = new CustomError_1.CustomError(500, 'General', 'Failed to generate report');
        return next(customError);
    }
};
exports.generateSixMonthReport = generateSixMonthReport;
async function generateReportData(reportId) {
    console.log('=== GENERATING REPORT DATA ===');
    console.log('Report ID:', reportId);
    const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
    const visitRepo = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
    const behaviorRepo = (0, typeorm_1.getRepository)(behaviorManagement_1.BehaviorManagement);
    const goalRepo = (0, typeorm_1.getRepository)(treatmentGoal_1.TreatmentGoal);
    const concernRepo = (0, typeorm_1.getRepository)(concernAndChallenges_1.ConcernAndChallenges);
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
    const visits = await visitRepo.find({
        where: {
            intake_full_id: report.intake_id,
            date_of_visit: (0, typeorm_1.Between)(report.start_date, report.end_date),
            deleted_at: null,
        },
        relations: ['sessionHighlights', 'selfManagement', 'communication', 'concernAndChallenges', 'socialization'],
        order: { date_of_visit: 'ASC' },
    });
    console.log('Visits found:', visits.length);
    const visitIds = visits.map(v => v.id);
    let behaviors = [];
    if (visitIds.length > 0) {
        behaviors = await behaviorRepo.find({
            where: {
                visit_full_form_id: (0, typeorm_1.In)(visitIds),
                deleted_at: null,
            },
        });
    }
    console.log('Behaviors found:', behaviors.length);
    const goals = await goalRepo.find({
        where: {
            intake_full_id: report.intake_id,
            deleted_at: null,
        },
    });
    console.log('Goals found:', goals.length);
    let concerns = [];
    if (visitIds.length > 0) {
        concerns = await concernRepo.find({
            where: {
                visit_full_form_id: (0, typeorm_1.In)(visitIds),
                deleted_at: null,
            },
        });
    }
    console.log('Concerns found:', concerns.length);
    const completedVisits = visits.filter(v => v.status === genericEnums_1.Status.COMPLETED || v.status === genericEnums_1.Status.APPROVED);
    const totalHours = visits.reduce((acc, visit) => {
        if (visit.start_time && visit.end_time) {
            const start = new Date(`1970-01-01T${visit.start_time}`);
            const end = new Date(`1970-01-01T${visit.end_time}`);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return acc + (hours > 0 ? hours : 0);
        }
        return acc;
    }, 0);
    const behaviorCounts = {};
    const interventions = new Set();
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
    const goalsAchieved = goals.filter(g => g.goal_status === 'achieved' || g.goal_status === 'mastered').length;
    const goalsInProgress = goals.filter(g => g.goal_status === 'in_progress' || g.goal_status === 'ongoing').length;
    const goalsNotStarted = goals.filter(g => g.goal_status === 'not_started' || !g.goal_status).length;
    const keyAchievements = goals
        .filter(g => g.goal_status === 'achieved' || g.goal_status === 'mastered')
        .map(g => g.short_term_objective || g.target_skill)
        .filter(Boolean)
        .slice(0, 5);
    const areasOfConcern = concerns
        .filter(c => c.was_there_any_concerns_or_challenges)
        .map(c => c.describe_circumstances_involved)
        .filter(Boolean)
        .slice(0, 5);
    const executiveSummary = {
        total_visits: completedVisits.length,
        total_hours: Math.round(totalHours * 10) / 10,
        key_achievements: keyAchievements.length > 0 ? keyAchievements : ['Data collection in progress'],
        areas_of_concern: areasOfConcern.length > 0 ? areasOfConcern : ['No significant concerns reported'],
        overall_progress: goals.length > 0
            ? `${goalsAchieved} of ${goals.length} goals achieved (${Math.round((goalsAchieved / goals.length) * 100)}%)`
            : 'Goal tracking in progress',
    };
    const behavioralManagement = {
        behaviors: sortedBehaviors.map(([behavior, frequency]) => ({
            behavior,
            frequency,
            interventions: Array.from(interventions).slice(0, 3),
            outcomes: ['Documented in session notes'],
            trend: 'stable',
        })),
        most_frequent_behaviors: sortedBehaviors.map(([b]) => b),
        successful_interventions: Array.from(interventions).slice(0, 5),
        recommendations: behaviors.length > 0
            ? ['Continue monitoring behavioral patterns', 'Review intervention effectiveness']
            : ['No behaviors recorded in this period'],
    };
    const skillsProgress = {
        communication: {
            baseline: 0,
            current: visits.filter(v => v.communication_id).length,
            goals_met: goals.filter(g => g.goal_area === 'communication' && g.goal_status === 'achieved').map(g => g.target_skill).filter(Boolean),
            areas_for_improvement: goals.filter(g => g.goal_area === 'communication' && g.goal_status !== 'achieved').map(g => g.target_skill).filter(Boolean),
        },
        self_management: {
            baseline: 0,
            current: visits.filter(v => v.self_management_id).length,
            goals_met: goals.filter(g => g.goal_area === 'self_management' && g.goal_status === 'achieved').map(g => g.target_skill).filter(Boolean),
            areas_for_improvement: goals.filter(g => g.goal_area === 'self_management' && g.goal_status !== 'achieved').map(g => g.target_skill).filter(Boolean),
        },
        socialization: {
            baseline: 0,
            current: visits.filter(v => v.socialization_id).length,
            goals_met: goals.filter(g => g.goal_area === 'socialization' && g.goal_status === 'achieved').map(g => g.target_skill).filter(Boolean),
            areas_for_improvement: goals.filter(g => g.goal_area === 'socialization' && g.goal_status !== 'achieved').map(g => g.target_skill).filter(Boolean),
        },
        daily_living: {
            baseline: 0,
            current: visits.filter(v => v.domestic_skill_training_id || v.personal_care_and_bladder_control_id).length,
            goals_met: goals.filter(g => g.goal_area === 'daily_living' && g.goal_status === 'achieved').map(g => g.target_skill).filter(Boolean),
            areas_for_improvement: goals.filter(g => g.goal_area === 'daily_living' && g.goal_status !== 'achieved').map(g => g.target_skill).filter(Boolean),
        },
        behavioral_management: {
            baseline: 0,
            current: behaviors.length,
            goals_met: goals.filter(g => g.goal_area === 'behavior' && g.goal_status === 'achieved').map(g => g.target_skill).filter(Boolean),
            areas_for_improvement: goals.filter(g => g.goal_area === 'behavior' && g.goal_status !== 'achieved').map(g => g.target_skill).filter(Boolean),
        },
    };
    const visitAttendance = {
        total_scheduled: visits.length,
        total_attended: completedVisits.length,
        total_cancelled: visits.filter(v => v.status === genericEnums_1.Status.REJECTED).length,
        total_rescheduled: 0,
        attendance_rate: visits.length > 0
            ? Math.round((completedVisits.length / visits.length) * 1000) / 10
            : 0,
        cancellation_reasons: [],
    };
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
            .filter(Boolean),
    };
    const sessionHighlightsSummary = visits
        .filter(v => v.sessionHighlights)
        .slice(0, 10)
        .map(v => ({
        date: v.date_of_visit,
        highlights: [v.sessionHighlights?.location || 'Session completed'].filter(Boolean),
        activities: [v.sessionHighlights?.level_of_compliance ? `Compliance: ${v.sessionHighlights.level_of_compliance}` : 'Activities documented'].filter(Boolean),
        outcomes: ['Session notes recorded'],
    }));
    const concernsAndChallengesSummary = concerns
        .filter(c => c.was_there_any_concerns_or_challenges)
        .map(c => ({
        date: c.created_at,
        concern: c.describe_circumstances_involved || 'Concern documented',
        severity: 'medium',
        action_taken: c.supervisor_to_contact_during_session ? 'Supervisor contacted' : 'Documented for review',
        follow_up_needed: c.supervisor_to_contact_during_session || false,
        resolution_status: 'ongoing',
    }));
    const recommendations = generateRecommendations(visits, behaviors, goals, concerns);
    const nextPeriodGoals = goals
        .filter(g => g.goal_status !== 'achieved' && g.goal_status !== 'mastered')
        .map(g => g.short_term_objective || g.target_skill)
        .filter(Boolean)
        .slice(0, 5)
        .join('; ') || 'Continue working on current goals';
    console.log('=== REPORT DATA GENERATION COMPLETE ===');
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
        status: SixMonthReport_1.ReportStatus.COMPLETED,
        updated_at: new Date(),
    });
}
function generateRecommendations(visits, behaviors, goals, concerns) {
    const recommendations = [];
    const completedVisits = visits.filter(v => v.status === genericEnums_1.Status.COMPLETED || v.status === genericEnums_1.Status.APPROVED);
    const attendanceRate = visits.length > 0 ? (completedVisits.length / visits.length) * 100 : 0;
    if (attendanceRate < 80) {
        recommendations.push('Focus on improving session attendance rate to at least 80%.');
    }
    else if (attendanceRate >= 90) {
        recommendations.push('Excellent attendance maintained. Continue current scheduling approach.');
    }
    if (behaviors.length > 10) {
        recommendations.push('Consider reviewing behavioral intervention strategies due to high frequency of behavioral incidents.');
    }
    else if (behaviors.length === 0) {
        recommendations.push('Continue current behavioral management approach - no significant incidents reported.');
    }
    const goalsAchieved = goals.filter(g => g.goal_status === 'achieved' || g.goal_status === 'mastered').length;
    const achievementRate = goals.length > 0 ? (goalsAchieved / goals.length) * 100 : 0;
    if (achievementRate < 50 && goals.length > 0) {
        recommendations.push('Review and potentially adjust goal difficulty or intervention strategies.');
    }
    else if (achievementRate >= 75) {
        recommendations.push('Strong goal achievement rate. Consider introducing more challenging objectives.');
    }
    const significantConcerns = concerns.filter(c => c.was_there_any_concerns_or_challenges);
    if (significantConcerns.length > 5) {
        recommendations.push('Multiple concerns documented. Schedule team review meeting to address recurring issues.');
    }
    if (recommendations.length === 0) {
        recommendations.push('Continue current intervention strategies and maintain consistent session delivery.');
    }
    return recommendations.join(' ');
}
//# sourceMappingURL=generateReportSimple.js.map