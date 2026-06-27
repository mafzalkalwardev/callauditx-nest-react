import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get('categories')
  async getCategories(@Req() req: any) {
    if (req.user.role === 'ADMIN') {
      return this.service.getCategories();
    }
    if (!req.user.clientId) {
      throw new ForbiddenException('Client account required');
    }
    return this.service.getCategories(req.user.clientId);
  }

  @Post('categories')
  async createCategory(@Body() dto: any, @Req() req: any) {
    if (req.user.role !== 'CLIENT' || !req.user.clientId) {
      throw new ForbiddenException('Only clients can create categories');
    }
    return this.service.createCategory(dto, req.user.clientId);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.service.deleteCategory(id);
  }

  @Get('categories/:catId/questions')
  async getQuestions(@Param('catId') catId: string) {
    return this.service.getQuestions(catId);
  }

  @Post('categories/:catId/questions')
  async createQuestion(@Param('catId') catId: string, @Body() dto: any) {
    return this.service.createQuestion(dto, catId);
  }

  @Post('categories/:catId/questions/bulk')
  async bulkImportQuestions(@Param('catId') catId: string, @Body() body: any) {
    // Body is an array of questions { text, type, options }
    const rows = Array.isArray(body) ? body : (body.questions || []);
    return this.service.bulkImportQuestions(catId, rows);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.service.deleteQuestion(id);
  }
}
