"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveFluFullForm = void 0;
const typeorm_1 = require("typeorm");
const fluFullForm_1 = require("orm/entities/FluForm/fluFullForm");
const fluSignatureForm_1 = require("orm/entities/FluForm/fluSignatureForm");
const personalInformation_1 = require("orm/entities/FluForm/personalInformation");
const vaccineAttestationForm_1 = require("orm/entities/FluForm/vaccineAttestationForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveFluFullForm = async (req, res, next) => {
    const user_id = req.user.id;
    const fluSignatureFormRepository = (0, typeorm_1.getRepository)(fluSignatureForm_1.FluSignatureForm);
    const fluFullFormRepository = (0, typeorm_1.getRepository)(fluFullForm_1.FluFullForm);
    const fluAttestationFormRepository = (0, typeorm_1.getRepository)(vaccineAttestationForm_1.FluAttestationForm);
    const fluEmployeeInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.FluEmployeeInformation);
    try {
        const fluFullForm = (await fluFullFormRepository.findOne({ where: { user_id } })) || { status: genericEnums_1.Status.NOT_STARTED };
        const fluSignatureForm = await fluSignatureFormRepository.findOne({ where: { signed_by: user_id } });
        const fluAttestationForm = await fluAttestationFormRepository.findOne({ where: { user_id } });
        const fluEmployeeInformation = await fluEmployeeInformationRepository.findOne({ where: { user_id } });
        return res.customSuccess(200, 'Flu full form successfully retrieved.', {
            fluFullForm,
            fluSignatureForm,
            fluAttestationForm,
            fluEmployeeInformation,
            status: fluFullForm.status,
        });
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveFluFullForm = retrieveFluFullForm;
//# sourceMappingURL=retrieveFluVaccinationForm.js.map