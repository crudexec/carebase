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
exports.EmployeePersonalInformation = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const genericEnums_2 = require("types/genericEnums");
const User_1 = require("../User");
let EmployeePersonalInformation = class EmployeePersonalInformation {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], EmployeePersonalInformation.prototype, "date_of_birth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "home_phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "street_address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "zip_code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        enum: genericEnums_1.Gender,
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Ethnicity,
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "race_or_ethinicity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        unique: true,
        length: 9,
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "social_security_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: genericEnums_2.Status,
        default: genericEnums_2.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "review_notes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmployeePersonalInformation.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], EmployeePersonalInformation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmployeePersonalInformation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EmployeePersonalInformation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], EmployeePersonalInformation.prototype, "deleted_at", void 0);
EmployeePersonalInformation = __decorate([
    (0, typeorm_1.Entity)('employee_personal_information')
], EmployeePersonalInformation);
exports.EmployeePersonalInformation = EmployeePersonalInformation;
//# sourceMappingURL=personalInformation.js.map