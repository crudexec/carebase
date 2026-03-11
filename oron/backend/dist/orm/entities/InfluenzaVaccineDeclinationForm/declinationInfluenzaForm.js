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
exports.InfluenzaVaccinationDeclinationForm = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
let InfluenzaVaccinationDeclinationForm = class InfluenzaVaccinationDeclinationForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InfluenzaVaccinationDeclinationForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], InfluenzaVaccinationDeclinationForm.prototype, "aware_influenza_serious_disease", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], InfluenzaVaccinationDeclinationForm.prototype, "aware_vaccine_available_to_protect", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], InfluenzaVaccinationDeclinationForm.prototype, "can_shed_virus_after_contracting", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], InfluenzaVaccinationDeclinationForm.prototype, "can_spread_influenza_without_symptoms", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], InfluenzaVaccinationDeclinationForm.prototype, "my_influenza_vaccine_immunity_changes_every_year", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], InfluenzaVaccinationDeclinationForm.prototype, "can_not_get_influenza_from_vaccine", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], InfluenzaVaccinationDeclinationForm.prototype, "consequences_of_vaccination_refusal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], InfluenzaVaccinationDeclinationForm.prototype, "reason_for_declining_vaccine", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], InfluenzaVaccinationDeclinationForm.prototype, "can_change_mind_and_accept_vaccine", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InfluenzaVaccinationDeclinationForm.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], InfluenzaVaccinationDeclinationForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InfluenzaVaccinationDeclinationForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InfluenzaVaccinationDeclinationForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], InfluenzaVaccinationDeclinationForm.prototype, "deleted_at", void 0);
InfluenzaVaccinationDeclinationForm = __decorate([
    (0, typeorm_1.Entity)('influenza_vaccination_declination')
], InfluenzaVaccinationDeclinationForm);
exports.InfluenzaVaccinationDeclinationForm = InfluenzaVaccinationDeclinationForm;
//# sourceMappingURL=declinationInfluenzaForm.js.map