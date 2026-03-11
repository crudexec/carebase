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
            const customError = new CustomError_1.CustomError(400, 'General', 'Report ID is required');
            return next(customError);
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
            const customError = new CustomError_1.CustomError(404, 'General', 'Report not found');
            return next(customError);
        }
        const intake = await intakeRepo.findOne({
            where: { id: report.intake_id },
        });
        let client = null;
        if (intake && intake.client_information_id) {
            client = await clientRepo.findOne({
                where: { id: intake.client_information_id },
            });
        }
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
                gender: client?.sex || 'N/A',
            },
            executive_summary: report.executive_summary,
            behavioral_management: report.behavioral_management,
            significant_events: report.significant_life_events,
            skills_progress: report.skills_progress,
            session_highlights: report.session_highlights_summary,
            concerns_challenges: report.concerns_and_challenges_summary,
            visit_attendance: report.visit_attendance,
            goals_assessment: report.goals_assessment,
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
        const customError = new CustomError_1.CustomError(500, 'General', 'Failed to export report');
        return next(customError);
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
          
          ${data.executive_summary.key_achievements?.length > 0 ? `
          <p><span class="label">Key Achievements:</span></p>
          <ul>
            ${data.executive_summary.key_achievements.map(a => `<li>${a}</li>`).join('')}
          </ul>
          ` : ''}
          
          ${data.executive_summary.areas_of_concern?.length > 0 ? `
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
            <td>${progress.current - progress.baseline > 0 ? '+' : ''}${progress.current - progress.baseline}%</td>
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
//# sourceMappingURL=exportReportSimple.js.map