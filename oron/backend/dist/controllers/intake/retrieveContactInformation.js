"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveContactInformation = void 0;
const typeorm_1 = require("typeorm");
const emergencyContactInformation_1 = require("orm/entities/IntakeForm/emergencyContactInformation");
const fatherContactInformation_1 = require("orm/entities/IntakeForm/fatherContactInformation");
const motherContactInformation_1 = require("orm/entities/IntakeForm/motherContactInformation");
const schoolContactInformation_1 = require("orm/entities/IntakeForm/schoolContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveContactInformation = async (req, res, next) => {
    const fatherContactInformationRepository = (0, typeorm_1.getRepository)(fatherContactInformation_1.FatherContactInformation);
    const motherInformationRepository = (0, typeorm_1.getRepository)(motherContactInformation_1.MotherContactInformation);
    const emergencyContactInformationRepository = (0, typeorm_1.getRepository)(emergencyContactInformation_1.IntakeEmergencyContactInformation);
    const schoolContactInformationRepository = (0, typeorm_1.getRepository)(schoolContactInformation_1.SchoolContactInformation);
    const user_id = req.user.id;
    try {
        const savedFatherInformation = (await fatherContactInformationRepository.findOne({ where: { user_id } })) || {};
        const savedMotherInformation = (await motherInformationRepository.findOne({ where: { user_id } })) || {};
        const savedEmergencyContactInformation = (await emergencyContactInformationRepository.findOne({
            where: { user_id },
        })) || {};
        const savedSchoolContactInformation = (await schoolContactInformationRepository.findOne({ where: { user_id } })) || {};
        return res.customSuccess(200, 'Father Contact Information successfully retrieved.', {
            father: savedFatherInformation,
            mother: savedMotherInformation,
            emergency: savedEmergencyContactInformation,
            school: savedSchoolContactInformation,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error retrieving contact information', null, err);
        return next(customError);
    }
};
exports.retrieveContactInformation = retrieveContactInformation;
//# sourceMappingURL=retrieveContactInformation.js.map