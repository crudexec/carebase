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
exports.SelfManagement = void 0;
const typeorm_1 = require("typeorm");
const treatmentFullPlan_1 = require("../../TreatmentPlan/treatmentFullPlan");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../../User");
const visitFullForm_1 = require("../visitFullForm");
let SelfManagement = class SelfManagement {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SelfManagement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "responding_to_others", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "sharing", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "increasing_on_task_behavior", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "initiating_interactions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "conversing_with_others", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "increasing_play_skills", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "promoting_daily_living_skills", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "taking_turns", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "following_the_rules", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "reducing_occurence_of_interfering_behavior", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "cooperate_with_peers_in_group_activity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SelfManagement.prototype, "other", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SelfManagement.prototype, "treatment_plan_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatmentFullPlan_1.TreatmentFullPlan),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_plan_id' }),
    __metadata("design:type", treatmentFullPlan_1.TreatmentFullPlan)
], SelfManagement.prototype, "treatmentFullPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SelfManagement.prototype, "visit_full_form_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visitFullForm_1.VisitFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'visit_full_form_id' }),
    __metadata("design:type", visitFullForm_1.VisitFullForm)
], SelfManagement.prototype, "visitFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], SelfManagement.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SelfManagement.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SelfManagement.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], SelfManagement.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SelfManagement.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SelfManagement.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], SelfManagement.prototype, "deleted_at", void 0);
SelfManagement = __decorate([
    (0, typeorm_1.Entity)('self_management')
], SelfManagement);
exports.SelfManagement = SelfManagement;
//# sourceMappingURL=selfManagement.js.map