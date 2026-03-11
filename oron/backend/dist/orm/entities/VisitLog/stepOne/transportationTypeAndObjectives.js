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
exports.TransportationTypeAndObjectives = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../../User");
const visitFullForm_1 = require("../visitFullForm");
const treatmentFullPlan_1 = require("../../TreatmentPlan/treatmentFullPlan");
let TransportationTypeAndObjectives = class TransportationTypeAndObjectives {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TransportationTypeAndObjectives.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], TransportationTypeAndObjectives.prototype, "transportation_type_details", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], TransportationTypeAndObjectives.prototype, "transportation_safety_objectives", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], TransportationTypeAndObjectives.prototype, "unusual_occurrences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], TransportationTypeAndObjectives.prototype, "traffic_sign_recognition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], TransportationTypeAndObjectives.prototype, "directional_concepts", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TransportationTypeAndObjectives.prototype, "treatment_plan_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatmentFullPlan_1.TreatmentFullPlan),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_plan_id' }),
    __metadata("design:type", treatmentFullPlan_1.TreatmentFullPlan)
], TransportationTypeAndObjectives.prototype, "treatmentFullPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TransportationTypeAndObjectives.prototype, "visit_full_form_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visitFullForm_1.VisitFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'visit_full_form_id' }),
    __metadata("design:type", visitFullForm_1.VisitFullForm)
], TransportationTypeAndObjectives.prototype, "visitFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], TransportationTypeAndObjectives.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TransportationTypeAndObjectives.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TransportationTypeAndObjectives.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], TransportationTypeAndObjectives.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TransportationTypeAndObjectives.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TransportationTypeAndObjectives.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], TransportationTypeAndObjectives.prototype, "deleted_at", void 0);
TransportationTypeAndObjectives = __decorate([
    (0, typeorm_1.Entity)('transportation_type_and_objectives')
], TransportationTypeAndObjectives);
exports.TransportationTypeAndObjectives = TransportationTypeAndObjectives;
//# sourceMappingURL=transportationTypeAndObjectives.js.map