"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.edit = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("orm/entities/User");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const edit = async (req, res, next) => {
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    try {
        const id = req.params.id;
        let { first_name, last_name, profile_picture } = req.body;
        const userData = await userRepository.findOne({ where: { id } });
        if (!userData) {
            const customError = new CustomError_1.CustomError(404, 'General', `User with id:${id} not found.`, ['User not found.']);
            return next(customError);
        }
        first_name = first_name ?? userData.first_name;
        last_name = last_name ?? userData.last_name;
        profile_picture = profile_picture ?? userData.profile_picture;
        userData.first_name = first_name;
        userData.last_name = last_name;
        userData.profile_picture = profile_picture;
        await userRepository.save(userData);
        return res.customSuccess(200, 'User successfully saved.');
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', `User update can't be saved.`, null, err);
        return next(customError);
    }
};
exports.edit = edit;
//# sourceMappingURL=edit.js.map