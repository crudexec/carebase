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
exports.TuberculosisMantouxForm = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
let TuberculosisMantouxForm = class TuberculosisMantouxForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TuberculosisMantouxForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "had_tb_infection", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "had_positive_tb_skin_test", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], TuberculosisMantouxForm.prototype, "had_tb_infection_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], TuberculosisMantouxForm.prototype, "had_positive_tb_skin_test_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "have_you_been_immunized_with_bcg_vaccine", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], TuberculosisMantouxForm.prototype, "immunization_description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "vaccine_past_two_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "steriod_injection_past_two_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "exposure_to_tb_past_two_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "coughing_blood", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "profuse_night_sweats", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "loss_of_appetite", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "unexplained_weight_loss", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "chill_or_fever", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "persistent_cough_last_two_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "chest_pain", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Date,
    }),
    __metadata("design:type", Date)
], TuberculosisMantouxForm.prototype, "last_chest_xray_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "spent_time_with_tb_patient_in_the_last_two_years", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "were_you_born_in_a_country_where_tb_is_common", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TuberculosisMantouxForm.prototype, "country_of_birth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "traveled_to_a_country_where_tb_is_common", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TuberculosisMantouxForm.prototype, "country_of_travel", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], TuberculosisMantouxForm.prototype, "members_of_family_traveled_to_US_from_another_country", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TuberculosisMantouxForm.prototype, "family_country_of_travel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TuberculosisMantouxForm.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'owner' }),
    __metadata("design:type", User_1.User)
], TuberculosisMantouxForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TuberculosisMantouxForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TuberculosisMantouxForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], TuberculosisMantouxForm.prototype, "deleted_at", void 0);
TuberculosisMantouxForm = __decorate([
    (0, typeorm_1.Entity)('tuberculosis_mantoux_form')
], TuberculosisMantouxForm);
exports.TuberculosisMantouxForm = TuberculosisMantouxForm;
//# sourceMappingURL=tuberculosisTestingForm.js.map