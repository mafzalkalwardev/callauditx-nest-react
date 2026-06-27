import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { InMemoryDB } from '../in-memory-db';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getCategories(clientId?: string) {
    try {
      if (clientId) {
        return await this.prisma.category.findMany({
          where: { clientId },
          include: { questions: true },
        });
      }
      return await this.prisma.category.findMany({
        include: { questions: true, client: true },
      });
    } catch (e) {
      // Fallback to InMemoryDB
      if (clientId) {
        const cats = InMemoryDB.categories.filter(c => c.clientId === clientId);
        return cats.map(c => ({
          ...c,
          questions: InMemoryDB.questions.filter(q => q.categoryId === c.id),
        }));
      }
      return InMemoryDB.categories.map(c => {
        const client = InMemoryDB.clients.find(cl => cl.id === c.clientId);
        return {
          ...c,
          client,
          questions: InMemoryDB.questions.filter(q => q.categoryId === c.id),
        };
      });
    }
  }

  async createCategory(dto: any, clientId: string) {
    const { name, description } = dto;
    try {
      return await this.prisma.category.create({
        data: {
          name,
          description,
          clientId,
        },
      });
    } catch (e) {
      // Fallback
      const newCat = {
        id: `cat-${Date.now()}`,
        name,
        description,
        clientId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      InMemoryDB.categories.push(newCat);
      return newCat;
    }
  }

  async deleteCategory(id: string) {
    try {
      return await this.prisma.category.delete({ where: { id } });
    } catch (e) {
      const idx = InMemoryDB.categories.findIndex(c => c.id === id);
      if (idx !== -1) {
        const deleted = InMemoryDB.categories[idx];
        InMemoryDB.categories.splice(idx, 1);
        InMemoryDB.questions = InMemoryDB.questions.filter(q => q.categoryId !== id);
        return deleted;
      }
      throw new NotFoundException('Category not found');
    }
  }

  async getQuestions(categoryId: string) {
    try {
      return await this.prisma.question.findMany({
        where: { categoryId },
      });
    } catch (e) {
      return InMemoryDB.questions.filter(q => q.categoryId === categoryId);
    }
  }

  async createQuestion(dto: any, categoryId: string) {
    const { text, type, options } = dto;
    try {
      return await this.prisma.question.create({
        data: {
          text,
          type,
          options: options ? (Array.isArray(options) ? options.join(',') : options) : null,
          categoryId,
        },
      });
    } catch (e) {
      const newQ = {
        id: `q-${Date.now()}`,
        text,
        type,
        options: options ? (Array.isArray(options) ? options.join(',') : options) : null,
        categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      InMemoryDB.questions.push(newQ);
      return newQ;
    }
  }

  async deleteQuestion(id: string) {
    try {
      return await this.prisma.question.delete({ where: { id } });
    } catch (e) {
      const idx = InMemoryDB.questions.findIndex(q => q.id === id);
      if (idx !== -1) {
        const deleted = InMemoryDB.questions[idx];
        InMemoryDB.questions.splice(idx, 1);
        return deleted;
      }
      throw new NotFoundException('Question not found');
    }
  }

  // Bulk uploads question/categories from template
  async bulkImportQuestions(categoryId: string, rows: any[]) {
    const imported: any[] = [];
    for (const row of rows) {
      if (!row.text) continue;
      const q = await this.createQuestion({
        text: row.text,
        type: row.type || 'YES_NO',
        options: row.options || null
      }, categoryId);
      imported.push(q);
    }
    return { success: true, count: imported.length, data: imported };
  }
}
