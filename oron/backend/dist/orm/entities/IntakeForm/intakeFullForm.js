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
exports.IntakeFullForm = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
const admissionInformation_1 = require("./admissionInformation");
const clientInformation_1 = require("./clientInformation");
const emergencyContactInformation_1 = require("./emergencyContactInformation");
const fatherContactInformation_1 = require("./fatherContactInformation");
const intakeInformation_1 = require("./intakeInformation");
const medicalInformation_1 = require("./medicalInformation");
const moreAboutClient_1 = require("./moreAboutClient");
const motherContactInformation_1 = require("./motherContactInformation");
const referralInformation_1 = require("./referralInformation");
const schoolContactInformation_1 = require("./schoolContactInformation");
const serviceCoordinatorInformation_1 = require("./serviceCoordinatorInformation");
let IntakeFullForm = class IntakeFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.IntakeFormStatus,
        default: genericEnums_1.IntakeFormStatus.Draft,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "admission_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => admissionInformation_1.AdmissionInformation, (admissionInformation) => admissionInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'admission_information_id' }),
    __metadata("design:type", admissionInformation_1.AdmissionInformation)
], IntakeFullForm.prototype, "admissionInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "client_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => clientInformation_1.ClientInformation, (clientInformation) => clientInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'client_information_id' }),
    __metadata("design:type", clientInformation_1.ClientInformation)
], IntakeFullForm.prototype, "clientInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "father_contact_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => fatherContactInformation_1.FatherContactInformation, (fatherContactInformation) => fatherContactInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'father_contact_information_id' }),
    __metadata("design:type", fatherContactInformation_1.FatherContactInformation)
], IntakeFullForm.prototype, "fatherContactInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "mother_contact_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => motherContactInformation_1.MotherContactInformation, (motherContactInformation) => motherContactInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'mother_contact_information_id' }),
    __metadata("design:type", motherContactInformation_1.MotherContactInformation)
], IntakeFullForm.prototype, "motherContactInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "school_contact_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => schoolContactInformation_1.SchoolContactInformation, (schoolContactInformation) => schoolContactInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'school_contact_information_id' }),
    __metadata("design:type", schoolContactInformation_1.SchoolContactInformation)
], IntakeFullForm.prototype, "schoolContactInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "service_coordinator_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => serviceCoordinatorInformation_1.ServiceCoordinatorInformation, (serviceCoordinatorInformation) => serviceCoordinatorInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'service_coordinator_information_id' }),
    __metadata("design:type", serviceCoordinatorInformation_1.ServiceCoordinatorInformation)
], IntakeFullForm.prototype, "serviceCoordinatorInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "more_about_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => moreAboutClient_1.MoreAboutInformation, (moreAboutInformation) => moreAboutInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'more_about_information_id' }),
    __metadata("design:type", moreAboutClient_1.MoreAboutInformation)
], IntakeFullForm.prototype, "moreAboutInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "medical_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => medicalInformation_1.MedicalInformation, (medicalInformation) => medicalInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'medical_information_id' }),
    __metadata("design:type", medicalInformation_1.MedicalInformation)
], IntakeFullForm.prototype, "medicalInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "referral_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => referralInformation_1.ReferralInformation, (referralInformation) => referralInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'referral_information_id' }),
    __metadata("design:type", referralInformation_1.ReferralInformation)
], IntakeFullForm.prototype, "referralInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "intake_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => intakeInformation_1.IntakeInformation, (intakeInformation) => intakeInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'intake_information_id' }),
    __metadata("design:type", intakeInformation_1.IntakeInformation)
], IntakeFullForm.prototype, "intakeInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "emergency_contact_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => emergencyContactInformation_1.IntakeEmergencyContactInformation, (emergencyContactInformation) => emergencyContactInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'emergency_contact_information_id' }),
    __metadata("design:type", emergencyContactInformation_1.IntakeEmergencyContactInformation)
], IntakeFullForm.prototype, "emergencyContactInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "profile_picture", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IntakeFullForm.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], IntakeFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IntakeFullForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], IntakeFullForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], IntakeFullForm.prototype, "deleted_at", void 0);
IntakeFullForm = __decorate([
    (0, typeorm_1.Entity)('intake_full_form')
], IntakeFullForm);
exports.IntakeFullForm = IntakeFullForm;
//# sourceMappingURL=intakeFullForm.js.map