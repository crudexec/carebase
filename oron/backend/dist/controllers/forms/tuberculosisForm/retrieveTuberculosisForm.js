"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveTuberculosisForm = void 0;
const typeorm_1 = require("typeorm");
const ppdAdministrationForm_1 = require("orm/entities/Tuberculosis-MantouxForm/ppdAdministrationForm");
const tuberculosisFormSignature_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFormSignature");
const tuberculosisFullForm_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm");
const tuberculosisTestingForm_1 = require("orm/entities/Tuberculosis-MantouxForm/tuberculosisTestingForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveTuberculosisForm = async (req, res, next) => {
    const user_id = req.user.id;
    const tuberculosisFullFormRepository = (0, typeorm_1.getRepository)(tuberculosisFullForm_1.TuberculosisFullForm);
    const ppdAdministrationFormRepository = (0, typeorm_1.getRepository)(ppdAdministrationForm_1.PpdAdministrationForm);
    const tuberculosisSignatureFormRepository = (0, typeorm_1.getRepository)(tuberculosisFormSignature_1.TuberculosisSignatureForm);
    const tuberculosisMantouxFormRepository = (0, typeorm_1.getRepository)(tuberculosisTestingForm_1.TuberculosisMantouxForm);
    try {
        const tuberculosisFullForm = (await tuberculosisFullFormRepository.findOne({ where: { owner: user_id } })) || {
            status: genericEnums_1.Status.NOT_STARTED,
        };
        const tuberculosisSignatureForm = (await tuberculosisSignatureFormRepository.findOne({ where: { signed_by: user_id } })) || {};
        const tuberculosisMantouxRiskAssessmentForm = (await tuberculosisMantouxFormRepository.findOne({ where: { owner: user_id } })) || {};
        return res.customSuccess(200, 'Tuberculosis form successfully retrieved.', {
            status: tuberculosisFullForm.status,
            tuberculosisSignatureForm,
            tuberculosisMantouxRiskAssessmentForm,
            tuberculosisFullForm,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveTuberculosisForm = retrieveTuberculosisForm;
//# sourceMappingURL=retrieveTuberculosisForm.js.map