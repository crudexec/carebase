"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TPType = exports.TreatmentPlanType = exports.IntakeFormStatus = exports.Status = exports.Ethnicity = exports.Gender = exports.CitizenshipStatus = void 0;
var CitizenshipStatus;
(function (CitizenshipStatus) {
    CitizenshipStatus["CITIZEN"] = "A citizen of the United States";
    CitizenshipStatus["NON_CITIZEN_AUTHORIZED_TO_WORK"] = "A noncitizen national of the United States";
    CitizenshipStatus["LAWFUL_PERMANENT_RESIDENT"] = "A lawful permanent resident";
    CitizenshipStatus["AUTHORIZED_FOR_WORK_ONLY"] = "A non-citizen authorized to work";
})(CitizenshipStatus = exports.CitizenshipStatus || (exports.CitizenshipStatus = {}));
var Gender;
(function (Gender) {
    Gender["FEMALE"] = "female";
    Gender["MALE"] = "male";
    Gender["NO_PREFERENCE"] = "no_preference";
})(Gender = exports.Gender || (exports.Gender = {}));
var Ethnicity;
(function (Ethnicity) {
    Ethnicity["AMERICAN_INDIAN_OR_ALASKAN_NATIVE"] = "American Indian or Alaska Native";
    Ethnicity["ASIAN"] = "Asian";
    Ethnicity["BLACK_OR_AFRICAN_AMERICAN"] = "Black or African American";
    Ethnicity["HAWAIIAN_OR_PACIFIC_ISLANDER"] = "Hawaiian or Pacific Islander";
    Ethnicity["WHITE_OR_CAUCASIAN"] = "White or Caucasian";
})(Ethnicity = exports.Ethnicity || (exports.Ethnicity = {}));
var Status;
(function (Status) {
    Status["NOT_STARTED"] = "not_started";
    Status["IN_PROGRESS"] = "in_progress";
    Status["AWAITING_APPROVAL"] = "awaiting_approval";
    Status["APPROVED"] = "approved";
    Status["REVIEWED"] = "reviewed";
    Status["COMPLETED"] = "completed";
    Status["REJECTED"] = "rejected";
    Status["SUBMITTED"] = "submitted";
    Status["DRAFT"] = "draft";
    Status["NOT_FILLED"] = "not_filled";
    Status["NOT_SENT"] = "not_sent";
    Status["AWAITING_SIGNATURE"] = "awaiting_signature";
    Status["SIGNED"] = "signed";
})(Status = exports.Status || (exports.Status = {}));
var IntakeFormStatus;
(function (IntakeFormStatus) {
    IntakeFormStatus["Active"] = "active";
    IntakeFormStatus["Inactive"] = "inactive";
    IntakeFormStatus["Disengage"] = "disengage";
    IntakeFormStatus["Not_Admitted"] = "not_admitted";
    IntakeFormStatus["New_Intake"] = "new_intake";
    IntakeFormStatus["Draft"] = "draft";
    IntakeFormStatus["Submitted"] = "submitted";
})(IntakeFormStatus = exports.IntakeFormStatus || (exports.IntakeFormStatus = {}));
var TreatmentPlanType;
(function (TreatmentPlanType) {
    TreatmentPlanType["IISS_ASSESSMENT"] = "IISS_Assessment";
    TreatmentPlanType["FC_ASSESSMENT"] = "FC_Assessment";
    TreatmentPlanType["ITI_ASSESSMENT"] = "ITI_Assessment";
    TreatmentPlanType["ALP_ASSESSMENT"] = "ALP_Assessment";
    TreatmentPlanType["RESPITE"] = "Respite";
})(TreatmentPlanType = exports.TreatmentPlanType || (exports.TreatmentPlanType = {}));
var TPType;
(function (TPType) {
    TPType["INITIAL"] = "Initial";
    TPType["PROVISIONAL"] = "Provisional";
    TPType["ANNUAL"] = "Annual";
})(TPType = exports.TPType || (exports.TPType = {}));
//# sourceMappingURL=genericEnums.js.map