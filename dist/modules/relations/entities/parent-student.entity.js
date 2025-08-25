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
exports.ParentStudent = void 0;
const typeorm_1 = require("typeorm");
const parent_entity_1 = require("../../parents/entities/parent.entity");
const student_entity_1 = require("../../students/entities/student.entity");
let ParentStudent = class ParentStudent {
};
exports.ParentStudent = ParentStudent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ParentStudent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_id' }),
    __metadata("design:type", Number)
], ParentStudent.prototype, "parent_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'student_id' }),
    __metadata("design:type", Number)
], ParentStudent.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => parent_entity_1.Parent, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_id' }),
    __metadata("design:type", parent_entity_1.Parent)
], ParentStudent.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_entity_1.Student)
], ParentStudent.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ParentStudent.prototype, "created_at", void 0);
exports.ParentStudent = ParentStudent = __decorate([
    (0, typeorm_1.Entity)('parent_student')
], ParentStudent);
//# sourceMappingURL=parent-student.entity.js.map