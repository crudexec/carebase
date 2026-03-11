"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveVisit = void 0;
const typeorm_1 = require("typeorm");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const User_1 = require("orm/entities/User");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ApproveVisit = async (req, res, next) => {
    const visitRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const visit_id = req.params.id;
    const admin_id = req.user.id;
    try {
        const visit = await visitRepository.findOne({
            where: { id: visit_id },
            relations: ['user'],
        });
        if (!visit) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Visit not found', ['Visit not found.']);
            return next(customError);
        }
        if (visit.status !== genericEnums_1.Status.AWAITING_APPROVAL) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Visit is not in awaiting approval status', [
                `Current status: ${visit.status}`,
            ]);
            return next(customError);
        }
        await visitRepository.update({ id: visit_id }, {
            status: genericEnums_1.Status.APPROVED,
            approved_by: admin_id,
            approved_at: new Date(),
        });
        const submitter = await userRepository.findOne({ where: { id: visit.registered_by } });
        if (submitter) {
            await (0, emailService_1.sendApproveMail)(submitter.first_name, 'Visit Note', String(submitter.email));
        }
        return res.customSuccess(200, 'Visit successfully approved.', visit);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error approving visit', null, err);
        return next(customError);
    }
};
exports.ApproveVisit = ApproveVisit;
//# sourceMappingURL=approveVisit.js.map