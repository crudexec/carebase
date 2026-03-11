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
exports.FcTreatmentPlanSignature = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../../User");
const genericEnums_1 = require("types/genericEnums");
const treatmentFullPlan_1 = require("../../TreatmentPlan/treatmentFullPlan");
const fcVisitFullForm_1 = require("../fcVisitFullForm");
let FcTreatmentPlanSignature = class FcTreatmentPlanSignature {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FcTreatmentPlanSignature.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcTreatmentPlanSignature.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcTreatmentPlanSignature.prototype, "signature_url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcTreatmentPlanSignature.prototype, "parent_signature_url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], FcTreatmentPlanSignature.prototype, "signed", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcTreatmentPlanSignature.prototype, "visit_full_form_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fcVisitFullForm_1.FcVisitFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'visit_full_form_id' }),
    __metadata("design:type", fcVisitFullForm_1.FcVisitFullForm)
], FcTreatmentPlanSignature.prototype, "visitFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcTreatmentPlanSignature.prototype, "treatment_full_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatmentFullPlan_1.TreatmentFullPlan),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_full_id' }),
    __metadata("design:type", treatmentFullPlan_1.TreatmentFullPlan)
], FcTreatmentPlanSignature.prototype, "treatmentFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
    }),
    __metadata("design:type", String)
], FcTreatmentPlanSignature.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FcTreatmentPlanSignature.prototype, "signed_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'signed_by' }),
    __metadata("design:type", User_1.User)
], FcTreatmentPlanSignature.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FcTreatmentPlanSignature.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FcTreatmentPlanSignature.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], FcTreatmentPlanSignature.prototype, "deleted_at", void 0);
FcTreatmentPlanSignature = __decorate([
    (0, typeorm_1.Entity)('fc_treatment_plan_signature')
], FcTreatmentPlanSignature);
exports.FcTreatmentPlanSignature = FcTreatmentPlanSignature;
//# sourceMappingURL=fcSignature.js.map