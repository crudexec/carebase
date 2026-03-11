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
exports.TreatmentGoalSignature = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("../IntakeForm/intakeFullForm");
const User_1 = require("../User");
const treatmentFullPlan_1 = require("./treatmentFullPlan");
const genericEnums_1 = require("types/genericEnums");
let TreatmentGoalSignature = class TreatmentGoalSignature {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TreatmentGoalSignature.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentGoalSignature.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentGoalSignature.prototype, "signature_url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentGoalSignature.prototype, "parent_signature_url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TreatmentGoalSignature.prototype, "parent_signed", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], TreatmentGoalSignature.prototype, "date_parent_signed", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.TreatmentPlanType,
        default: genericEnums_1.TreatmentPlanType.IISS_ASSESSMENT,
    }),
    __metadata("design:type", String)
], TreatmentGoalSignature.prototype, "treatment_plan_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentGoalSignature.prototype, "intake_full_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intakeFullForm_1.IntakeFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'intake_full_id' }),
    __metadata("design:type", intakeFullForm_1.IntakeFullForm)
], TreatmentGoalSignature.prototype, "intakeFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentGoalSignature.prototype, "treatment_full_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatmentFullPlan_1.TreatmentFullPlan),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_full_id' }),
    __metadata("design:type", treatmentFullPlan_1.TreatmentFullPlan)
], TreatmentGoalSignature.prototype, "treatmentFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TreatmentGoalSignature.prototype, "signed_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'signed_by' }),
    __metadata("design:type", User_1.User)
], TreatmentGoalSignature.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TreatmentGoalSignature.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TreatmentGoalSignature.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], TreatmentGoalSignature.prototype, "deleted_at", void 0);
TreatmentGoalSignature = __decorate([
    (0, typeorm_1.Entity)('treatment_goal_signature')
], TreatmentGoalSignature);
exports.TreatmentGoalSignature = TreatmentGoalSignature;
//# sourceMappingURL=treatmentGoalSignature.js.map