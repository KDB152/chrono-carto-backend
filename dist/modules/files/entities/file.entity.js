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
exports.File = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let File = class File {
};
exports.File = File;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], File.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, comment: 'Titre du fichier' }),
    __metadata("design:type", String)
], File.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: 'Description du fichier' }),
    __metadata("design:type", String)
], File.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_name', type: 'varchar', length: 255, comment: 'Nom du fichier original' }),
    __metadata("design:type", String)
], File.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stored_name', type: 'varchar', length: 255, comment: 'Nom du fichier stocké' }),
    __metadata("design:type", String)
], File.prototype, "storedName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_path', type: 'varchar', length: 500, comment: 'Chemin du fichier sur le serveur' }),
    __metadata("design:type", String)
], File.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_type', type: 'varchar', length: 100, comment: 'Type MIME du fichier' }),
    __metadata("design:type", String)
], File.prototype, "fileType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size', type: 'bigint', comment: 'Taille du fichier en octets' }),
    __metadata("design:type", Number)
], File.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_class', type: 'json', comment: 'Classe/groupe cible (ancien format)', nullable: true }),
    __metadata("design:type", String)
], File.prototype, "targetClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_classes', type: 'json', comment: 'Classes/groupes cibles (array JSON)', nullable: true }),
    __metadata("design:type", Array)
], File.prototype, "targetClasses", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_by', type: 'int', comment: 'ID de l\'utilisateur qui a uploadé le fichier' }),
    __metadata("design:type", Number)
], File.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_public', type: 'boolean', default: false, comment: 'Fichier public ou privé' }),
    __metadata("design:type", Boolean)
], File.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true, comment: 'Fichier actif ou supprimé' }),
    __metadata("design:type", Boolean)
], File.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'download_count', type: 'int', default: 0, comment: 'Nombre de téléchargements' }),
    __metadata("design:type", Number)
], File.prototype, "downloadCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', comment: 'Date d\'upload' }),
    __metadata("design:type", Date)
], File.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', comment: 'Date de mise à jour' }),
    __metadata("design:type", Date)
], File.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'uploaded_by' }),
    __metadata("design:type", user_entity_1.User)
], File.prototype, "uploader", void 0);
exports.File = File = __decorate([
    (0, typeorm_1.Entity)('files')
], File);
//# sourceMappingURL=file.entity.js.map