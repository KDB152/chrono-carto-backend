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
exports.FilesTestController = void 0;
const common_1 = require("@nestjs/common");
const files_service_1 = require("./files.service");
let FilesTestController = class FilesTestController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    async testEndpoint() {
        return {
            message: 'Files API is working!',
            timestamp: new Date().toISOString(),
            filesCount: await this.filesService.findAll().then(files => files.length)
        };
    }
    async getAvailableClasses() {
        return this.filesService.getAvailableClasses();
    }
    async getStats() {
        return this.filesService.getFileStats();
    }
};
exports.FilesTestController = FilesTestController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesTestController.prototype, "testEndpoint", null);
__decorate([
    (0, common_1.Get)('classes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesTestController.prototype, "getAvailableClasses", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesTestController.prototype, "getStats", null);
exports.FilesTestController = FilesTestController = __decorate([
    (0, common_1.Controller)('files-test'),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesTestController);
//# sourceMappingURL=files-test.controller.js.map