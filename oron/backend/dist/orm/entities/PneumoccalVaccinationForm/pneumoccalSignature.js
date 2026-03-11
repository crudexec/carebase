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
exports.PneumococcalSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
const pneumococcalVaccinationForm_1 = require("./pneumococcalVaccinationForm");
let PneumococcalSignatureForm = class PneumococcalSignatureForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PneumococcalSignatureForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PneumococcalSignatureForm.prototype, "signature_data", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PneumococcalSignatureForm.prototype, "signed_by", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'signed_by' }),
    __metadata("design:type", User_1.User)
], PneumococcalSignatureForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], PneumococcalSignatureForm.prototype, "pneumococcal_form_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => pneumococcalVaccinationForm_1.PneumococcalVaccinationForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'pneumococcal_form_id' }),
    __metadata("design:type", pneumococcalVaccinationForm_1.PneumococcalVaccinationForm)
], PneumococcalSignatureForm.prototype, "form", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PneumococcalSignatureForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PneumococcalSignatureForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], PneumococcalSignatureForm.prototype, "deleted_at", void 0);
PneumococcalSignatureForm = __decorate([
    (0, typeorm_1.Entity)('pneumococcal_signature')
], PneumococcalSignatureForm);
exports.PneumococcalSignatureForm = PneumococcalSignatureForm;
//# sourceMappingURL=pneumoccalSignature.js.map