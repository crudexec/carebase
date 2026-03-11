"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHepatitisBPersonalInformation = void 0;
const typeorm_1 = require("typeorm");
const HepatitisFullForm_1 = require("orm/entities/HepatitisBForm/HepatitisFullForm");
const personalInformation_1 = require("orm/entities/HepatitisBForm/personalInformation");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addHepatitisBPersonalInformation = async (req, res, next) => {
    const { first_name, last_name, job_title, date_of_filling_form } = req.body;
    const HepatitisBFullFormRepository = (0, typeorm_1.getRepository)(HepatitisFullForm_1.HepatitisBFullForm);
    const HepatitisBPersonalInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.PersonalInformationHepatitisBForm);
    const user_id = req.user.id;
    try {
        const personalInformation = await HepatitisBPersonalInformationRepository.findOne({ where: { user_id } });
        if (personalInformation) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Personal information already exists', [
                `Personal information already exists`,
            ]);
            return next(customError);
        }
        const newpersonalInformation = new personalInformation_1.PersonalInformationHepatitisBForm();
        newpersonalInformation.first_name = first_name;
        newpersonalInformation.last_name = last_name;
        newpersonalInformation.job_title = job_title;
        newpersonalInformation.date_of_filling_form = date_of_filling_form;
        newpersonalInformation.user_id = user_id;
        const savedPersonalInformation = await HepatitisBPersonalInformationRepository.save(newpersonalInformation);
        if (savedPersonalInformation) {
            const attestationForm = await HepatitisBFullFormRepository.findOne({ where: { user_id } });
            if (attestationForm) {
                attestationForm.personal_information_id = savedPersonalInformation.id;
                attestationForm.status = genericEnums_1.Status.IN_PROGRESS;
                await HepatitisBFullFormRepository.save(attestationForm);
            }
            else {
                const newAttestationForm = new HepatitisFullForm_1.HepatitisBFullForm();
                newAttestationForm.user_id = user_id;
                newAttestationForm.personal_information_id = savedPersonalInformation.id;
                newAttestationForm.status = genericEnums_1.Status.IN_PROGRESS;
                await HepatitisBFullFormRepository.save(newAttestationForm);
            }
        }
        return res.customSuccess(200, ' Personal Information successfully created.', savedPersonalInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.addHepatitisBPersonalInformation = addHepatitisBPersonalInformation;
//# sourceMappingURL=addHepatitisPersonalInformation.js.map