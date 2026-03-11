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
exports.VaricellaSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
const varicellaAttestation_1 = require("./varicellaAttestation");
let VaricellaSignatureForm = class VaricellaSignatureForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VaricellaSignatureForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VaricellaSignatureForm.prototype, "signature_data", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VaricellaSignatureForm.prototype, "signed_by", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'signed_by' }),
    __metadata("design:type", User_1.User)
], VaricellaSignatureForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VaricellaSignatureForm.prototype, "varicella_form_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => varicellaAttestation_1.VaricellaAttestationForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'varicella_form_id' }),
    __metadata("design:type", varicellaAttestation_1.VaricellaAttestationForm)
], VaricellaSignatureForm.prototype, "form", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VaricellaSignatureForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VaricellaSignatureForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], VaricellaSignatureForm.prototype, "deleted_at", void 0);
VaricellaSignatureForm = __decorate([
    (0, typeorm_1.Entity)('varicella_signature')
], VaricellaSignatureForm);
exports.VaricellaSignatureForm = VaricellaSignatureForm;
//# sourceMappingURL=varicellaSignatureForm.js.map