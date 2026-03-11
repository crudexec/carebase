"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editBasicInformation = void 0;
const typeorm_1 = require("typeorm");
const BasicInformation_1 = require("orm/entities/SpecificNeedsForm/BasicInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editBasicInformation = async (req, res, next) => {
    let { participant_first_name, participant_last_name, participant_father_name, participant_mother_name, gender, date_of_birth, father_mobile_number, mother_mobile_number, home_address, basic_information_id, } = req.body;
    const basicInformationRepository = (0, typeorm_1.getRepository)(BasicInformation_1.SpecificNeedsBasicInformation);
    try {
        const basicInformation = await basicInformationRepository.findOne({ where: { id: basic_information_id } });
        if (basicInformation) {
            const newBasicInformation = new BasicInformation_1.SpecificNeedsBasicInformation();
            participant_first_name = participant_first_name ?? basicInformation.participant_first_name;
            participant_last_name = participant_last_name ?? basicInformation.participant_last_name;
            participant_father_name = participant_father_name ?? basicInformation.participant_father_name;
            participant_mother_name = participant_mother_name ?? basicInformation.participant_mother_name;
            gender = gender ?? basicInformation.gender;
            date_of_birth = date_of_birth ?? basicInformation.date_of_birth;
            father_mobile_number = father_mobile_number ?? basicInformation.father_mobile_number;
            mother_mobile_number = mother_mobile_number ?? basicInformation.mother_mobile_number;
            home_address = home_address ?? basicInformation.home_address;
            newBasicInformation.participant_first_name = participant_first_name;
            newBasicInformation.participant_last_name = participant_last_name;
            newBasicInformation.participant_father_name = participant_father_name;
            newBasicInformation.participant_mother_name = participant_mother_name;
            newBasicInformation.gender = gender;
            newBasicInformation.date_of_birth = date_of_birth;
            newBasicInformation.father_mobile_number = father_mobile_number;
            newBasicInformation.mother_mobile_number = mother_mobile_number;
            newBasicInformation.home_address = home_address;
            await basicInformationRepository.update({ id: basicInformation.id }, newBasicInformation);
            return res.customSuccess(200, 'Basic Information successfully updated.', newBasicInformation);
        }
        else {
            const customError = new CustomError_1.CustomError(400, 'General', 'Basic Information not found', [
                `Basic Information does not exist`,
            ]);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.editBasicInformation = editBasicInformation;
//# sourceMappingURL=editBasicInformation.js.map