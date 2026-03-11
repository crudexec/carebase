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
exports.MMRFullForm = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
const mmrAttestationForm_1 = require("./mmrAttestationForm");
const mmrSignatureForm_1 = require("./mmrSignatureForm");
const personalInformation_1 = require("./personalInformation");
let MMRFullForm = class MMRFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MMRFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MMRFullForm.prototype, "personal_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => personalInformation_1.MMREmployeeInformation, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'personal_information_id' }),
    __metadata("design:type", personalInformation_1.MMREmployeeInformation)
], MMRFullForm.prototype, "personal_information", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MMRFullForm.prototype, "attestation_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => mmrAttestationForm_1.MMRAttestationForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'attestation_id' }),
    __metadata("design:type", mmrAttestationForm_1.MMRAttestationForm)
], MMRFullForm.prototype, "attestation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MMRFullForm.prototype, "signature_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => mmrSignatureForm_1.MMRSignatureForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'signature_id' }),
    __metadata("design:type", mmrSignatureForm_1.MMRSignatureForm)
], MMRFullForm.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], MMRFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], MMRFullForm.prototype, "review_notes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MMRFullForm.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], MMRFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MMRFullForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MMRFullForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], MMRFullForm.prototype, "deleted_at", void 0);
MMRFullForm = __decorate([
    (0, typeorm_1.Entity)('mmr_full_form')
], MMRFullForm);
exports.MMRFullForm = MMRFullForm;
//# sourceMappingURL=mmrFullForm.js.map