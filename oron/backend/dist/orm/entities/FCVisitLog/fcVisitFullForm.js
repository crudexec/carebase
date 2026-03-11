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
exports.FcVisitFullForm = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("../IntakeForm/intakeFullForm");
const treatmentFullPlan_1 = require("../TreatmentPlan/treatmentFullPlan");
const genericEnums_1 = require("types/genericEnums");
const FamilyDiscussion_1 = require("./stepOne/FamilyDiscussion");
const SessionHighlights_1 = require("./stepOne/SessionHighlights");
const fcSignature_1 = require("./stepThree/fcSignature");
const otherTraining_1 = require("./stepThree/otherTraining");
const User_1 = require("../User");
let FcVisitFullForm = class FcVisitFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "session_highlights_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SessionHighlights_1.FcSessionHighlights),
    (0, typeorm_1.JoinColumn)({ name: 'session_highlights_id' }),
    __metadata("design:type", SessionHighlights_1.FcSessionHighlights)
], FcVisitFullForm.prototype, "sessionHighlights", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "family_discussion_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => FamilyDiscussion_1.FcFamilyDiscussion),
    (0, typeorm_1.JoinColumn)({ name: 'family_discussion_id' }),
    __metadata("design:type", FamilyDiscussion_1.FcFamilyDiscussion)
], FcVisitFullForm.prototype, "familyDiscussion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "treatment_plan_signature_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fcSignature_1.FcTreatmentPlanSignature),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_plan_signature_id' }),
    __metadata("design:type", fcSignature_1.FcTreatmentPlanSignature)
], FcVisitFullForm.prototype, "treatmentPlanSignature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "other_training_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => otherTraining_1.FcOtherTraining),
    (0, typeorm_1.JoinColumn)({ name: 'other_training_id' }),
    __metadata("design:type", otherTraining_1.FcOtherTraining)
], FcVisitFullForm.prototype, "otherTraining", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], FcVisitFullForm.prototype, "visit_goal_ids", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.DRAFT,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "treatment_plan_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatmentFullPlan_1.TreatmentFullPlan),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_plan_id' }),
    __metadata("design:type", treatmentFullPlan_1.TreatmentFullPlan)
], FcVisitFullForm.prototype, "treatmentFullPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], FcVisitFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], FcVisitFullForm.prototype, "date_of_visit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "intake_full_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intakeFullForm_1.IntakeFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'intake_full_id' }),
    __metadata("design:type", intakeFullForm_1.IntakeFullForm)
], FcVisitFullForm.prototype, "intakeFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcVisitFullForm.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FcVisitFullForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FcVisitFullForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], FcVisitFullForm.prototype, "deleted_at", void 0);
FcVisitFullForm = __decorate([
    (0, typeorm_1.Entity)('fc_visit_full_form')
], FcVisitFullForm);
exports.FcVisitFullForm = FcVisitFullForm;
//# sourceMappingURL=fcVisitFullForm.js.map