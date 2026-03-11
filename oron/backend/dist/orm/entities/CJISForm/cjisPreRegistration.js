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
exports.CJISPreRegistrationForm = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
const cjisFullForm_1 = require("./cjisFullForm");
let CJISPreRegistrationForm = class CJISPreRegistrationForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CJISPreRegistrationForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], CJISPreRegistrationForm.prototype, "pre_registration_pdf_url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], CJISPreRegistrationForm.prototype, "cjis_form_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => cjisFullForm_1.CJISFullForm, (cjisFullForm) => cjisFullForm.id),
    (0, typeorm_1.JoinColumn)({ name: 'cjis_form_id' }),
    __metadata("design:type", cjisFullForm_1.CJISFullForm)
], CJISPreRegistrationForm.prototype, "cjisFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], CJISPreRegistrationForm.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], CJISPreRegistrationForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CJISPreRegistrationForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CJISPreRegistrationForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], CJISPreRegistrationForm.prototype, "deleted_at", void 0);
CJISPreRegistrationForm = __decorate([
    (0, typeorm_1.Entity)('cjis_pre_registration_form')
], CJISPreRegistrationForm);
exports.CJISPreRegistrationForm = CJISPreRegistrationForm;
//# sourceMappingURL=cjisPreRegistration.js.map