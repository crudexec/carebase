"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveReferenceForm = void 0;
const typeorm_1 = require("typeorm");
const reference_1 = require("orm/entities/ReferenceForm/reference");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveReferenceForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const referenceFormRepository = (0, typeorm_1.getRepository)(reference_1.ReferenceForm);
        const referenceForm = await referenceFormRepository.findOne({ where: { user_id } });
        if (!referenceForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Reference form does not exist', [
                `Reference form does not exist`,
            ]);
            return next(customError);
        }
        return res.customSuccess(200, 'Reference form successfully retrieved.', referenceForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error while retrieving reference form', null, err);
        return next(customError);
    }
};
exports.retrieveReferenceForm = retrieveReferenceForm;
//# sourceMappingURL=retrieveReferenceForm.js.map