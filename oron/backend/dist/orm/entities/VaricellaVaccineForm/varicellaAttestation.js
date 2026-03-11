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
exports.VaricellaAttestationForm = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
let VaricellaAttestationForm = class VaricellaAttestationForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VaricellaAttestationForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], VaricellaAttestationForm.prototype, "had_chicken_pox", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], VaricellaAttestationForm.prototype, "will_not_contract_chicken_pox", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], VaricellaAttestationForm.prototype, "chicken_pox_not_serious_disease", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], VaricellaAttestationForm.prototype, "side_effects_from_chicken_pox_vaccine", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], VaricellaAttestationForm.prototype, "will_stay_home_if_infected", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], VaricellaAttestationForm.prototype, "other", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VaricellaAttestationForm.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], VaricellaAttestationForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VaricellaAttestationForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VaricellaAttestationForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], VaricellaAttestationForm.prototype, "deleted_at", void 0);
VaricellaAttestationForm = __decorate([
    (0, typeorm_1.Entity)('varicella_attestation_form')
], VaricellaAttestationForm);
exports.VaricellaAttestationForm = VaricellaAttestationForm;
//# sourceMappingURL=varicellaAttestation.js.map