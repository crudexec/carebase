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
exports.VaricellaFullForm = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
const personalInformation_1 = require("./personalInformation");
const varicellaAttestation_1 = require("./varicellaAttestation");
const varicellaSignatureForm_1 = require("./varicellaSignatureForm");
let VaricellaFullForm = class VaricellaFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VaricellaFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VaricellaFullForm.prototype, "personal_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => personalInformation_1.VaricellaEmployeeInformation, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'personal_information_id' }),
    __metadata("design:type", personalInformation_1.VaricellaEmployeeInformation)
], VaricellaFullForm.prototype, "personal_information", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VaricellaFullForm.prototype, "attestation_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => varicellaAttestation_1.VaricellaAttestationForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'attestation_id' }),
    __metadata("design:type", varicellaAttestation_1.VaricellaAttestationForm)
], VaricellaFullForm.prototype, "attestation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VaricellaFullForm.prototype, "signature_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => varicellaSignatureForm_1.VaricellaSignatureForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'signature_id' }),
    __metadata("design:type", varicellaSignatureForm_1.VaricellaSignatureForm)
], VaricellaFullForm.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], VaricellaFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], VaricellaFullForm.prototype, "review_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VaricellaFullForm.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], VaricellaFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VaricellaFullForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VaricellaFullForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], VaricellaFullForm.prototype, "deleted_at", void 0);
VaricellaFullForm = __decorate([
    (0, typeorm_1.Entity)('varicella_full_form')
], VaricellaFullForm);
exports.VaricellaFullForm = VaricellaFullForm;
//# sourceMappingURL=varicellaFullForm.js.map