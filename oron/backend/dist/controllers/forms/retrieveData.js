"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveBioData = void 0;
const typeorm_1 = require("typeorm");
const userBioData_1 = require("orm/entities/userBioData");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const retrieveBioData = async (req, res, next) => {
    const userBioDataRepository = (0, typeorm_1.getRepository)(userBioData_1.UserBioData);
    const user_id = req.user.id;
    try {
        const userBioData = await userBioDataRepository.findOne({ where: { user_id } });
        if (!userBioData) {
            const customError = new CustomError_1.CustomError(404, 'General', `User BioData not found.`, ['User BioData not found.']);
            return next(customError);
        }
        res.customSuccess(200, 'User BioData successfully created.', userBioData);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.retrieveBioData = retrieveBioData;
//# sourceMappingURL=retrieveData.js.map