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
exports.CJISFullForm = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
const cjisEmployeeInformation_1 = require("./cjisEmployeeInformation");
const cjisPreRegistration_1 = require("./cjisPreRegistration");
const cjisSignature_1 = require("./cjisSignature");
let CJISFullForm = class CJISFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CJISFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], CJISFullForm.prototype, "employee_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => cjisEmployeeInformation_1.CJISEmployeeInformation, (employeeInformation) => employeeInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'employee_information_id' }),
    __metadata("design:type", cjisEmployeeInformation_1.CJISEmployeeInformation)
], CJISFullForm.prototype, "employeeInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], CJISFullForm.prototype, "signature_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => cjisSignature_1.CJISSignatureForm, (signature) => signature.id),
    (0, typeorm_1.JoinColumn)({ name: 'signature_id' }),
    __metadata("design:type", cjisSignature_1.CJISSignatureForm)
], CJISFullForm.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], CJISFullForm.prototype, "pre_registration_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => cjisPreRegistration_1.CJISPreRegistrationForm, (preRegistration) => preRegistration.id),
    (0, typeorm_1.JoinColumn)({ name: 'pre_registration_id' }),
    __metadata("design:type", cjisPreRegistration_1.CJISPreRegistrationForm)
], CJISFullForm.prototype, "preRegistration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], CJISFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], CJISFullForm.prototype, "review_notes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CJISFullForm.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], CJISFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CJISFullForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CJISFullForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], CJISFullForm.prototype, "deleted_at", void 0);
CJISFullForm = __decorate([
    (0, typeorm_1.Entity)('cjis_full_form')
], CJISFullForm);
exports.CJISFullForm = CJISFullForm;
//# sourceMappingURL=cjisFullForm.js.map