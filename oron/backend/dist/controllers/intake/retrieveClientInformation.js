"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveClientInformation = void 0;
const typeorm_1 = require("typeorm");
const clientInformation_1 = require("orm/entities/IntakeForm/clientInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveClientInformation = async (req, res, next) => {
    const clientInformationRepository = (0, typeorm_1.getRepository)(clientInformation_1.ClientInformation);
    const user_id = req.user.id;
    try {
        const clientInformation = await clientInformationRepository.findOne({ where: { user_id } });
        if (clientInformation) {
            return res.customSuccess(200, 'Client Information successfully retrieved.', clientInformation);
        }
        else {
            return res.customSuccess(200, 'Client Information has not been filled', null);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveClientInformation = retrieveClientInformation;
//# sourceMappingURL=retrieveClientInformation.js.map