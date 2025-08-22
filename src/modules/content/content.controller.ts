import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('courses')
  listCourses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('subject') subject?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.contentService.listCourses({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      subject,
      type,
      status,
    });
  }

  @Post('courses')
  createCourse(@Body() body: any) {
    return this.contentService.createCourse(body);
  }

  @Patch('courses/:id')
  updateCourse(@Param('id') id: string, @Body() body: any) {
    return this.contentService.updateCourse(parseInt(id), body);
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id') id: string) {
    return this.contentService.deleteCourse(parseInt(id));
  }
}
