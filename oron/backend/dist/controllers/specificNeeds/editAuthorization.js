"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editAuthorization = void 0;
const typeorm_1 = require("typeorm");
const Authorization_1 = require("../../orm/entities/SpecificNeedsForm/Authorization");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editAuthorization = async (req, res, next) => {
    try {
        const authorizationRepository = (0, typeorm_1.getRepository)(Authorization_1.Authorization);
        let { creator_name, signature_confirmation, authorization_id, signature_url } = req.body;
        const authorization = await authorizationRepository.findOne(authorization_id);
        if (!authorization) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Authorization not found', null);
            return next(customError);
        }
        creator_name = creator_name ?? authorization.creator_name;
        signature_confirmation = signature_confirmation ?? authorization.signature_confirmation;
        signature_url = signature_url ?? authorization.signature_url;
        authorization.creator_name = creator_name;
        authorization.signature_confirmation = signature_confirmation;
        authorization.signature_url = signature_url;
        const updatedAuthorization = await authorizationRepository.update(authorization_id, authorization);
        if (!updatedAuthorization) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Error updating authorization', null);
            return next(customError);
        }
        return res.customSuccess(200, 'Authorization updated successfully.', authorization);
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error updating authorization', error);
        return next(customError);
    }
};
exports.editAuthorization = editAuthorization;
//# sourceMappingURL=editAuthorization.js.map