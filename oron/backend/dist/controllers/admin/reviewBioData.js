"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewBioDataForm = void 0;
const typeorm_1 = require("typeorm");
const userBioData_1 = require("orm/entities/userBioData");
const genericEnums_1 = require("types/genericEnums");
const emailService_1 = require("utils/emailService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const ReviewBioDataForm = async (req, res, next) => {
    const userBioDataRepository = (0, typeorm_1.getRepository)(userBioData_1.UserBioData);
    const form_id = req.params.id;
    const { review_notes } = req.body;
    try {
        const userBioData = await userBioDataRepository.findOne({ where: { id: form_id } });
        if (!userBioData) {
            const customError = new CustomError_1.CustomError(404, 'General', `User BioData not found.`, ['User BioData not found.']);
            return next(customError);
        }
        await userBioDataRepository.update({ id: form_id }, { status: genericEnums_1.Status.REVIEWED, review_notes });
        await (0, emailService_1.SendReviewEmail)(userBioData.first_name, `Biodata Form`, review_notes, String(userBioData.email));
        return res.customSuccess(200, 'User BioData successfully reviewed', userBioData);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.ReviewBioDataForm = ReviewBioDataForm;
//# sourceMappingURL=reviewBioData.js.map