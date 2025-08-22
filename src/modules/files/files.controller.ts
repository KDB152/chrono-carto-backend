import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async getAllFiles(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('category') category?: string
  ) {
    return this.filesService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      type,
      category
    });
  }

  @Get(':id')
  async getFile(@Param('id') id: string) {
    return this.filesService.findOne(parseInt(id));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    return this.filesService.uploadFile(file, body);
  }

  @Patch(':id')
  async updateFile(@Param('id') id: string, @Body() updateData: any) {
    return this.filesService.update(parseInt(id), updateData);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    return this.filesService.remove(parseInt(id));
  }

  @Get('categories')
  async getCategories() {
    return this.filesService.getCategories();
  }

  @Get('types')
  async getFileTypes() {
    return this.filesService.getFileTypes();
  }

  @Post('bulk-delete')
  async bulkDelete(@Body() body: { ids: number[] }) {
    return this.filesService.bulkDelete(body.ids);
  }

  @Post('bulk-move')
  async bulkMove(@Body() body: { ids: number[], category: string }) {
    return this.filesService.bulkMove(body.ids, body.category);
  }

  @Get('search')
  async searchFiles(@Query('query') query: string) {
    return this.filesService.searchFiles(query);
  }

  @Get('stats')
  async getFileStats() {
    return this.filesService.getFileStats();
  }

  @Post('download/:id')
  async downloadFile(@Param('id') id: string) {
    return this.filesService.downloadFile(parseInt(id));
  }

  @Post('share/:id')
  async shareFile(@Param('id') id: string, @Body() body: { users: number[] }) {
    return this.filesService.shareFile(parseInt(id), body.users);
  }
}
