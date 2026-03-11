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
exports.VaricellaEmployeeInformation = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
let VaricellaEmployeeInformation = class VaricellaEmployeeInformation {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VaricellaEmployeeInformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VaricellaEmployeeInformation.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VaricellaEmployeeInformation.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], VaricellaEmployeeInformation.prototype, "job_title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], VaricellaEmployeeInformation.prototype, "date_of_filling_form", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VaricellaEmployeeInformation.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], VaricellaEmployeeInformation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VaricellaEmployeeInformation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VaricellaEmployeeInformation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], VaricellaEmployeeInformation.prototype, "deleted_at", void 0);
VaricellaEmployeeInformation = __decorate([
    (0, typeorm_1.Entity)('varicella_employee_information')
], VaricellaEmployeeInformation);
exports.VaricellaEmployeeInformation = VaricellaEmployeeInformation;
//# sourceMappingURL=personalInformation.js.map