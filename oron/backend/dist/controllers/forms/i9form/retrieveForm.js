"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveI9Form = void 0;
const typeorm_1 = require("typeorm");
const citizenship_1 = require("orm/entities/i9Form/citizenship");
const document_1 = require("orm/entities/i9Form/document");
const i9form_1 = require("orm/entities/i9Form/i9form");
const personalInformation_1 = require("orm/entities/i9Form/personalInformation");
const signature_1 = require("orm/entities/i9Form/signature");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveI9Form = async (req, res, next) => {
    const user_id = req.user.id;
    try {
        const personalInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.PersonalInformation);
        const citizenshipRepository = (0, typeorm_1.getRepository)(citizenship_1.CitizenshipForm);
        const signatureRepository = (0, typeorm_1.getRepository)(signature_1.Signature);
        const documentRepository = (0, typeorm_1.getRepository)(document_1.Documents);
        const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
        const personalInformation = (await personalInformationRepository.findOne({ where: { user_id } })) || {};
        const citizenship = (await citizenshipRepository.findOne({ where: { owner: user_id } })) || {};
        const signature = (await signatureRepository.findOne({ where: { signed_by: user_id } })) || {};
        const documents = (await documentRepository.find({ where: { owner: user_id } })) || {};
        const i9Form = (await i9FormRepository.findOne({ where: { owner: user_id } })) || { status: genericEnums_1.Status.NOT_STARTED };
        return res.customSuccess(200, 'User I9 form data found', {
            personalInformation,
            citizenship,
            signature,
            documents,
            status: i9Form.status,
            i9Form,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveI9Form = retrieveI9Form;
//# sourceMappingURL=retrieveForm.js.map