"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillPneumococcalVaccinationInformation = void 0;
const typeorm_1 = require("typeorm");
const pneumococcalFullForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm");
const pneumococcalVaccinationForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalVaccinationForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fillPneumococcalVaccinationInformation = async (req, res, next) => {
    const { had_pneumococcal_vaccination, declined_pneumococcal_vaccination, received_pneumococcal_vaccination, medical_contraindication, religious_beliefs, other, } = req.body;
    const pneumococcalVaccinationFormRepository = (0, typeorm_1.getRepository)(pneumococcalVaccinationForm_1.PneumococcalVaccinationForm);
    const pneumococcalVaccinationFullFormRepository = (0, typeorm_1.getRepository)(pneumococcalFullForm_1.PneumococcalVaccinationFullForm);
    const user_id = req.user.id;
    try {
        const pneumococcalVaccinationForm = await pneumococcalVaccinationFormRepository.findOne({ where: { user_id } });
        if (pneumococcalVaccinationForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'User pneumococcal vaccination information already exists for the pneumococcal form', [`Pneumococcal vaccination information already exists`]);
            return next(customError);
        }
        const newPneumococcalVaccinationForm = new pneumococcalVaccinationForm_1.PneumococcalVaccinationForm();
        newPneumococcalVaccinationForm.had_pneumococcal_vaccination = had_pneumococcal_vaccination;
        newPneumococcalVaccinationForm.declined_pneumococcal_vaccination = declined_pneumococcal_vaccination;
        newPneumococcalVaccinationForm.received_pneumococcal_vaccination = received_pneumococcal_vaccination;
        newPneumococcalVaccinationForm.medical_contraindication = medical_contraindication;
        newPneumococcalVaccinationForm.religious_beliefs = religious_beliefs;
        newPneumococcalVaccinationForm.other = other;
        newPneumococcalVaccinationForm.user_id = user_id;
        const savedPneumococcalVaccinationForm = await pneumococcalVaccinationFormRepository.save(newPneumococcalVaccinationForm);
        if (savedPneumococcalVaccinationForm) {
            const pneumococcalVaccinationFullForm = await pneumococcalVaccinationFullFormRepository.findOne({
                where: { user_id },
            });
            if (pneumococcalVaccinationFullForm) {
                pneumococcalVaccinationFullForm.pneumococcal_vaccination_form_id = savedPneumococcalVaccinationForm.id;
                pneumococcalVaccinationFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await pneumococcalVaccinationFullFormRepository.save(pneumococcalVaccinationFullForm);
            }
            else {
                const newPneumococcalVaccinationFullForm = new pneumococcalFullForm_1.PneumococcalVaccinationFullForm();
                newPneumococcalVaccinationFullForm.user_id = user_id;
                newPneumococcalVaccinationFullForm.pneumococcal_vaccination_form_id = savedPneumococcalVaccinationForm.id;
                newPneumococcalVaccinationFullForm.status = genericEnums_1.Status.IN_PROGRESS;
                await pneumococcalVaccinationFullFormRepository.save(newPneumococcalVaccinationFullForm);
            }
        }
        return res.customSuccess(200, 'User pneumococcal vaccination information successfully created for the pneumococcal form.', savedPneumococcalVaccinationForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fillPneumococcalVaccinationInformation = fillPneumococcalVaccinationInformation;
//# sourceMappingURL=addPneumococcalVaccinationInformation.js.map