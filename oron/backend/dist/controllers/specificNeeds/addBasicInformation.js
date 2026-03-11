"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBasicInformation = void 0;
const typeorm_1 = require("typeorm");
const SpecificNeedsFullForm_1 = require("../../orm/entities/SpecificNeedsForm/SpecificNeedsFullForm");
const BasicInformation_1 = require("orm/entities/SpecificNeedsForm/BasicInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const genericEnums_1 = require("types/genericEnums");
const addBasicInformation = async (req, res, next) => {
    try {
        const specificNeedsRepository = (0, typeorm_1.getRepository)(SpecificNeedsFullForm_1.SpecificNeedsFullForm);
        const basicInformationRepository = (0, typeorm_1.getRepository)(BasicInformation_1.SpecificNeedsBasicInformation);
        const registered_by = req.user.id;
        const { participant_first_name, participant_last_name, participant_father_name, participant_mother_name, gender, date_of_birth, father_mobile_number, mother_mobile_number, home_address, specific_needs_implemented_by, specific_needs_full_form_id, intake_full_id, } = req.body;
        const specificNeedsForm = await specificNeedsRepository.findOne({
            where: {
                id: specific_needs_full_form_id,
                deleted_at: null,
            },
        });
        if (!specificNeedsForm) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Specific needs form not found', null);
            return next(customError);
        }
        const basicInformation = new BasicInformation_1.SpecificNeedsBasicInformation();
        basicInformation.participant_first_name = participant_first_name;
        basicInformation.participant_last_name = participant_last_name;
        basicInformation.participant_father_name = participant_father_name;
        basicInformation.participant_mother_name = participant_mother_name;
        basicInformation.gender = gender;
        basicInformation.date_of_birth = new Date(date_of_birth);
        basicInformation.father_mobile_number = father_mobile_number;
        basicInformation.mother_mobile_number = mother_mobile_number;
        basicInformation.home_address = home_address;
        basicInformation.specific_needs_implemented_by = specific_needs_implemented_by;
        basicInformation.intake_full_id = intake_full_id;
        basicInformation.registered_by = registered_by;
        const newBasicInformation = await basicInformationRepository.save(basicInformation);
        if (!newBasicInformation) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Error adding basic information', null);
            return next(customError);
        }
        specificNeedsForm.basic_information_id = newBasicInformation.id;
        specificNeedsForm.status = genericEnums_1.Status.IN_PROGRESS;
        await specificNeedsRepository.update(specificNeedsForm.id, specificNeedsForm);
        return res.customSuccess(200, 'Basic information added successfully.', newBasicInformation);
    }
    catch (error) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error adding basic information', error);
        return next(customError);
    }
};
exports.addBasicInformation = addBasicInformation;
//# sourceMappingURL=addBasicInformation.js.map