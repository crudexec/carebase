"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPneumococcalVaccinationInformation = void 0;
const typeorm_1 = require("typeorm");
const pneumococcalVaccinationForm_1 = require("orm/entities/PneumoccalVaccinationForm/pneumococcalVaccinationForm");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editPneumococcalVaccinationInformation = async (req, res, next) => {
    let { had_pneumococcal_vaccination, declined_pneumococcal_vaccination, received_pneumococcal_vaccination, medical_contraindication, religious_beliefs, other, } = req.body;
    const pneumococcalVaccinationFormRepository = (0, typeorm_1.getRepository)(pneumococcalVaccinationForm_1.PneumococcalVaccinationForm);
    const user_id = req.user.id;
    try {
        const pneumococcalVaccinationForm = await pneumococcalVaccinationFormRepository.findOne({ where: { user_id } });
        if (pneumococcalVaccinationForm) {
            other = other ?? pneumococcalVaccinationForm.other;
            const newPneumococcalVaccinationForm = new pneumococcalVaccinationForm_1.PneumococcalVaccinationForm();
            newPneumococcalVaccinationForm.had_pneumococcal_vaccination = had_pneumococcal_vaccination;
            newPneumococcalVaccinationForm.declined_pneumococcal_vaccination = declined_pneumococcal_vaccination;
            newPneumococcalVaccinationForm.received_pneumococcal_vaccination = received_pneumococcal_vaccination;
            newPneumococcalVaccinationForm.medical_contraindication = medical_contraindication;
            newPneumococcalVaccinationForm.religious_beliefs = religious_beliefs;
            newPneumococcalVaccinationForm.other = other;
            await pneumococcalVaccinationFormRepository.update(pneumococcalVaccinationForm.id, newPneumococcalVaccinationForm);
            return res.customSuccess(200, 'User pneumococcal vaccination information successfully updated for the pneumococcal form.', newPneumococcalVaccinationForm);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'User pneumococcal vaccination information does not exist for the pneumococcal form', [`Pneumococcal vaccination information does not exist`]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editPneumococcalVaccinationInformation = editPneumococcalVaccinationInformation;
//# sourceMappingURL=editPneumococcalVaccinationInformation.js.map