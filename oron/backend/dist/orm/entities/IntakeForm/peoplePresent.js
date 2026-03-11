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
exports.PeoplePresentInformation = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
const intakeInformation_1 = require("./intakeInformation");
let PeoplePresentInformation = class PeoplePresentInformation {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PeoplePresentInformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], PeoplePresentInformation.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], PeoplePresentInformation.prototype, "relationship_to_participant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PeoplePresentInformation.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], PeoplePresentInformation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], PeoplePresentInformation.prototype, "intake_information_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intakeInformation_1.IntakeInformation),
    (0, typeorm_1.JoinColumn)({ name: 'intake_information_id' }),
    __metadata("design:type", intakeInformation_1.IntakeInformation)
], PeoplePresentInformation.prototype, "intakeInformation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PeoplePresentInformation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PeoplePresentInformation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], PeoplePresentInformation.prototype, "deleted_at", void 0);
PeoplePresentInformation = __decorate([
    (0, typeorm_1.Entity)('people_present_information')
], PeoplePresentInformation);
exports.PeoplePresentInformation = PeoplePresentInformation;
//# sourceMappingURL=peoplePresent.js.map