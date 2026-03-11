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
exports.FluFullForm = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
const fluSignatureForm_1 = require("./fluSignatureForm");
const personalInformation_1 = require("./personalInformation");
const vaccineAttestationForm_1 = require("./vaccineAttestationForm");
let FluFullForm = class FluFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FluFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FluFullForm.prototype, "personal_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => personalInformation_1.FluEmployeeInformation, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'personal_information_id' }),
    __metadata("design:type", personalInformation_1.FluEmployeeInformation)
], FluFullForm.prototype, "personal_information", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FluFullForm.prototype, "attestation_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => vaccineAttestationForm_1.FluAttestationForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'attestation_id' }),
    __metadata("design:type", vaccineAttestationForm_1.FluAttestationForm)
], FluFullForm.prototype, "attestation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FluFullForm.prototype, "signature_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => fluSignatureForm_1.FluSignatureForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'signature_id' }),
    __metadata("design:type", fluSignatureForm_1.FluSignatureForm)
], FluFullForm.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], FluFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], FluFullForm.prototype, "review_notes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FluFullForm.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], FluFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FluFullForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FluFullForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], FluFullForm.prototype, "deleted_at", void 0);
FluFullForm = __decorate([
    (0, typeorm_1.Entity)('flu_full_form')
], FluFullForm);
exports.FluFullForm = FluFullForm;
//# sourceMappingURL=fluFullForm.js.map