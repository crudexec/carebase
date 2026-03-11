"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPersonalWorkReading = void 0;
const typeorm_1 = require("typeorm");
const personalWorkReading_1 = require("orm/entities/VisitLog/stepTwo/personalWorkReading");
const visitFullForm_1 = require("orm/entities/VisitLog/visitFullForm");
const genericEnums_1 = require("types/genericEnums");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addPersonalWorkReading = async (req, res, next) => {
    try {
        const { grammar, writing_skills, vocabulary, reading_comprehension, algebra, geometry, measurement, number_operations, other, other_specify, i_read_a_book_to_client, visit_full_form_id, } = req.body;
        const account_id = req.user.account_id;
        const registered_by = req.user.id;
        const personalWorkReadingRepository = (0, typeorm_1.getRepository)(personalWorkReading_1.PersonalWorkReading);
        const visitFullFormRepository = (0, typeorm_1.getRepository)(visitFullForm_1.VisitFullForm);
        const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });
        if (!visitExists) {
            const customError = new CustomError_1.CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
            return next(customError);
        }
        const personalWorkReading = new personalWorkReading_1.PersonalWorkReading();
        personalWorkReading.grammar = grammar;
        personalWorkReading.writing_skills = writing_skills;
        personalWorkReading.vocabulary = vocabulary;
        personalWorkReading.reading_comprehension = reading_comprehension;
        personalWorkReading.algebra = algebra;
        personalWorkReading.geometry = geometry;
        personalWorkReading.measurement = measurement;
        personalWorkReading.number_operations = number_operations;
        personalWorkReading.other = other;
        personalWorkReading.other_specify = other_specify;
        personalWorkReading.i_read_a_book_to_client = i_read_a_book_to_client;
        personalWorkReading.account_id = account_id;
        personalWorkReading.status = genericEnums_1.Status.IN_PROGRESS;
        personalWorkReading.registered_by = registered_by;
        personalWorkReading.visit_full_form_id = visit_full_form_id;
        const savedPersonalWorkReading = await personalWorkReadingRepository.save(personalWorkReading);
        if (savedPersonalWorkReading) {
            await visitFullFormRepository.update(visit_full_form_id, {
                personal_work_reading_id: savedPersonalWorkReading.id,
            });
        }
        return res.customSuccess(200, 'Personal Work Reading successfully added.', savedPersonalWorkReading);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Adding Personal Work Reading', null, err);
        return next(customError);
    }
};
exports.addPersonalWorkReading = addPersonalWorkReading;
//# sourceMappingURL=addPersonalWorkReading.js.map