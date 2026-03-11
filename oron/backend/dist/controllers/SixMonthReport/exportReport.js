"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReportToPDF = void 0;
const typeorm_1 = require("typeorm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const SixMonthReport_1 = require("orm/entities/SixMonthReport/SixMonthReport");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const clientInformation_1 = require("orm/entities/IntakeForm/clientInformation");
const exportReportToPDF = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        if (!reportId) {
            return next(new CustomError_1.CustomError(400, 'General', 'Report ID is required'));
        }
        const reportRepo = (0, typeorm_1.getRepository)(SixMonthReport_1.SixMonthReport);
        const intakeRepo = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
        const clientRepo = (0, typeorm_1.getRepository)(clientInformation_1.ClientInformation);
        const report = await reportRepo.findOne({
            where: {
                id: reportId,
                deleted_at: null,
            },
            relations: ['treatmentPlan', 'intake', 'generatedBy', 'finalizedBy'],
        });
        if (!report) {
            return next(new CustomError_1.CustomError(404, 'General', 'Report not found'));
        }
        const intake = await intakeRepo.findOne({
            where: { id: report.intake_id },
            relations: ['clientInformation'],
        });
        if (!intake || !intake.client_information_id) {
            return next(new CustomError_1.CustomError(404, 'General', 'Client information not found'));
        }
        const client = await clientRepo.findOne({
            where: { id: intake.client_information_id },
        });
        const pdfData = {
            report_info: {
                id: report.id,
                type: report.report_type,
                period: report.period,
                start_date: formatDate(report.start_date),
                end_date: formatDate(report.end_date),
                generated_date: formatDate(report.created_at),
                generated_by: report.generatedBy ?
                    `${report.generatedBy.first_name} ${report.generatedBy.last_name}` : 'Unknown',
                finalized_by: report.finalizedBy ?
                    `${report.finalizedBy.first_name} ${report.finalizedBy.last_name}` : null,
                finalized_date: report.finalized_at ? formatDate(report.finalized_at) : null,
            },
            client_info: {
                name: client ? `${client.first_name} ${client.last_name}` : 'Unknown',
                date_of_birth: client?.date_of_birth ? formatDate(client.date_of_birth) : 'N/A',
                client_id: client?.id || 'N/A',
                gender: client?.sex || 'N/A',
            },
            executive_summary: formatExecutiveSummary(report.executive_summary),
            behavioral_management: formatBehavioralManagement(report.behavioral_management),
            significant_events: formatSignificantEvents(report.significant_life_events),
            skills_progress: formatSkillsProgress(report.skills_progress),
            session_highlights: formatSessionHighlights(report.session_highlights_summary),
            concerns_challenges: formatConcernsChallenges(report.concerns_and_challenges_summary),
            visit_attendance: formatVisitAttendance(report.visit_attendance),
            goals_assessment: formatGoalsAssessment(report.goals_assessment),
            recommendations: report.recommendations,
            next_period_goals: report.next_period_goals,
            additional_notes: report.additional_notes,
            supervisor_comments: report.supervisor_comments,
        };
        const htmlContent = generateReportHTML(pdfData);
        res.customSuccess(200, 'Report exported successfully', {
            html: htmlContent,
            data: pdfData,
            filename: `SixMonthReport_${client?.first_name}_${client?.last_name}_${report.id.substring(0, 8)}.pdf`,
        });
    }
    catch (error) {
        console.error('Export error:', error);
        return next(new CustomError_1.CustomError(500, 'General', 'Failed to export report'));
    }
};
exports.exportReportToPDF = exportReportToPDF;
function formatDate(date) {
    if (!date)
        return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
function formatExecutiveSummary(summary) {
    if (!summary)
        return null;
    return {
        total_visits: summary.total_visits || 0,
        total_hours: summary.total_hours || 0,
        key_achievements: summary.key_achievements || [],
        areas_of_concern: summary.areas_of_concern || [],
        overall_progress: summary.overall_progress || 'Not assessed',
    };
}
function formatBehavioralManagement(behavioral) {
    if (!behavioral)
        return null;
    return {
        behaviors: (behavioral.behaviors || []).map(b => ({
            behavior: b.behavior,
            frequency: b.frequency,
            interventions: b.interventions || [],
            outcomes: b.outcomes || [],
            trend: b.trend || 'stable',
            trend_display: formatTrend(b.trend),
        })),
        most_frequent: behavioral.most_frequent_behaviors || [],
        successful_interventions: behavioral.successful_interventions || [],
        recommendations: behavioral.recommendations || [],
    };
}
function formatTrend(trend) {
    const trendMap = {
        'improving': '↑ Improving',
        'stable': '→ Stable',
        'declining': '↓ Declining',
    };
    return trendMap[trend] || trend;
}
function formatSignificantEvents(events) {
    if (!events || !Array.isArray(events))
        return [];
    return events.map(event => ({
        date: formatDate(event.date),
        event: event.event,
        category: event.category,
        category_display: formatCategory(event.category),
        impact: event.impact || 'Not specified',
        response: event.response || 'Not specified',
    }));
}
function formatCategory(category) {
    const categoryMap = {
        'concern': '⚠️ Concern',
        'challenge': '🔴 Challenge',
        'achievement': '✅ Achievement',
        'milestone': '🎯 Milestone',
    };
    return categoryMap[category] || category;
}
function formatSkillsProgress(skills) {
    if (!skills)
        return null;
    const formatSkill = (skill) => ({
        baseline: skill?.baseline || 0,
        current: skill?.current || 0,
        progress: skill?.current - skill?.baseline || 0,
        percentage_change: skill?.baseline ?
            ((skill.current - skill.baseline) / skill.baseline * 100).toFixed(1) : '0',
        goals_met: skill?.goals_met || [],
        areas_for_improvement: skill?.areas_for_improvement || [],
    });
    return {
        communication: formatSkill(skills.communication),
        self_management: formatSkill(skills.self_management),
        socialization: formatSkill(skills.socialization),
        daily_living: formatSkill(skills.daily_living),
        behavioral_management: formatSkill(skills.behavioral_management),
    };
}
function formatSessionHighlights(sessions) {
    if (!sessions || !Array.isArray(sessions))
        return [];
    return sessions.slice(0, 10).map(session => ({
        date: formatDate(session.date),
        highlights: session.highlights || [],
        activities: session.activities || [],
        outcomes: session.outcomes || [],
    }));
}
function formatConcernsChallenges(concerns) {
    if (!concerns || !Array.isArray(concerns))
        return [];
    return concerns.map(concern => ({
        date: formatDate(concern.date),
        concern: concern.concern,
        severity: concern.severity,
        severity_display: formatSeverity(concern.severity),
        action_taken: concern.action_taken || 'Not specified',
        follow_up_needed: concern.follow_up_needed ? 'Yes' : 'No',
        resolution_status: concern.resolution_status,
        status_display: formatResolutionStatus(concern.resolution_status),
    }));
}
function formatSeverity(severity) {
    const severityMap = {
        'low': '🟢 Low',
        'medium': '🟡 Medium',
        'high': '🔴 High',
    };
    return severityMap[severity] || severity;
}
function formatResolutionStatus(status) {
    const statusMap = {
        'resolved': '✅ Resolved',
        'ongoing': '🔄 Ongoing',
        'escalated': '⬆️ Escalated',
    };
    return statusMap[status] || status;
}
function formatVisitAttendance(attendance) {
    if (!attendance)
        return null;
    return {
        total_scheduled: attendance.total_scheduled || 0,
        total_attended: attendance.total_attended || 0,
        total_cancelled: attendance.total_cancelled || 0,
        total_rescheduled: attendance.total_rescheduled || 0,
        attendance_rate: attendance.attendance_rate ?
            `${attendance.attendance_rate.toFixed(1)}%` : '0%',
        cancellation_reasons: attendance.cancellation_reasons || [],
    };
}
function formatGoalsAssessment(goals) {
    if (!goals)
        return null;
    return {
        goals_set: goals.goals_set || 0,
        goals_achieved: goals.goals_achieved || 0,
        goals_in_progress: goals.goals_in_progress || 0,
        goals_not_started: goals.goals_not_started || 0,
        achievement_rate: goals.achievement_rate ?
            `${goals.achievement_rate.toFixed(1)}%` : '0%',
        revised_goals: goals.revised_goals || [],
    };
}
function generateReportHTML(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; page-break-inside: avoid; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; 
                        border-bottom: 2px solid #333; padding-bottom: 5px; }
        .subsection { margin-left: 20px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .info-item { margin-bottom: 5px; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .progress-bar { background-color: #f0f0f0; height: 20px; border-radius: 10px; }
        .progress-fill { background-color: #4CAF50; height: 100%; border-radius: 10px; }
        @media print { .section { page-break-inside: avoid; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Six-Month Summary Report</h1>
        <h2>${data.report_info.type.replace('_', ' ')}</h2>
        <p>${data.report_info.start_date} - ${data.report_info.end_date}</p>
      </div>

      <div class="section">
        <div class="section-title">Client Information</div>
        <div class="info-grid">
          <div class="info-item"><span class="label">Name:</span> ${data.client_info.name}</div>
          <div class="info-item"><span class="label">Date of Birth:</span> ${data.client_info.date_of_birth}</div>
          <div class="info-item"><span class="label">Client ID:</span> ${data.client_info.client_id}</div>
          <div class="info-item"><span class="label">Gender:</span> ${data.client_info.gender}</div>
        </div>
      </div>

      ${data.executive_summary ? `
      <div class="section">
        <div class="section-title">Executive Summary</div>
        <div class="subsection">
          <p><span class="label">Total Visits:</span> ${data.executive_summary.total_visits}</p>
          <p><span class="label">Total Hours:</span> ${data.executive_summary.total_hours}</p>
          <p><span class="label">Overall Progress:</span> ${data.executive_summary.overall_progress}</p>
          
          ${data.executive_summary.key_achievements.length > 0 ? `
          <p><span class="label">Key Achievements:</span></p>
          <ul>
            ${data.executive_summary.key_achievements.map(a => `<li>${a}</li>`).join('')}
          </ul>
          ` : ''}
          
          ${data.executive_summary.areas_of_concern.length > 0 ? `
          <p><span class="label">Areas of Concern:</span></p>
          <ul>
            ${data.executive_summary.areas_of_concern.map(a => `<li>${a}</li>`).join('')}
          </ul>
          ` : ''}
        </div>
      </div>
      ` : ''}

      ${data.skills_progress ? `
      <div class="section">
        <div class="section-title">Skills Progress</div>
        <table>
          <tr>
            <th>Skill Area</th>
            <th>Baseline</th>
            <th>Current</th>
            <th>Progress</th>
          </tr>
          ${Object.entries(data.skills_progress).map(([skill, progress]) => `
          <tr>
            <td>${skill.replace('_', ' ').charAt(0).toUpperCase() + skill.slice(1)}</td>
            <td>${progress.baseline}%</td>
            <td>${progress.current}%</td>
            <td>${progress.progress > 0 ? '+' : ''}${progress.progress}%</td>
          </tr>
          `).join('')}
        </table>
      </div>
      ` : ''}

      ${data.recommendations ? `
      <div class="section">
        <div class="section-title">Recommendations</div>
        <p>${data.recommendations.replace(/\n/g, '<br>')}</p>
      </div>
      ` : ''}

      ${data.next_period_goals ? `
      <div class="section">
        <div class="section-title">Goals for Next Period</div>
        <p>${data.next_period_goals.replace(/\n/g, '<br>')}</p>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Report Information</div>
        <p><span class="label">Generated By:</span> ${data.report_info.generated_by}</p>
        <p><span class="label">Generated Date:</span> ${data.report_info.generated_date}</p>
        ${data.report_info.finalized_by ? `
        <p><span class="label">Finalized By:</span> ${data.report_info.finalized_by}</p>
        <p><span class="label">Finalized Date:</span> ${data.report_info.finalized_date}</p>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}
//# sourceMappingURL=exportReport.js.map