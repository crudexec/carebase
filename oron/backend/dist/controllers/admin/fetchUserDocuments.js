"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserDocuments = void 0;
const typeorm_1 = require("typeorm");
const Documents_1 = require("orm/entities/Documents");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const fetchUserDocuments = async (req, res, next) => {
    const documentRepository = (0, typeorm_1.getRepository)(Documents_1.UserDocument);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const user_id = req.params.user_id;
    try {
        const user = await userRepository.findOne({ where: { id: user_id, deleted_at: null } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, 'General', `User not found`, ['User not found.']);
            return next(customError);
        }
        const userDocuments = await documentRepository.find({
            where: {
                owner: user_id,
                deleted_at: null,
            },
        });
        return res.customSuccess(200, 'User document data successfully retrieved', userDocuments);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error', null, err);
        return next(customError);
    }
};
exports.fetchUserDocuments = fetchUserDocuments;
//# sourceMappingURL=fetchUserDocuments.js.map