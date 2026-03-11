"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCJISPreRegistrationForm = void 0;
const typeorm_1 = require("typeorm");
const cjisFullForm_1 = require("orm/entities/CJISForm/cjisFullForm");
const cjisPreRegistration_1 = require("orm/entities/CJISForm/cjisPreRegistration");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addCJISPreRegistrationForm = async (req, res, next) => {
    const { pre_registration_pdf_url } = req.body;
    try {
        const preRegistrationRepository = (0, typeorm_1.getRepository)(cjisPreRegistration_1.CJISPreRegistrationForm);
        const cjisFullFormRepository = (0, typeorm_1.getRepository)(cjisFullForm_1.CJISFullForm);
        const user_id = req.user.id;
        const preRegistration = await preRegistrationRepository.findOne({ where: { user_id } });
        if (preRegistration) {
            const customError = new CustomError_1.CustomError(400, 'General', 'CJIS Pre Registration Form already exists', [
                `CJIS Pre Registration Form already exists`,
            ]);
            return next(customError);
        }
        const newCJISPreRegistration = new cjisPreRegistration_1.CJISPreRegistrationForm();
        newCJISPreRegistration.user_id = user_id;
        newCJISPreRegistration.pre_registration_pdf_url = pre_registration_pdf_url;
        const savedCJISPreRegistration = await preRegistrationRepository.save(newCJISPreRegistration);
        if (savedCJISPreRegistration) {
            const newCJISForm = new cjisFullForm_1.CJISFullForm();
            const cjisForm = await cjisFullFormRepository.findOne({ where: { user_id } });
            if (cjisForm) {
                newCJISForm.pre_registration_id = savedCJISPreRegistration.id;
                newCJISForm.status = genericEnums_1.Status.IN_PROGRESS;
                await cjisFullFormRepository.update(cjisForm.id, newCJISForm);
                return res.customSuccess(200, 'CJIS Pre Registration Form successfully created.', savedCJISPreRegistration);
            }
            newCJISForm.pre_registration_id = savedCJISPreRegistration.id;
            newCJISForm.status = genericEnums_1.Status.IN_PROGRESS;
            await cjisFullFormRepository.save(newCJISForm);
            return res.customSuccess(200, 'CJIS Pre Registration Form successfully created.', savedCJISPreRegistration);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addCJISPreRegistrationForm = addCJISPreRegistrationForm;
//# sourceMappingURL=addPreRegistrationForm.js.map