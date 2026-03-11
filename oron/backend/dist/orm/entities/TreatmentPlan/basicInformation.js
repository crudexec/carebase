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
exports.TreatmentBasicInformation = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("../IntakeForm/intakeFullForm");
const User_1 = require("../User");
const genericEnums_1 = require("types/genericEnums");
let TreatmentBasicInformation = class TreatmentBasicInformation {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "participant_first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "participant_last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "participant_father_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "participant_mother_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "father_mobile_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "mother_mobile_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "address_street_information", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "county", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "apartment_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "zip_code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], TreatmentBasicInformation.prototype, "implementation_start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], TreatmentBasicInformation.prototype, "implementation_stop_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "participant_background_information", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "behavior_intervention_protocol", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "transport_requirements_and_recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.TreatmentPlanType,
        default: genericEnums_1.TreatmentPlanType.IISS_ASSESSMENT,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "treatment_plan_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "statement_of_family_strength_and_resources", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.TPType,
        default: genericEnums_1.TPType.INITIAL,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "tp_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "tp_implemented_by", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TreatmentBasicInformation.prototype, "requires_data_collection", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "meeting_attendance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "introduction", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "intake_full_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intakeFullForm_1.IntakeFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'intake_full_id' }),
    __metadata("design:type", intakeFullForm_1.IntakeFullForm)
], TreatmentBasicInformation.prototype, "intakeFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TreatmentBasicInformation.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], TreatmentBasicInformation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TreatmentBasicInformation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TreatmentBasicInformation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], TreatmentBasicInformation.prototype, "deleted_at", void 0);
TreatmentBasicInformation = __decorate([
    (0, typeorm_1.Entity)('treatment_basic_information')
], TreatmentBasicInformation);
exports.TreatmentBasicInformation = TreatmentBasicInformation;
//# sourceMappingURL=basicInformation.js.map