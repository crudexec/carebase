"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveMoreAboutClient = void 0;
const typeorm_1 = require("typeorm");
const moreAboutClient_1 = require("orm/entities/IntakeForm/moreAboutClient");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveMoreAboutClient = async (req, res, next) => {
    try {
        const moreAboutInformationRepository = (0, typeorm_1.getRepository)(moreAboutClient_1.MoreAboutInformation);
        const user_id = req.user.id;
        const moreAboutInformation = await moreAboutInformationRepository.findOne({ where: { user_id } });
        if (!moreAboutInformation) {
            return res.customSuccess(200, 'More About Client Information has not been filled', null);
        }
        return res.customSuccess(200, 'More About Client Information successfully retrieved.', moreAboutInformation);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Network Error Retrieving More About Client', null, err);
        return next(customError);
    }
};
exports.retrieveMoreAboutClient = retrieveMoreAboutClient;
//# sourceMappingURL=retrieveMoreAboutClient.js.map