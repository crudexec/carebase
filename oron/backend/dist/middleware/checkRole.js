"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const CustomError_1 = require("../utils/response/custom-error/CustomError");
const checkRole = (roles, isSelfAllowed = false) => {
    return async (req, res, next) => {
        const { id, role } = req.user;
        const { id: requestId } = req.params;
        let errorSelfAllowed = null;
        if (isSelfAllowed) {
            if (id === requestId) {
                return next();
            }
            errorSelfAllowed = 'Self allowed action.';
        }
        if (roles.indexOf(role) === -1) {
            const errors = [
                'Unauthorized - Insufficient user rights',
                `Current role: ${role}. Required role: ${roles.toString()}`,
            ];
            if (errorSelfAllowed) {
                errors.push(errorSelfAllowed);
            }
            const customError = new CustomError_1.CustomError(401, 'Unauthorized', 'Unauthorized - Insufficient user rights', errors);
            return next(customError);
        }
        return next();
    };
};
exports.checkRole = checkRole;
//# sourceMappingURL=checkRole.js.map