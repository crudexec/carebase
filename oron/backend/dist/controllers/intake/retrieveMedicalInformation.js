"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveMedicalInformation = void 0;
const typeorm_1 = require("typeorm");
const medicalInformation_1 = require("orm/entities/IntakeForm/medicalInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveMedicalInformation = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const medicalInformationRepository = (0, typeorm_1.getRepository)(medicalInformation_1.MedicalInformation);
        const medicalInformation = await medicalInformationRepository.findOne({ where: { user_id } });
        if (!medicalInformation) {
            return res.customSuccess(200, 'Medical Information has not been filled', null);
        }
        return res.customSuccess(200, 'Medical Information successfully retrieved.', medicalInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error', null, err);
        return next(customError);
    }
};
exports.retrieveMedicalInformation = retrieveMedicalInformation;
//# sourceMappingURL=retrieveMedicalInformation.js.map