"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillCitizenshipInformation = void 0;
const typeorm_1 = require("typeorm");
const citizenship_1 = require("orm/entities/i9Form/citizenship");
const i9form_1 = require("orm/entities/i9Form/i9form");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fillCitizenshipInformation = async (req, res, next) => {
    const { citizenship_status, uscis_number, work_license_expiry_date, i_94_number, foreign_passport_number, foreign_passport_issuing_country, } = req.body;
    const citizenshipRepository = (0, typeorm_1.getRepository)(citizenship_1.CitizenshipForm);
    const i9FormRepository = (0, typeorm_1.getRepository)(i9form_1.I9Form);
    const owner = req.user.id;
    try {
        const citizenship = await citizenshipRepository.findOne({ where: { owner } });
        if (citizenship) {
            const customError = new CustomError_1.CustomError(400, 'General', 'User citizenship information already exists for the i9 form', [`Citizenship information already exists`]);
            return next(customError);
        }
        const newCitizenship = new citizenship_1.CitizenshipForm();
        newCitizenship.citizenship_status = citizenship_status;
        newCitizenship.uscis_number = uscis_number;
        newCitizenship.work_license_expiry_date = work_license_expiry_date;
        newCitizenship.i_94_number = i_94_number;
        newCitizenship.foreign_passport_number = foreign_passport_number;
        newCitizenship.foreign_passport_issuing_country = foreign_passport_issuing_country;
        newCitizenship.owner = owner;
        const savedCitizenship = await citizenshipRepository.save(newCitizenship);
        if (savedCitizenship) {
            const i9Form = await i9FormRepository.findOne({ where: { owner } });
            if (i9Form) {
                i9Form.citizenship_form_id = savedCitizenship.id;
                i9Form.status = genericEnums_1.Status.IN_PROGRESS;
                await i9FormRepository.save(i9Form);
            }
            else {
                const newI9Form = new i9form_1.I9Form();
                newI9Form.owner = owner;
                newI9Form.citizenship_form_id = savedCitizenship.id;
                newI9Form.status = genericEnums_1.Status.IN_PROGRESS;
                await i9FormRepository.save(newI9Form);
            }
        }
        return res.customSuccess(200, 'User citizenship data successfully created for the i9 form.', savedCitizenship);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fillCitizenshipInformation = fillCitizenshipInformation;
//# sourceMappingURL=addCitizenship.js.map