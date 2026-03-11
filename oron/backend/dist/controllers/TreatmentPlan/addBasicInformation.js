"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTreatmentBasicInformation = void 0;
const typeorm_1 = require("typeorm");
const basicInformation_1 = require("orm/entities/TreatmentPlan/basicInformation");
const treatmentFullPlan_1 = require("orm/entities/TreatmentPlan/treatmentFullPlan");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addTreatmentBasicInformation = async (req, res, next) => {
    const connection = (0, typeorm_1.getConnection)();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    try {
        await queryRunner.startTransaction();
        const user_id = req.user.id;
        const intake_full_id = req.params.intake_full_id;
        const { participant_first_name, participant_last_name, participant_father_name, participant_mother_name, father_mobile_number, mother_mobile_number, address_street_information, country, state, city, county, apartment_number, zip_code, implementation_start_date, implementation_stop_date, participant_background_information, behavior_intervention_protocol, transport_requirements_and_recommendations, statement_of_family_strength_and_resources, treatment_plan_type, treatment_full_id, tp_implemented_by, tp_type, requires_data_collection, meeting_attendance, introduction, } = req.body;
        const basicInformationRepository = connection.getRepository(basicInformation_1.TreatmentBasicInformation);
        const fullPlanRepository = connection.getRepository(treatmentFullPlan_1.TreatmentFullPlan);
        const newBasicInformation = new basicInformation_1.TreatmentBasicInformation();
        newBasicInformation.registered_by = user_id;
        newBasicInformation.participant_first_name = participant_first_name;
        newBasicInformation.participant_last_name = participant_last_name;
        newBasicInformation.participant_father_name = participant_father_name;
        newBasicInformation.participant_mother_name = participant_mother_name;
        newBasicInformation.father_mobile_number = father_mobile_number;
        newBasicInformation.mother_mobile_number = mother_mobile_number;
        newBasicInformation.address_street_information = address_street_information;
        newBasicInformation.country = country;
        newBasicInformation.state = state;
        newBasicInformation.city = city;
        newBasicInformation.county = county;
        newBasicInformation.apartment_number = apartment_number;
        newBasicInformation.zip_code = zip_code;
        newBasicInformation.implementation_start_date = implementation_start_date;
        newBasicInformation.implementation_stop_date = implementation_stop_date;
        newBasicInformation.participant_background_information = participant_background_information;
        newBasicInformation.behavior_intervention_protocol = behavior_intervention_protocol;
        newBasicInformation.transport_requirements_and_recommendations = transport_requirements_and_recommendations;
        newBasicInformation.intake_full_id = intake_full_id;
        newBasicInformation.statement_of_family_strength_and_resources = statement_of_family_strength_and_resources;
        newBasicInformation.treatment_plan_type = treatment_plan_type;
        newBasicInformation.tp_implemented_by = tp_implemented_by;
        newBasicInformation.tp_type = tp_type;
        newBasicInformation.requires_data_collection = requires_data_collection;
        newBasicInformation.meeting_attendance = meeting_attendance;
        newBasicInformation.introduction = introduction;
        const savedBasicInformation = await basicInformationRepository.save(newBasicInformation);
        if (savedBasicInformation) {
            const newFullPlan = new treatmentFullPlan_1.TreatmentFullPlan();
            const alreadyExistFullPlan = await fullPlanRepository.findOne({
                where: { id: treatment_full_id, deleted_at: null },
            });
            if (!alreadyExistFullPlan) {
                const customError = new CustomError_1.CustomError(404, 'General', `Treatment Plan not found`, ['Treatment Plan not found.']);
                return next(customError);
            }
            newFullPlan.basic_information_id = savedBasicInformation.id;
            newFullPlan.status = genericEnums_1.Status.DRAFT;
            await fullPlanRepository.update(alreadyExistFullPlan.id, newFullPlan);
            await queryRunner.commitTransaction();
        }
        return res.customSuccess(200, 'Basic Information successfully created.', savedBasicInformation);
    }
    catch (err) {
        await queryRunner.rollbackTransaction();
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Treatment Basic Information', null, err);
        return next(customError);
    }
    finally {
        await queryRunner.release();
    }
};
exports.addTreatmentBasicInformation = addTreatmentBasicInformation;
//# sourceMappingURL=addBasicInformation.js.map