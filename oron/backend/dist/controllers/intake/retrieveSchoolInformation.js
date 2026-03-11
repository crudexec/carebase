"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveSchoolContactInformation = void 0;
const typeorm_1 = require("typeorm");
const schoolContactInformation_1 = require("orm/entities/IntakeForm/schoolContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveSchoolContactInformation = async (req, res, next) => {
    try {
        const schoolContactInformationRepository = (0, typeorm_1.getRepository)(schoolContactInformation_1.SchoolContactInformation);
        const user_id = req.user.id;
        const schoolContactInformation = await schoolContactInformationRepository.findOne({ where: { user_id } });
        if (schoolContactInformation) {
            return res.customSuccess(200, 'School Contact Information successfully retrieved.', schoolContactInformation);
        }
        else {
            return res.customSuccess(200, 'School Contact Information has not been filled', null);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error', null, err);
        return next(customError);
    }
};
exports.retrieveSchoolContactInformation = retrieveSchoolContactInformation;
//# sourceMappingURL=retrieveSchoolInformation.js.map