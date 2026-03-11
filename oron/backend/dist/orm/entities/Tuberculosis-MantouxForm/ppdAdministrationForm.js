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
exports.PpdAdministrationForm = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
const tuberculosisTestingForm_1 = require("./tuberculosisTestingForm");
let PpdAdministrationForm = class PpdAdministrationForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PpdAdministrationForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], PpdAdministrationForm.prototype, "had_tb_infection", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], PpdAdministrationForm.prototype, "had_positive_tb_skin_test", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], PpdAdministrationForm.prototype, "had_tb_infection_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], PpdAdministrationForm.prototype, "had_positive_tb_skin_test_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], PpdAdministrationForm.prototype, "have_you_been_immunized_with_bcg_vaccine", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], PpdAdministrationForm.prototype, "immunization_description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], PpdAdministrationForm.prototype, "vaccine_past_two_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], PpdAdministrationForm.prototype, "steriod_injection_past_two_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], PpdAdministrationForm.prototype, "steriods_past_four_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], PpdAdministrationForm.prototype, "exposure_to_tb_after_last_tb_test", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PpdAdministrationForm.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], PpdAdministrationForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], PpdAdministrationForm.prototype, "tuberculosisMantouxForm_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tuberculosisTestingForm_1.TuberculosisMantouxForm, (tuberculosisMantouxForm) => tuberculosisMantouxForm.id),
    (0, typeorm_1.JoinColumn)({ name: 'tuberculosisMantouxForm_id' }),
    __metadata("design:type", tuberculosisTestingForm_1.TuberculosisMantouxForm)
], PpdAdministrationForm.prototype, "tuberculosisMantouxForm", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PpdAdministrationForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PpdAdministrationForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], PpdAdministrationForm.prototype, "deleted_at", void 0);
PpdAdministrationForm = __decorate([
    (0, typeorm_1.Entity)('ppd_administration_form')
], PpdAdministrationForm);
exports.PpdAdministrationForm = PpdAdministrationForm;
//# sourceMappingURL=ppdAdministrationForm.js.map