"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editHepatitisBPersonalInformation = void 0;
const typeorm_1 = require("typeorm");
const personalInformation_1 = require("orm/entities/HepatitisBForm/personalInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editHepatitisBPersonalInformation = async (req, res, next) => {
    let { first_name, last_name, job_title } = req.body;
    const HepatitisBPersonalInformationRepository = (0, typeorm_1.getRepository)(personalInformation_1.PersonalInformationHepatitisBForm);
    const user_id = req.user.id;
    try {
        const personalInformation = await HepatitisBPersonalInformationRepository.findOne({ where: { user_id } });
        if (personalInformation) {
            first_name = first_name || personalInformation.first_name;
            last_name = last_name || personalInformation.last_name;
            job_title = job_title || personalInformation.job_title;
            const newpersonalInformation = new personalInformation_1.PersonalInformationHepatitisBForm();
            newpersonalInformation.first_name = first_name;
            newpersonalInformation.last_name = last_name;
            newpersonalInformation.job_title = job_title;
            await HepatitisBPersonalInformationRepository.update(personalInformation.id, newpersonalInformation);
            return res.customSuccess(200, 'Hepatitis B Personal Employee Form Successfully updated.', newpersonalInformation);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Personal information does not exist', [
                `Personal information does not exist`,
            ]);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editHepatitisBPersonalInformation = editHepatitisBPersonalInformation;
//# sourceMappingURL=editHepatitisBPersonalInformation.js.map