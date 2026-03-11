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
exports.Communication = void 0;
const typeorm_1 = require("typeorm");
const treatmentFullPlan_1 = require("../../TreatmentPlan/treatmentFullPlan");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../../User");
const visitFullForm_1 = require("../visitFullForm");
let Communication = class Communication {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Communication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "gestures", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "written_words", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "picture_communication_symbols", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "objects", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "short_phrases", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "repetitive_phrases", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "icons_pictures", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "verbal_sounds", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "type_words", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "single_words", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "photographs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "sign_language", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "an_augmentative_communication_device", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "picture_exchange_communication_system", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], Communication.prototype, "other", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], Communication.prototype, "other_description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], Communication.prototype, "treatment_plan_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatmentFullPlan_1.TreatmentFullPlan),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_plan_id' }),
    __metadata("design:type", treatmentFullPlan_1.TreatmentFullPlan)
], Communication.prototype, "treatmentFullPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], Communication.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], Communication.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], Communication.prototype, "visit_full_form_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visitFullForm_1.VisitFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'visit_full_form_id' }),
    __metadata("design:type", visitFullForm_1.VisitFullForm)
], Communication.prototype, "visitFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], Communication.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], Communication.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Communication.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Communication.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Communication.prototype, "deleted_at", void 0);
Communication = __decorate([
    (0, typeorm_1.Entity)('communication')
], Communication);
exports.Communication = Communication;
//# sourceMappingURL=communication.js.map