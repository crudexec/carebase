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
exports.TuberculosisFullForm = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
const ppdAdministrationForm_1 = require("./ppdAdministrationForm");
const tuberculosisFormSignature_1 = require("./tuberculosisFormSignature");
const tuberculosisTestingForm_1 = require("./tuberculosisTestingForm");
let TuberculosisFullForm = class TuberculosisFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TuberculosisFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TuberculosisFullForm.prototype, "ppd_administration_form_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => ppdAdministrationForm_1.PpdAdministrationForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'ppd_administration_form_id' }),
    __metadata("design:type", ppdAdministrationForm_1.PpdAdministrationForm)
], TuberculosisFullForm.prototype, "ppd_administration_form", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TuberculosisFullForm.prototype, "tuberculosis_testing_form_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tuberculosisTestingForm_1.TuberculosisMantouxForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'tuberculosis_testing_form_id' }),
    __metadata("design:type", tuberculosisTestingForm_1.TuberculosisMantouxForm)
], TuberculosisFullForm.prototype, "tuberculosis_testing_form", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TuberculosisFullForm.prototype, "tb_signature_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tuberculosisFormSignature_1.TuberculosisSignatureForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'tb_signature_id' }),
    __metadata("design:type", tuberculosisFormSignature_1.TuberculosisSignatureForm)
], TuberculosisFullForm.prototype, "tb_signature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], TuberculosisFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], TuberculosisFullForm.prototype, "review_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TuberculosisFullForm.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'owner' }),
    __metadata("design:type", User_1.User)
], TuberculosisFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TuberculosisFullForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TuberculosisFullForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], TuberculosisFullForm.prototype, "deleted_at", void 0);
TuberculosisFullForm = __decorate([
    (0, typeorm_1.Entity)('tuberculosis_full_form')
], TuberculosisFullForm);
exports.TuberculosisFullForm = TuberculosisFullForm;
//# sourceMappingURL=tuberculosisFullForm.js.map