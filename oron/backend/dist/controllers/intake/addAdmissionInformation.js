"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAdmissionInformation = void 0;
const typeorm_1 = require("typeorm");
const admissionInformation_1 = require("orm/entities/IntakeForm/admissionInformation");
const intakeFullForm_1 = require("orm/entities/IntakeForm/intakeFullForm");
const waiverService_1 = require("orm/entities/IntakeForm/waiverService");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const addAdmissionInformation = async (req, res, next) => {
    const connection = (0, typeorm_1.getConnection)();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    try {
        await queryRunner.startTransaction();
        const user_id = req.user.id;
        const admissionInformationRepository = connection.getRepository(admissionInformation_1.AdmissionInformation);
        const waiverServicesRepository = connection.getRepository(waiverService_1.WaiverServices);
        const intakeFullFormRepository = connection.getRepository(intakeFullForm_1.IntakeFullForm);
        const fullAdmissionInformation = {};
        const { poc_authorization_number, poc_start_date, poc_end_date, medical_information_id, intake_full_id } = req.body;
        const waiverServiceData = req.body.waiver_services;
        const newAdmissionInformation = new admissionInformation_1.AdmissionInformation();
        newAdmissionInformation.registered_by = user_id;
        newAdmissionInformation.poc_authorization_number = poc_authorization_number;
        newAdmissionInformation.poc_start_date = poc_start_date;
        newAdmissionInformation.poc_end_date = poc_end_date;
        const savedAdmissionInformation = await admissionInformationRepository.save(newAdmissionInformation);
        if (!savedAdmissionInformation) {
            const customError = new CustomError_1.CustomError(400, 'Raw', 'Error saving basic admission information', null, null);
            return next(customError);
        }
        if (waiverServiceData.length > 0) {
            waiverServiceData.forEach(async (waiverService) => {
                const newWaiverService = new waiverService_1.WaiverServices();
                newWaiverService.select_waiver_system = waiverService.select_waiver_system;
                newWaiverService.service_end_date = waiverService.service_end_date;
                newWaiverService.service_start_date = waiverService.service_start_date;
                newWaiverService.amount_per_day_week_month = waiverService.amount_per_day_week_month;
                newWaiverService.amount_per_year = waiverService.amount_per_year;
                newWaiverService.admission_information_id = savedAdmissionInformation.id;
                newWaiverService.registered_by = user_id;
                await waiverServicesRepository.save(newWaiverService);
            });
            const newIntakeFullForm = new intakeFullForm_1.IntakeFullForm();
            const alreadyExistIntakeFullForm = await intakeFullFormRepository.findOne({
                where: { id: intake_full_id, deleted_at: null },
            });
            if (alreadyExistIntakeFullForm) {
                newIntakeFullForm.admission_information_id = savedAdmissionInformation.id;
                await intakeFullFormRepository.update(alreadyExistIntakeFullForm.id, newIntakeFullForm);
            }
            await queryRunner.commitTransaction();
        }
        const admissionInformationData = await admissionInformationRepository.findOne({
            where: { id: savedAdmissionInformation.id },
        });
        const waiverServicesData = await waiverServicesRepository.find({
            where: { admission_information_id: admissionInformationData.id },
        });
        fullAdmissionInformation['admission_information'] = admissionInformationData;
        fullAdmissionInformation['waiver_services'] = waiverServicesData;
        return res.customSuccess(200, 'Admission Information successfully created.', fullAdmissionInformation);
    }
    catch (err) {
        await queryRunner.rollbackTransaction();
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
    finally {
        await queryRunner.release();
    }
};
exports.addAdmissionInformation = addAdmissionInformation;
//# sourceMappingURL=addAdmissionInformation.js.map