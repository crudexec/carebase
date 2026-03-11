"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveFatherInformation = void 0;
const typeorm_1 = require("typeorm");
const fatherContactInformation_1 = require("orm/entities/IntakeForm/fatherContactInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveFatherInformation = async (req, res, next) => {
    const fatherContactInformationRepository = (0, typeorm_1.getRepository)(fatherContactInformation_1.FatherContactInformation);
    const user_id = req.user.id;
    try {
        const fatherInformation = await fatherContactInformationRepository.findOne({ where: { user_id } });
        if (fatherInformation) {
            return res.customSuccess(200, 'Father Contact Information successfully retrieved.', fatherInformation);
        }
        else {
            return res.customSuccess(200, 'Father Contact Information has not been filled', null);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveFatherInformation = retrieveFatherInformation;
//# sourceMappingURL=retrieveFatherContactInformation.js.map