"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveMotherInformation = void 0;
const typeorm_1 = require("typeorm");
const motherContactInformation_1 = require("orm/entities/IntakeForm/motherContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveMotherInformation = async (req, res, next) => {
    const motherInformationRepository = (0, typeorm_1.getRepository)(motherContactInformation_1.MotherContactInformation);
    const user_id = req.user.id;
    try {
        const motherInformation = await motherInformationRepository.findOne({ where: { user_id } });
        if (motherInformation) {
            return res.customSuccess(200, 'Mother Contact Information successfully retrieved.', motherInformation);
        }
        else {
            return res.customSuccess(200, 'Mother Contact Information has not been filled', null);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveMotherInformation = retrieveMotherInformation;
//# sourceMappingURL=retrieveMotherInformation.js.map