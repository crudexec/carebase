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
exports.IntakeEmergencyContactInformation = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
let IntakeEmergencyContactInformation = class IntakeEmergencyContactInformation {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "relationship", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "street_number_and_house_address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "zip_code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "apartment_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "home_phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "work_phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeEmergencyContactInformation.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], IntakeEmergencyContactInformation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IntakeEmergencyContactInformation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], IntakeEmergencyContactInformation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], IntakeEmergencyContactInformation.prototype, "deleted_at", void 0);
IntakeEmergencyContactInformation = __decorate([
    (0, typeorm_1.Entity)('intake_emergency_contact_information')
], IntakeEmergencyContactInformation);
exports.IntakeEmergencyContactInformation = IntakeEmergencyContactInformation;
//# sourceMappingURL=emergencyContactInformation.js.map