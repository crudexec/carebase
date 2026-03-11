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
exports.MoreAboutInformation = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
var CommunicationModes;
(function (CommunicationModes) {
    CommunicationModes["Verbal"] = "Verbal";
    CommunicationModes["Non_Verbal"] = "Non_Verbal";
    CommunicationModes["Sign_Language"] = "Sign_Language";
    CommunicationModes["PECS"] = "PECS";
})(CommunicationModes || (CommunicationModes = {}));
var Toileting;
(function (Toileting) {
    Toileting["Toilet_Trained"] = "Toilet_Trained";
    Toileting["Not_Toilet_Trained"] = "Not_Toilet_Trained";
    Toileting["Toilet_Trained_But_Requires_Supervision"] = "Toilet_Trained_But_Requires_Supervision";
})(Toileting || (Toileting = {}));
var DocumentProvided;
(function (DocumentProvided) {
    DocumentProvided["IEP"] = "IEP";
    DocumentProvided["Behavior_Plan"] = "Behavior_Plan";
    DocumentProvided["Psychological_Evaluation"] = "Psychological_Evaluation";
})(DocumentProvided || (DocumentProvided = {}));
let MoreAboutInformation = class MoreAboutInformation {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "things_I_can_do_by_myself", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "things_I_need_help_with", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "new_skills_I_want_to_learn", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "my_hobbies", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "favorite_food_and_snacks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "what_makes_me_mad", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "behaviors_I_sometimes_Display", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "ways_my_behaviors_can_be_managed", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "my_house_rules", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'simple-array',
    }),
    __metadata("design:type", Array)
], MoreAboutInformation.prototype, "familiar_communication_modes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], MoreAboutInformation.prototype, "can_be_transported_alone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: Toileting,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "toileting", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Gender,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "cared_for_by", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: DocumentProvided,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "document_provided_during_intake", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "good_performance_reward", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "other_comments", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MoreAboutInformation.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], MoreAboutInformation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MoreAboutInformation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MoreAboutInformation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], MoreAboutInformation.prototype, "deleted_at", void 0);
MoreAboutInformation = __decorate([
    (0, typeorm_1.Entity)('more_about_information')
], MoreAboutInformation);
exports.MoreAboutInformation = MoreAboutInformation;
//# sourceMappingURL=moreAboutClient.js.map