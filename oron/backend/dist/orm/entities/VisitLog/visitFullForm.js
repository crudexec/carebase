"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitFullForm = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("../IntakeForm/intakeFullForm");
const treatmentFullPlan_1 = require("../TreatmentPlan/treatmentFullPlan");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
const communication_1 = require("./stepOne/communication");
const concernAndChallenges_1 = require("./stepOne/concernAndChallenges");
const selfManagement_1 = require("./stepOne/selfManagement");
const sessionHighlights_1 = require("./stepOne/sessionHighlights");
const domesticSkillTraining_1 = require("./stepTwo/domesticSkillTraining");
const personalCareAndControl_1 = require("./stepTwo/personalCareAndControl");
const personalWorkReading_1 = require("./stepTwo/personalWorkReading");
const playLeisure_1 = require("./stepTwo/playLeisure");
const safetyAndSurvivalSkills_1 = require("./stepTwo/safetyAndSurvivalSkills");
const sensoryNeedAndMotorDevelopment_1 = require("./stepTwo/sensoryNeedAndMotorDevelopment");
const snackMealTime_1 = require("./stepTwo/snackMealTime");
const socialization_1 = require("./stepTwo/socialization");
const utilizationOfMoney_1 = require("./stepTwo/utilizationOfMoney");
const transportationTypeAndObjectives_1 = require("./stepOne/transportationTypeAndObjectives");
let VisitFullForm = class VisitFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VisitFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "session_highlights_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sessionHighlights_1.SessionHighlights),
    (0, typeorm_1.JoinColumn)({ name: 'session_highlights_id' }),
    __metadata("design:type", sessionHighlights_1.SessionHighlights)
], VisitFullForm.prototype, "sessionHighlights", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "self_management_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => selfManagement_1.SelfManagement),
    (0, typeorm_1.JoinColumn)({ name: 'self_management_id' }),
    __metadata("design:type", selfManagement_1.SelfManagement)
], VisitFullForm.prototype, "selfManagement", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "communication_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => communication_1.Communication),
    (0, typeorm_1.JoinColumn)({ name: 'communication_id' }),
    __metadata("design:type", communication_1.Communication)
], VisitFullForm.prototype, "communication", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], VisitFullForm.prototype, "behavior_management_ids", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "concern_and_challenges_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => concernAndChallenges_1.ConcernAndChallenges),
    (0, typeorm_1.JoinColumn)({ name: 'concern_and_challenges_id' }),
    __metadata("design:type", concernAndChallenges_1.ConcernAndChallenges)
], VisitFullForm.prototype, "concernAndChallenges", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "domestic_skill_training_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('DomesticSkillTraining'),
    (0, typeorm_1.JoinColumn)({ name: 'domestic_skill_training_id' }),
    __metadata("design:type", domesticSkillTraining_1.DomesticSkillTraining)
], VisitFullForm.prototype, "domesticSkillTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "play_leisure_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => playLeisure_1.PlayLeisure),
    (0, typeorm_1.JoinColumn)({ name: 'play_leisure_id' }),
    __metadata("design:type", playLeisure_1.PlayLeisure)
], VisitFullForm.prototype, "playLeisure", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "snack_meal_time_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => snackMealTime_1.SnackMealTime),
    (0, typeorm_1.JoinColumn)({ name: 'snack_meal_time_id' }),
    __metadata("design:type", snackMealTime_1.SnackMealTime)
], VisitFullForm.prototype, "snackMealTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "utilization_of_money_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => utilizationOfMoney_1.UtilizationOfMoney),
    (0, typeorm_1.JoinColumn)({ name: 'utilization_of_money_id' }),
    __metadata("design:type", utilizationOfMoney_1.UtilizationOfMoney)
], VisitFullForm.prototype, "utilizationOfMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "socialization_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => socialization_1.Socialization),
    (0, typeorm_1.JoinColumn)({ name: 'socialization_id' }),
    __metadata("design:type", socialization_1.Socialization)
], VisitFullForm.prototype, "socialization", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "safety_and_survival_skills_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => safetyAndSurvivalSkills_1.SafetyAndSurvivalSkills),
    (0, typeorm_1.JoinColumn)({ name: 'safety_and_survival_skills_id' }),
    __metadata("design:type", safetyAndSurvivalSkills_1.SafetyAndSurvivalSkills)
], VisitFullForm.prototype, "safetyAndSurvivalSkills", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "personal_care_and_bladder_control_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => personalCareAndControl_1.PersonalCareAndBladderControl),
    (0, typeorm_1.JoinColumn)({ name: 'personal_care_and_bladder_control_id' }),
    __metadata("design:type", personalCareAndControl_1.PersonalCareAndBladderControl)
], VisitFullForm.prototype, "personalCareAndBladderControl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "sensory_need_and_motor_development_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sensoryNeedAndMotorDevelopment_1.SensoryNeedAndMotorDevelopment, (sensoryNeedAndMotorDevelopment) => sensoryNeedAndMotorDevelopment.id),
    (0, typeorm_1.JoinColumn)({ name: 'sensory_need_and_motor_development_id' }),
    __metadata("design:type", sensoryNeedAndMotorDevelopment_1.SensoryNeedAndMotorDevelopment)
], VisitFullForm.prototype, "sensoryNeedAndMotorDevelopment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "personal_work_reading_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => personalWorkReading_1.PersonalWorkReading),
    (0, typeorm_1.JoinColumn)({ name: 'personal_work_reading_id' }),
    __metadata("design:type", personalWorkReading_1.PersonalWorkReading)
], VisitFullForm.prototype, "personalWorkReading", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "transportation_type_and_objectives_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transportationTypeAndObjectives_1.TransportationTypeAndObjectives, (transportationTypeAndObjectives) => transportationTypeAndObjectives.id),
    (0, typeorm_1.JoinColumn)({ name: 'transportation_type_and_objectives_id' }),
    __metadata("design:type", transportationTypeAndObjectives_1.TransportationTypeAndObjectives)
], VisitFullForm.prototype, "transportationTypeAndObjectives", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], VisitFullForm.prototype, "visit_goal_ids", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.DRAFT,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "treatment_plan_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatmentFullPlan_1.TreatmentFullPlan),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_plan_id' }),
    __metadata("design:type", treatmentFullPlan_1.TreatmentFullPlan)
], VisitFullForm.prototype, "treatmentFullPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.TreatmentPlanType,
        default: genericEnums_1.TreatmentPlanType.IISS_ASSESSMENT,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "treatment_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], VisitFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'uuid',
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "approved_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", User_1.User)
], VisitFullForm.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], VisitFullForm.prototype, "approved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "review_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], VisitFullForm.prototype, "date_of_visit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "intake_full_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intakeFullForm_1.IntakeFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'intake_full_id' }),
    __metadata("design:type", intakeFullForm_1.IntakeFullForm)
], VisitFullForm.prototype, "intakeFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VisitFullForm.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VisitFullForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VisitFullForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], VisitFullForm.prototype, "deleted_at", void 0);
VisitFullForm = __decorate([
    (0, typeorm_1.Entity)('visit_full_form')
], VisitFullForm);
exports.VisitFullForm = VisitFullForm;
//# sourceMappingURL=visitFullForm.js.map