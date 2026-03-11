"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveAdmissionInformation = void 0;
const typeorm_1 = require("typeorm");
const admissionInformation_1 = require("orm/entities/IntakeForm/admissionInformation");
const waiverService_1 = require("orm/entities/IntakeForm/waiverService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveAdmissionInformation = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const admissionInformationRepository = (0, typeorm_1.getRepository)(admissionInformation_1.AdmissionInformation);
        const waiverServicesRepository = (0, typeorm_1.getRepository)(waiverService_1.WaiverServices);
        const admissionInformation = await admissionInformationRepository.findOne({ where: { user_id } });
        const waiverServices = await waiverServicesRepository.find({ where: { user_id } });
        return res.customSuccess(200, 'Admission Information successfully retrieved.', {
            admissionInformation,
            waiverServices,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveAdmissionInformation = retrieveAdmissionInformation;
//# sourceMappingURL=retrieveAdmissionInformation.js.map