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
exports.TreatmentFullPlan = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const intakeFullForm_1 = require("../IntakeForm/intakeFullForm");
const User_1 = require("../User");
const basicInformation_1 = require("./basicInformation");
const treatmentSchedule_1 = require("./treatmentSchedule");
let TreatmentFullPlan = class TreatmentFullPlan {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "basic_information_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => basicInformation_1.TreatmentBasicInformation),
    (0, typeorm_1.JoinColumn)({ name: 'basic_information_id' }),
    __metadata("design:type", basicInformation_1.TreatmentBasicInformation)
], TreatmentFullPlan.prototype, "basicInformation", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], TreatmentFullPlan.prototype, "treatment_goal_ids", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "treatment_schedule_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatmentSchedule_1.TreatmentSchedule),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_schedule_id' }),
    __metadata("design:type", treatmentSchedule_1.TreatmentSchedule)
], TreatmentFullPlan.prototype, "treatmentSchedule", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.TreatmentPlanType,
        default: genericEnums_1.TreatmentPlanType.IISS_ASSESSMENT,
    }),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "treatment_plan_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.TPType,
        default: genericEnums_1.TPType.INITIAL,
    }),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "tp_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "tp_implemented_by", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "intake_full_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intakeFullForm_1.IntakeFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'intake_full_id' }),
    __metadata("design:type", intakeFullForm_1.IntakeFullForm)
], TreatmentFullPlan.prototype, "intakeFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], TreatmentFullPlan.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "parent_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "parent_email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentFullPlan.prototype, "relation_to_participant", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TreatmentFullPlan.prototype, "active_treatment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TreatmentFullPlan.prototype, "parent_email_sent", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TreatmentFullPlan.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TreatmentFullPlan.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], TreatmentFullPlan.prototype, "deleted_at", void 0);
TreatmentFullPlan = __decorate([
    (0, typeorm_1.Entity)('treatment_full_plan')
], TreatmentFullPlan);
exports.TreatmentFullPlan = TreatmentFullPlan;
//# sourceMappingURL=treatmentFullPlan.js.map