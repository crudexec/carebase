"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveServiceCoordinatorInformation = void 0;
const typeorm_1 = require("typeorm");
const serviceCoordinatorInformation_1 = require("orm/entities/IntakeForm/serviceCoordinatorInformation");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveServiceCoordinatorInformation = async (req, res, next) => {
    try {
        const serviceCoordinatorInformationRepository = (0, typeorm_1.getRepository)(serviceCoordinatorInformation_1.ServiceCoordinatorInformation);
        const user_id = req.user.id;
        const serviceCoordinatorInformation = await serviceCoordinatorInformationRepository.findOne({ where: { user_id } });
        if (!serviceCoordinatorInformation) {
            return res.customSuccess(200, 'Service Coordinator Information has not been filled', null);
        }
        return res.customSuccess(200, 'Service Coordinator Information successfully retrieved.', serviceCoordinatorInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Retrieving Service Coordinator', null, err);
        return next(customError);
    }
};
exports.retrieveServiceCoordinatorInformation = retrieveServiceCoordinatorInformation;
//# sourceMappingURL=retrieveServiceCoordinator.js.map