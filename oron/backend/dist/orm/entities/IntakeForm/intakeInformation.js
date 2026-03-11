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
exports.IntakeInformation = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
const peoplePresent_1 = require("./peoplePresent");
let IntakeInformation = class IntakeInformation {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntakeInformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeInformation.prototype, "who_conducted_intake", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], IntakeInformation.prototype, "date_of_intake", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], IntakeInformation.prototype, "people_present", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => peoplePresent_1.PeoplePresentInformation, (peoplePresentInformation) => peoplePresentInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'people_present' }),
    __metadata("design:type", peoplePresent_1.PeoplePresentInformation)
], IntakeInformation.prototype, "peoplePresentInformation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IntakeInformation.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], IntakeInformation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IntakeInformation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], IntakeInformation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], IntakeInformation.prototype, "deleted_at", void 0);
IntakeInformation = __decorate([
    (0, typeorm_1.Entity)('intake_information')
], IntakeInformation);
exports.IntakeInformation = IntakeInformation;
//# sourceMappingURL=intakeInformation.js.map