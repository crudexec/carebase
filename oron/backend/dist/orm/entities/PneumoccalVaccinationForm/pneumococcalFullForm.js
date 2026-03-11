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
exports.PneumococcalVaccinationFullForm = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
const employeeInformationForm_1 = require("./employeeInformationForm");
const pneumoccalSignature_1 = require("./pneumoccalSignature");
const pneumococcalVaccinationForm_1 = require("./pneumococcalVaccinationForm");
let PneumococcalVaccinationFullForm = class PneumococcalVaccinationFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PneumococcalVaccinationFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], PneumococcalVaccinationFullForm.prototype, "employee_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => employeeInformationForm_1.EmployeeInformation, (employeeInformation) => employeeInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'employee_information_id' }),
    __metadata("design:type", employeeInformationForm_1.EmployeeInformation)
], PneumococcalVaccinationFullForm.prototype, "employeeInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], PneumococcalVaccinationFullForm.prototype, "pneumococcal_vaccination_form_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => pneumococcalVaccinationForm_1.PneumococcalVaccinationForm, (pneumococcalVaccinationForm) => pneumococcalVaccinationForm.id),
    (0, typeorm_1.JoinColumn)({ name: 'pneumococcal_vaccination_form_id' }),
    __metadata("design:type", pneumococcalVaccinationForm_1.PneumococcalVaccinationForm)
], PneumococcalVaccinationFullForm.prototype, "pneumococcalVaccinationForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], PneumococcalVaccinationFullForm.prototype, "pneumococcal_signature_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => pneumoccalSignature_1.PneumococcalSignatureForm, (pneumococcalSignatureForm) => pneumococcalSignatureForm.id),
    (0, typeorm_1.JoinColumn)({ name: 'pneumococcal_signature_id' }),
    __metadata("design:type", pneumoccalSignature_1.PneumococcalSignatureForm)
], PneumococcalVaccinationFullForm.prototype, "pneumococcalSignatureForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], PneumococcalVaccinationFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], PneumococcalVaccinationFullForm.prototype, "review_notes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PneumococcalVaccinationFullForm.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], PneumococcalVaccinationFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PneumococcalVaccinationFullForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PneumococcalVaccinationFullForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], PneumococcalVaccinationFullForm.prototype, "deleted_at", void 0);
PneumococcalVaccinationFullForm = __decorate([
    (0, typeorm_1.Entity)('pneumococcal_full_form')
], PneumococcalVaccinationFullForm);
exports.PneumococcalVaccinationFullForm = PneumococcalVaccinationFullForm;
//# sourceMappingURL=pneumococcalFullForm.js.map