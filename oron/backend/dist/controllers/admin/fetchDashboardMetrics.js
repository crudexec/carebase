"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDashboardMetrics = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const User_1 = require("orm/entities/User");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const types_1 = require("orm/entities/types");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fetchDashboardMetrics = async (req, res, next) => {
    const intakeRepository = (0, typeorm_1.getRepository)(intakeFullForm_1.IntakeFullForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const visitRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
    try {
        const [clientsCount, employeesCount, pendingVisitsCount, recentSubmissionsCount] = await Promise.all([
            intakeRepository.count({
                where: { status: (0, typeorm_1.Not)(genericEnums_1.IntakeFormStatus.Disengage) },
            }),
            userRepository.count({
                where: { role: types_1.Role.STANDARD },
            }),
            visitRepository.count({
                where: { status: genericEnums_1.Status.AWAITING_APPROVAL },
            }),
            visitRepository
                .createQueryBuilder('visit')
                .where('visit.created_at >= NOW() - INTERVAL \'7 days\'')
                .andWhere('visit.status != :draft', { draft: genericEnums_1.Status.DRAFT })
                .getCount(),
        ]);
        const metrics = {
            totalClients: clientsCount,
            totalEmployees: employeesCount,
            pendingApprovals: pendingVisitsCount,
            recentSubmissions: recentSubmissionsCount,
        };
        return res.customSuccess(200, 'Dashboard metrics fetched successfully', metrics);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error fetching dashboard metrics', null, err);
        return next(customError);
    }
};
exports.fetchDashboardMetrics = fetchDashboardMetrics;
//# sourceMappingURL=fetchDashboardMetrics.js.map