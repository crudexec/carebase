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
exports.SpecificNeedsFullForm = void 0;
const typeorm_1 = require("typeorm");
const BasicInformation_1 = require("./BasicInformation");
const ServiceNeeds_1 = require("./ServiceNeeds");
const CurrentNeedOrSupport_1 = require("./CurrentNeedOrSupport");
const Authorization_1 = require("./Authorization");
const intakeFullForm_1 = require("../IntakeForm/intakeFullForm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
let SpecificNeedsFullForm = class SpecificNeedsFullForm {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SpecificNeedsFullForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SpecificNeedsFullForm.prototype, "basic_information_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => BasicInformation_1.SpecificNeedsBasicInformation),
    (0, typeorm_1.JoinColumn)({ name: 'basic_information_id' }),
    __metadata("design:type", BasicInformation_1.SpecificNeedsBasicInformation)
], SpecificNeedsFullForm.prototype, "basicInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SpecificNeedsFullForm.prototype, "service_needs_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ServiceNeeds_1.ServiceNeeds),
    (0, typeorm_1.JoinColumn)({ name: 'service_needs_id' }),
    __metadata("design:type", ServiceNeeds_1.ServiceNeeds)
], SpecificNeedsFullForm.prototype, "serviceNeeds", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SpecificNeedsFullForm.prototype, "current_need_or_support_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CurrentNeedOrSupport_1.CurrentNeedOrSupport),
    (0, typeorm_1.JoinColumn)({ name: 'current_need_or_support_id' }),
    __metadata("design:type", CurrentNeedOrSupport_1.CurrentNeedOrSupport)
], SpecificNeedsFullForm.prototype, "currentNeedOrSupport", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SpecificNeedsFullForm.prototype, "authorization_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Authorization_1.Authorization),
    (0, typeorm_1.JoinColumn)({ name: 'authorization_id' }),
    __metadata("design:type", Authorization_1.Authorization)
], SpecificNeedsFullForm.prototype, "authorization", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SpecificNeedsFullForm.prototype, "intake_full_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intakeFullForm_1.IntakeFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'intake_full_id' }),
    __metadata("design:type", intakeFullForm_1.IntakeFullForm)
], SpecificNeedsFullForm.prototype, "intakeFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.DRAFT,
    }),
    __metadata("design:type", String)
], SpecificNeedsFullForm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SpecificNeedsFullForm.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], SpecificNeedsFullForm.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SpecificNeedsFullForm.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SpecificNeedsFullForm.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], SpecificNeedsFullForm.prototype, "deleted_at", void 0);
SpecificNeedsFullForm = __decorate([
    (0, typeorm_1.Entity)('specific_needs_full_form')
], SpecificNeedsFullForm);
exports.SpecificNeedsFullForm = SpecificNeedsFullForm;
//# sourceMappingURL=SpecificNeedsFullForm.js.map