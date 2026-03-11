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
exports.AdmissionInformation = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
const waiverService_1 = require("./waiverService");
let AdmissionInformation = class AdmissionInformation {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AdmissionInformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], AdmissionInformation.prototype, "poc_authorization_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], AdmissionInformation.prototype, "poc_start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], AdmissionInformation.prototype, "poc_end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], AdmissionInformation.prototype, "waiver_services", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => waiverService_1.WaiverServices, (waiverServices) => waiverServices.id),
    (0, typeorm_1.JoinColumn)({ name: 'waiver_services' }),
    __metadata("design:type", waiverService_1.WaiverServices)
], AdmissionInformation.prototype, "waiverServices", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AdmissionInformation.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], AdmissionInformation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AdmissionInformation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AdmissionInformation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], AdmissionInformation.prototype, "deleted_at", void 0);
AdmissionInformation = __decorate([
    (0, typeorm_1.Entity)('admission_information')
], AdmissionInformation);
exports.AdmissionInformation = AdmissionInformation;
//# sourceMappingURL=admissionInformation.js.map