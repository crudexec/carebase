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
exports.N95FitFullForm = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
const attestationForm_1 = require("./attestationForm");
const signatureForm_1 = require("./signatureForm");
let N95FitFullForm = class N95FitFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], N95FitFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], N95FitFullForm.prototype, "attestation_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => attestationForm_1.N95FitAttestationForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'attestation_id' }),
    __metadata("design:type", attestationForm_1.N95FitAttestationForm)
], N95FitFullForm.prototype, "attestation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], N95FitFullForm.prototype, "signature_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => signatureForm_1.N95FitSignatureForm, (form) => form.id),
    (0, typeorm_1.JoinColumn)({ name: 'signature_id' }),
    __metadata("design:type", signatureForm_1.N95FitSignatureForm)
], N95FitFullForm.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], N95FitFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], N95FitFullForm.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], N95FitFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], N95FitFullForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], N95FitFullForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], N95FitFullForm.prototype, "deleted_at", void 0);
N95FitFullForm = __decorate([
    (0, typeorm_1.Entity)('n95_fit_full_form')
], N95FitFullForm);
exports.N95FitFullForm = N95FitFullForm;
//# sourceMappingURL=n95FullForm.js.map