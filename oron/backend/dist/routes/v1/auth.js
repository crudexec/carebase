"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("controllers/admin");
const auth_1 = require("controllers/auth");
const checkJwt_1 = require("middleware/checkJwt");
const auth_2 = require("middleware/validation/auth");
const index_1 = require("middleware/metrics/index");
const router = (0, express_1.Router)();
router.post('/login', [index_1.countRequests, auth_2.validatorLogin], auth_1.login);
router.post('/register', [auth_2.validatorRegister], auth_1.register);
router.post('/admin/register', admin_1.registerAdmin);
router.post('/change-password', [checkJwt_1.checkJwt, auth_2.validatorChangePassword], auth_1.changePassword);
router.post('/forgot-password', auth_1.forgotPassword);
router.post('/reset-password', auth_1.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.js.map