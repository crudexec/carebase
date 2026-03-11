"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTransportationTypeAndObjectives = void 0;
const typeorm_1 = require("typeorm");
const transportationTypeAndObjectives_1 = require("orm/entities/VisitLog/stepOne/transportationTypeAndObjectives");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addTransportationTypeAndObjectives = async (req, res, next) => {
    try {
        const { transportation_type_details, transportation_safety_objectives, unusual_occurrences, traffic_sign_recognition, directional_concepts, treatment_plan_id, visit_full_form_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const transportationRepository = (0, typeorm_1.getRepository)(transportationTypeAndObjectives_1.TransportationTypeAndObjectives);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({
            where: { id: visit_full_form_id, deleted_at: null },
        });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
        const transportationData = new transportationTypeAndObjectives_1.TransportationTypeAndObjectives();
        transportationData.transportation_type_details = transportation_type_details;
        transportationData.transportation_safety_objectives = transportation_safety_objectives;
        transportationData.unusual_occurrences = unusual_occurrences;
        transportationData.traffic_sign_recognition = traffic_sign_recognition;
        transportationData.directional_concepts = directional_concepts;
        transportationData.treatment_plan_id = treatment_plan_id;
        transportationData.visit_full_form_id = visit_full_form_id;
        transportationData.account_id = account_id;
        transportationData.status = genericEnums_1.Status.IN_PROGRESS;
        transportationData.registered_by = registered_by;
        const savedTransportation = await transportationRepository.save(transportationData);
        if (savedTransportation) {
            await visitFullFormRepository.update(visit_full_form_id, {
                transportation_type_and_objectives_id: savedTransportation.id,
            });
        }
        return res.customSuccess(200, 'Transportation Type and Objectives successfully added.', savedTransportation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Transportation Type and Objectives', null, err);
        return next(customError);
    }
};
exports.addTransportationTypeAndObjectives = addTransportationTypeAndObjectives;
//# sourceMappingURL=addTransportationType.js.map