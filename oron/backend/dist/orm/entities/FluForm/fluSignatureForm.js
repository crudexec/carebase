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
exports.FluSignatureForm = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
const vaccineAttestationForm_1 = require("./vaccineAttestationForm");
let FluSignatureForm = class FluSignatureForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FluSignatureForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FluSignatureForm.prototype, "signature_data", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FluSignatureForm.prototype, "signed_by", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'signed_by' }),
    __metadata("design:type", User_1.User)
], FluSignatureForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], FluSignatureForm.prototype, "flu_form_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => vaccineAttestationForm_1.FluAttestationForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'flu_form_id' }),
    __metadata("design:type", vaccineAttestationForm_1.FluAttestationForm)
], FluSignatureForm.prototype, "form", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FluSignatureForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FluSignatureForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], FluSignatureForm.prototype, "deleted_at", void 0);
FluSignatureForm = __decorate([
    (0, typeorm_1.Entity)('flu_signature_form')
], FluSignatureForm);
exports.FluSignatureForm = FluSignatureForm;
//# sourceMappingURL=fluSignatureForm.js.map