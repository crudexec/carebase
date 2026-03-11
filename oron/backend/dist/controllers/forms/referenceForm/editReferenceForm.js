"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editReferenceForm = void 0;
const typeorm_1 = require("typeorm");
const reference_1 = require("orm/entities/ReferenceForm/reference");
const CustomError_1 = require("utils/response/custom-error/CustomError");
const editReferenceForm = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        let { referrer_one_firstname, referrer_one_lastname, referrer_one_email, referrer_one_phone, referrer_two_firstname, referrer_two_lastname, referrer_two_email, referrer_two_phone, referrer_three_firstname, referrer_three_lastname, referrer_three_email, referrer_three_phone, } = req.body;
        const referenceFormRepository = (0, typeorm_1.getRepository)(reference_1.ReferenceForm);
        const referenceForm = await referenceFormRepository.findOne({ where: { user_id } });
        if (!referenceForm) {
            const customError = new CustomError_1.CustomError(400, 'General', 'Reference form does not exist', [
                `Reference form does not exist`,
            ]);
            return next(customError);
        }
        const newReferenceForm = new reference_1.ReferenceForm();
        referrer_one_firstname = referrer_one_firstname ?? referenceForm.referrer_one_firstname;
        referrer_one_lastname = referrer_one_lastname ?? referenceForm.referrer_one_lastname;
        referrer_one_email = referrer_one_email ?? referenceForm.referrer_one_email;
        referrer_one_phone = referrer_one_phone ?? referenceForm.referrer_one_phone;
        referrer_two_firstname = referrer_two_firstname ?? referenceForm.referrer_two_firstname;
        referrer_two_lastname = referrer_two_lastname ?? referenceForm.referrer_two_lastname;
        referrer_two_email = referrer_two_email ?? referenceForm.referrer_two_email;
        referrer_two_phone = referrer_two_phone ?? referenceForm.referrer_two_phone;
        referrer_three_firstname = referrer_three_firstname ?? referenceForm.referrer_three_firstname;
        referrer_three_lastname = referrer_three_lastname ?? referenceForm.referrer_three_lastname;
        referrer_three_email = referrer_three_email ?? referenceForm.referrer_three_email;
        referrer_three_phone = referrer_three_phone ?? referenceForm.referrer_three_phone;
        newReferenceForm.referrer_one_firstname = referrer_one_firstname;
        newReferenceForm.referrer_one_lastname = referrer_one_lastname;
        newReferenceForm.referrer_one_email = referrer_one_email;
        newReferenceForm.referrer_one_phone = referrer_one_phone;
        newReferenceForm.referrer_two_firstname = referrer_two_firstname;
        newReferenceForm.referrer_two_lastname = referrer_two_lastname;
        newReferenceForm.referrer_two_email = referrer_two_email;
        newReferenceForm.referrer_two_phone = referrer_two_phone;
        newReferenceForm.referrer_three_firstname = referrer_three_firstname;
        newReferenceForm.referrer_three_lastname = referrer_three_lastname;
        newReferenceForm.referrer_three_email = referrer_three_email;
        newReferenceForm.referrer_three_phone = referrer_three_phone;
        await referenceFormRepository.update(referenceForm.id, newReferenceForm);
        return res.customSuccess(200, 'Reference form successfully updated.', newReferenceForm);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, 'Raw', 'Error while retrieving reference form', null, err);
        return next(customError);
    }
};
exports.editReferenceForm = editReferenceForm;
//# sourceMappingURL=editReferenceForm.js.map