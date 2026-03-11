"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTransportationTypeAndObjectives = void 0;
const typeorm_1 = require("typeorm");
const transportationTypeAndObjectives_1 = require("orm/entities/VisitLog/stepOne/transportationTypeAndObjectives");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editTransportationTypeAndObjectives = async (req, res, next) => {
    try {
        let { transportation_type_details, transportation_safety_objectives, unusual_occurrences, traffic_sign_recognition, directional_concepts, transportation_type_id, } = req.body;
        const transportationRepository = (0, typeorm_1.getRepository)(transportationTypeAndObjectives_1.TransportationTypeAndObjectives);
        const transportationExists = await transportationRepository.findOne({
            where: { id: transportation_type_id, deleted_at: null },
        });
        if (!transportationExists) {
            const customError = new CustomError_1.CustomError(404, 'General', 'Transportation record not found', [
                'Transportation record not found.',
            ]);
            return next(customError);
        }
        transportation_type_details = transportation_type_details ?? transportationExists.transportation_type_details;
        transportation_safety_objectives =
            transportation_safety_objectives ?? transportationExists.transportation_safety_objectives;
        unusual_occurrences = unusual_occurrences ?? transportationExists.unusual_occurrences;
        traffic_sign_recognition = traffic_sign_recognition ?? transportationExists.traffic_sign_recognition;
        directional_concepts = directional_concepts ?? transportationExists.directional_concepts;
        transportationExists.transportation_type_details = transportation_type_details;
        transportationExists.transportation_safety_objectives = transportation_safety_objectives;
        transportationExists.unusual_occurrences = unusual_occurrences;
        transportationExists.traffic_sign_recognition = traffic_sign_recognition;
        transportationExists.directional_concepts = directional_concepts;
        await transportationRepository.update(transportation_type_id, transportationExists);
        return res.customSuccess(200, 'Transportation Type and Objectives successfully updated.', transportationExists);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error updating Transportation Type and Objectives', null, err);
        return next(customError);
    }
};
exports.editTransportationTypeAndObjectives = editTransportationTypeAndObjectives;
//# sourceMappingURL=editTransportationType.js.map