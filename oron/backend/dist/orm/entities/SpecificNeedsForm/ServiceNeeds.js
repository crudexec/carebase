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
exports.ServiceNeeds = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("../IntakeForm/intakeFullForm");
let ServiceNeeds = class ServiceNeeds {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServiceNeeds.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "iiss", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "therapeuticServices", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "respite", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "familyTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "transportToSchoolMorning", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "transportFromSchoolToTI", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "transportFromTIToHome", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "transportToCommunity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "noSupervisionNeeded", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "supervisionNeeded", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "harnessNeeded", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceNeeds.prototype, "hasPreferredCaregiver", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceNeeds.prototype, "preferredCaregiverName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceNeeds.prototype, "preferredCaregiverPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceNeeds.prototype, "preferredCaregiverPhoneCountry", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], ServiceNeeds.prototype, "intake_full_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intakeFullForm_1.IntakeFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'intake_full_id' }),
    __metadata("design:type", intakeFullForm_1.IntakeFullForm)
], ServiceNeeds.prototype, "intakeFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ServiceNeeds.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ServiceNeeds.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], ServiceNeeds.prototype, "deleted_at", void 0);
ServiceNeeds = __decorate([
    (0, typeorm_1.Entity)('specific_needs_service_needs')
], ServiceNeeds);
exports.ServiceNeeds = ServiceNeeds;
//# sourceMappingURL=ServiceNeeds.js.map