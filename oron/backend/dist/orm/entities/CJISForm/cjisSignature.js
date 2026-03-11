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
exports.CJISSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
let CJISSignatureForm = class CJISSignatureForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CJISSignatureForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CJISSignatureForm.prototype, "signature_data", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CJISSignatureForm.prototype, "signed_by", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'signed_by' }),
    __metadata("design:type", User_1.User)
], CJISSignatureForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], CJISSignatureForm.prototype, "cjis_form_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CJISSignatureForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CJISSignatureForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], CJISSignatureForm.prototype, "deleted_at", void 0);
CJISSignatureForm = __decorate([
    (0, typeorm_1.Entity)('cjis_signature_form')
], CJISSignatureForm);
exports.CJISSignatureForm = CJISSignatureForm;
//# sourceMappingURL=cjisSignature.js.map