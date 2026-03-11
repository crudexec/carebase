"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveEmergencyContactInformation = void 0;
const typeorm_1 = require("typeorm");
const emergencyContactInformation_1 = require("orm/entities/IntakeForm/emergencyContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveEmergencyContactInformation = async (req, res, next) => {
    const emergencyContactInformationRepository = (0, typeorm_1.getRepository)(emergencyContactInformation_1.IntakeEmergencyContactInformation);
    const user_id = req.user.id;
    try {
        const emergencyContactInformation = await emergencyContactInformationRepository.findOne({ where: { user_id } });
        if (emergencyContactInformation) {
            return res.customSuccess(200, 'Emergency Contact Information successfully retrieved.', emergencyContactInformation);
        }
        else {
            return res.customSuccess(200, 'Emergency Contact Information has not been filled', null);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveEmergencyContactInformation = retrieveEmergencyContactInformation;
//# sourceMappingURL=retrieveEmergencyInformation.js.map