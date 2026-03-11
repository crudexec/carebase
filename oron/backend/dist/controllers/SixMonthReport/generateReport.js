"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSixMonthReport = void 0;
const typeorm_1 = require("typeorm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const SixMonthReport_1 = require("orm/entities/SixMonthReport/SixMonthReport");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const behaviorManagement_1 = require("orm/entities/VisitLog/stepOne/behaviorManagement");
const concernAndChallenges_1 = require("orm/entities/VisitLog/stepOne/concernAndChallenges");
const sessionHighlights_1 = require("orm/entities/VisitLog/stepOne/sessionHighlights");
const communication_1 = require("orm/entities/VisitLog/stepOne/communication");
const selfManagement_1 = require("orm/entities/VisitLog/stepOne/selfManagement");
const socialization_1 = require("orm/entities/VisitLog/stepTwo/socialization");
const genericEnums_1 = require("types/genericEnums");
const generateSixMonthReport = async (req, res, next) => {
    try {
        console.log('=== SIX MONTH REPORT GENERATION STARTED ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User ID:', req.jwtPayload?.id);
        const { treatment_plan_id, start_date, end_date, report_type, period = 'custom', } = req.body;
        if (!treatment_plan_id || !start_date || !end_date || !report_type) {
            console.log('ERROR: Missing required fields', { treatment_plan_id, start_date, end_date, report_type });
            return next(new CustomError_1.CustomError(400, 'General', 'Missing required fields'));
        }
        console.log('Validating report type:', report_type);
        console.log('Valid types:', Object.values(genericEnums_1.TreatmentPlanType));
        if (!Object.values(genericEnums_1.TreatmentPlanType).includes(report_type)) {
            console.log('ERROR: Invalid report type');
            return next(new CustomError_1.CustomError(400, 'General', 'Invalid report type'));
        }
        console.log('Getting repositories...');
        const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
        const treatmentRepo = (0, typeorm_1.getRepository)(treatmentFullPlan_1.TreatmentFullPlan);
        const visitRepo = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const behaviorRepo = (0, typeorm_1.getRepository)(behaviorManagement_1.BehaviorManagement);
        const concernRepo = (0, typeorm_1.getRepository)(concernAndChallenges_1.ConcernAndChallenges);
        const sessionRepo = (0, typeorm_1.getRepository)(sessionHighlights_1.SessionHighlights);
        const communicationRepo = (0, typeorm_1.getRepository)(communication_1.Communication);
        const selfManagementRepo = (0, typeorm_1.getRepository)(selfManagement_1.SelfManagement);
        const socializationRepo = (0, typeorm_1.getRepository)(socialization_1.Socialization);
        console.log('Looking for treatment plan:', treatment_plan_id);
        const treatmentPlan = await treatmentRepo.findOne({
            where: { id: treatment_plan_id },
            relations: ['intakeFullForm'],
        });
        console.log('Treatment plan found:', treatmentPlan ? 'Yes' : 'No');
        console.log('Treatment plan intake_full_id:', treatmentPlan?.intake_full_id);
        if (!treatmentPlan) {
            console.log('ERROR: Treatment plan not found');
            return next(new CustomError_1.CustomError(404, 'General', 'Treatment plan not found'));
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
            return next(new CustomError_1.CustomError(409, 'General', 'Report already exists for this period'));
        }
        console.log('Creating/updating report...');
        const report = existingReport || reportRepo.create();
        report.treatment_plan_id = treatment_plan_id;
        report.intake_id = treatmentPlan.intake_full_id;
        report.report_type = report_type;
        report.start_date = new Date(start_date);
        report.end_date = new Date(end_date);
        report.period = period;
        report.generated_by_id = req.jwtPayload.id;
        report.status = SixMonthReport_1.ReportStatus.GENERATING;
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
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        return next(new CustomError_1.CustomError(500, 'General', 'Failed to generate report'));
    }
};
exports.generateSixMonthReport = generateSixMonthReport;
async function generateReportData(reportId) {
    const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
    const visitRepo = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
    const behaviorRepo = (0, typeorm_1.getRepository)(behaviorManagement_1.BehaviorManagement);
    const concernRepo = (0, typeorm_1.getRepository)(concernAndChallenges_1.ConcernAndChallenges);
    const sessionRepo = (0, typeorm_1.getRepository)(sessionHighlights_1.SessionHighlights);
    const report = await reportRepo.findOne({
        where: { id: reportId },
        relations: ['treatmentPlan', 'intake'],
    });
    if (!report) {
        throw new Error('Report not found');
    }
    const visits = await visitRepo.find({
        where: {
            treatment_plan_id: report.treatment_plan_id,
            created_at: (0, typeorm_1.Between)(report.start_date, report.end_date),
            status: genericEnums_1.Status.SUBMITTED,
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
    const behaviorIds = visits.flatMap(v => v.behavior_management_ids || []);
    const behaviors = behaviorIds.length > 0
        ? await behaviorRepo.find({ where: { id: (0, typeorm_1.In)(behaviorIds) } })
        : [];
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
    const skillsProgress = {
        communication: calculateSkillProgress(visits, 'communication'),
        self_management: calculateSkillProgress(visits, 'selfManagement'),
        socialization: calculateSkillProgress(visits, 'socialization'),
        daily_living: calculateDailyLivingProgress(visits),
        behavioral_management: calculateBehaviorProgress(behaviors),
    };
    const visitAttendance = {
        total_scheduled: visits.length,
        total_attended: visits.filter(v => v.status === genericEnums_1.Status.SUBMITTED).length,
        total_cancelled: visits.filter(v => v.status === genericEnums_1.Status.REJECTED).length,
        total_rescheduled: 0,
        attendance_rate: visits.length > 0
            ? (visits.filter(v => v.status === genericEnums_1.Status.SUBMITTED).length / visits.length) * 100
            : 0,
        cancellation_reasons: [],
    };
    const goalsAssessment = await calculateGoalsAssessment(report.treatment_plan_id);
    const executiveSummary = {
        total_visits: visits.length,
        total_hours: visits.length * 2,
        key_achievements: extractKeyAchievements(visits, skillsProgress),
        areas_of_concern: extractAreasOfConcern(concernsAndChallenges, behaviorFrequency),
        overall_progress: determineOverallProgress(skillsProgress, goalsAssessment),
    };
    const behavioralManagement = {
        behaviors: Object.keys(behaviorFrequency).map(behavior => ({
            behavior,
            frequency: behaviorFrequency[behavior],
            interventions: Array.from(behaviorInterventions[behavior] || []),
            outcomes: (behaviorOutcomes[behavior] || []),
            trend: determineBehaviorTrend(behaviorOutcomes[behavior] || []),
        })),
        most_frequent_behaviors: Object.keys(behaviorFrequency)
            .sort((a, b) => behaviorFrequency[b] - behaviorFrequency[a])
            .slice(0, 5),
        successful_interventions: extractSuccessfulInterventions(behaviorInterventions, behaviorOutcomes),
        recommendations: generateBehaviorRecommendations(behaviorFrequency, behaviorOutcomes),
    };
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
        status: SixMonthReport_1.ReportStatus.COMPLETED,
        updated_at: new Date(),
    });
}
function determineSeverity(concern) {
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
function calculateSkillProgress(visits, skillType) {
    const baseline = 50;
    let totalProgress = 0;
    let count = 0;
    visits.forEach(visit => {
        if (visit[skillType]) {
            totalProgress += 10;
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
function calculateDailyLivingProgress(visits) {
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
function calculateBehaviorProgress(behaviors) {
    const baseline = 50;
    const positiveOutcomes = behaviors.filter(b => b.outcome && b.outcome.toLowerCase().includes('improve')).length;
    const current = Math.min(100, baseline + (positiveOutcomes * 5));
    return {
        baseline,
        current,
        goals_met: current >= 70 ? ['Behavior management successful'] : [],
        areas_for_improvement: current < 70 ? ['Continued intervention needed'] : [],
    };
}
function determineBehaviorTrend(outcomes) {
    if (outcomes.length === 0)
        return 'stable';
    const positiveCount = outcomes.filter(o => o.toLowerCase().includes('improve') || o.toLowerCase().includes('better')).length;
    const ratio = positiveCount / outcomes.length;
    if (ratio > 0.6)
        return 'improving';
    if (ratio < 0.3)
        return 'declining';
    return 'stable';
}
function extractKeyAchievements(visits, skillsProgress) {
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
function extractAreasOfConcern(concerns, behaviorFrequency) {
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
function determineOverallProgress(skillsProgress, goalsAssessment) {
    const avgProgress = (skillsProgress.communication.current +
        skillsProgress.self_management.current +
        skillsProgress.socialization.current +
        skillsProgress.daily_living.current +
        skillsProgress.behavioral_management.current) / 5;
    if (avgProgress >= 80)
        return 'Excellent progress';
    if (avgProgress >= 60)
        return 'Good progress';
    if (avgProgress >= 40)
        return 'Moderate progress';
    return 'Limited progress';
}
function extractSuccessfulInterventions(interventions, outcomes) {
    const successful = [];
    Object.keys(interventions).forEach(behavior => {
        const behaviorOutcomes = outcomes[behavior] || [];
        const successRate = behaviorOutcomes.filter((o) => o.toLowerCase().includes('improve') || o.toLowerCase().includes('success')).length / behaviorOutcomes.length;
        if (successRate > 0.5) {
            Array.from(interventions[behavior]).forEach((intervention) => {
                if (!successful.includes(intervention)) {
                    successful.push(intervention);
                }
            });
        }
    });
    return successful.slice(0, 5);
}
function generateBehaviorRecommendations(frequency, outcomes) {
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
function generateRecommendations(summary, behavioral, skills) {
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
function generateNextPeriodGoals(skills, behavioral) {
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
async function calculateGoalsAssessment(treatmentPlanId) {
    return {
        goals_set: 10,
        goals_achieved: 6,
        goals_in_progress: 3,
        goals_not_started: 1,
        achievement_rate: 60,
        revised_goals: [],
    };
}
//# sourceMappingURL=generateReport.js.map