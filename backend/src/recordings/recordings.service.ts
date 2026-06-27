import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AIEngineService } from '../ai/ai-engine.service';
import { InMemoryDB } from '../in-memory-db';

@Injectable()
export class RecordingsService {
  constructor(
    private prisma: PrismaService,
    private aiEngine: AIEngineService,
  ) {}

  async getRecordings(clientId?: string) {
    try {
      if (clientId) {
        return await this.prisma.callRecording.findMany({
          where: { clientId },
          include: { category: true, aiReview: { include: { answers: { include: { question: true } } } } },
          orderBy: { createdAt: 'desc' },
        });
      }
      return await this.prisma.callRecording.findMany({
        include: { client: true, category: true, aiReview: { include: { answers: { include: { question: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      // Fallback
      if (clientId) {
        const recs = InMemoryDB.recordings.filter(r => r.clientId === clientId);
        return recs.map(r => this.attachInMemoryReviewDetails(r)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return InMemoryDB.recordings.map(r => {
        const client = InMemoryDB.clients.find(c => c.id === r.clientId);
        const detailed = this.attachInMemoryReviewDetails(r);
        return { ...detailed, client };
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  async getRecordingById(id: string) {
    try {
      const recording = await this.prisma.callRecording.findUnique({
        where: { id },
        include: { category: true, client: true, aiReview: { include: { answers: { include: { question: true } } } } },
      });
      if (!recording) throw new NotFoundException('Recording not found');
      return recording;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      const rec = InMemoryDB.recordings.find(r => r.id === id);
      if (!rec) throw new NotFoundException('Recording not found');
      const client = InMemoryDB.clients.find(c => c.id === rec.clientId);
      const detailed = this.attachInMemoryReviewDetails(rec);
      return { ...detailed, client };
    }
  }

  private attachInMemoryReviewDetails(r: any) {
    const category = InMemoryDB.categories.find(c => c.id === r.categoryId);
    const aiReview = InMemoryDB.reviews.find(rev => rev.callRecordingId === r.id);
    let detailedReview = null;

    if (aiReview) {
      const answers = InMemoryDB.answers
        .filter(ans => ans.reviewId === aiReview.id)
        .map(ans => {
          const question = InMemoryDB.questions.find(q => q.id === ans.questionId);
          return { ...ans, question };
        });
      detailedReview = { ...aiReview, answers };
    }

    return {
      ...r,
      category,
      aiReview: detailedReview,
    };
  }

  async uploadAndReview(file: Express.Multer.File, categoryId: string, clientId: string) {
    const originalName = file.originalname;
    const filename = file.filename;
    const filepath = `uploads/${filename}`;
    const size = file.size;

    // First create PENDING recording
    let recording: any;
    try {
      // Find category first
      const cat = await this.prisma.category.findUnique({
        where: { id: categoryId },
        include: { questions: true }
      });
      if (!cat) throw new NotFoundException('Category not found');

      recording = await this.prisma.callRecording.create({
        data: {
          filename,
          filepath,
          originalName,
          size,
          status: 'PROCESSING',
          clientId,
          categoryId,
        },
      });

      // Run AI Review Engine
      const reviewResults = await this.aiEngine.reviewCall(originalName, cat.name, cat.questions);

      // Create Review
      const review = await this.prisma.aIReview.create({
        data: {
          callRecordingId: recording.id,
          confidenceScore: reviewResults.confidenceScore,
          reviewScore: reviewResults.reviewScore,
          sentiment: reviewResults.sentiment,
          earningsAmount: reviewResults.earningsAmount,
          overrideStatus: 'AI',
          answers: {
            create: reviewResults.answers.map(ans => ({
              questionId: ans.questionId,
              answerValue: ans.answerValue,
              confidenceScore: ans.confidenceScore,
            })),
          },
        },
      });

      // Update Recording status
      recording = await this.prisma.callRecording.update({
        where: { id: recording.id },
        data: {
          status: 'COMPLETED',
          transcript: reviewResults.transcript,
          summary: reviewResults.summary,
          duration: parseFloat((15 + Math.random() * 60).toFixed(1)), // mock duration
        },
      });

      // Credit Client Balance and Add Earnings Log
      const client = await this.prisma.client.findUnique({ where: { id: clientId } });
      if (client) {
        await this.prisma.client.update({
          where: { id: clientId },
          data: { balance: client.balance + reviewResults.earningsAmount },
        });

        await this.prisma.earnings.create({
          data: {
            userId: client.userId,
            amount: reviewResults.earningsAmount,
            type: 'EARNING',
            description: `AI Review Completed: ${originalName}`,
            categoryName: cat.name,
          },
        });

        // Add Notification
        await this.prisma.notification.create({
          data: {
            userId: client.userId,
            message: `Recording ${originalName} successfully processed. Earnings credited: +$${reviewResults.earningsAmount.toFixed(2)}`,
          },
        });
      }

      return this.getRecordingById(recording.id);

    } catch (e) {
      console.error("Postgres error, switching to InMemoryDB uploadAndReview", e);
      
      // Fallback
      const cat = InMemoryDB.categories.find(c => c.id === categoryId);
      if (!cat) throw new NotFoundException('Category not found');

      const recId = `rec-${Date.now()}`;
      const newRec = {
        id: recId,
        filename,
        filepath,
        originalName,
        size,
        status: 'COMPLETED',
        transcript: '',
        summary: '',
        duration: parseFloat((15 + Math.random() * 60).toFixed(1)),
        clientId,
        categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      InMemoryDB.recordings.push(newRec);

      const catQuestions = InMemoryDB.questions.filter(q => q.categoryId === categoryId);
      const reviewResults = await this.aiEngine.reviewCall(originalName, cat.name, catQuestions);

      newRec.transcript = reviewResults.transcript;
      newRec.summary = reviewResults.summary;

      const revId = `rev-${Date.now()}`;
      const newReview = {
        id: revId,
        callRecordingId: recId,
        confidenceScore: reviewResults.confidenceScore,
        reviewScore: reviewResults.reviewScore,
        sentiment: reviewResults.sentiment,
        earningsAmount: reviewResults.earningsAmount,
        isFlagged: false,
        overrideStatus: 'AI',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      InMemoryDB.reviews.push(newReview);

      reviewResults.answers.forEach((ans, idx) => {
        InMemoryDB.answers.push({
          id: `ans-${Date.now()}-${idx}`,
          reviewId: revId,
          questionId: ans.questionId,
          answerValue: ans.answerValue,
          confidenceScore: ans.confidenceScore,
        });
      });

      // Update Client balance
      const client = InMemoryDB.clients.find(cl => cl.id === clientId);
      if (client) {
        client.balance = parseFloat((client.balance + reviewResults.earningsAmount).toFixed(2));
        
        InMemoryDB.earnings.push({
          id: `earn-${Date.now()}`,
          userId: client.userId,
          amount: reviewResults.earningsAmount,
          type: 'EARNING',
          description: `AI Review Completed: ${originalName}`,
          categoryName: cat.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        InMemoryDB.notifications.push({
          id: `not-${Date.now()}`,
          userId: client.userId,
          message: `Recording ${originalName} successfully processed. Earnings credited: +$${reviewResults.earningsAmount.toFixed(2)}`,
          isRead: false,
          createdAt: new Date(),
        });
      }

      return this.attachInMemoryReviewDetails(newRec);
    }
  }

  async overrideReview(reviewId: string, dto: any) {
    // Admin Override results
    const { answers, overrideStatus } = dto;
    try {
      const review = await this.prisma.aIReview.findUnique({
        where: { id: reviewId },
        include: { callRecording: { include: { client: true, category: true } } },
      });
      if (!review) throw new NotFoundException('Review not found');

      // Update Answers
      for (const ans of answers) {
        await this.prisma.aIAnswer.updateMany({
          where: { reviewId, questionId: ans.questionId },
          data: { answerValue: ans.answerValue, confidenceScore: 1.0 }, // Overridden is 100% sure
        });
      }

      // Check if earnings change: If it was overridden as "Wrong", we apply penalty
      let earningsChange = 0;
      let newScore = review.reviewScore;

      if (overrideStatus === 'ADMIN_OVERRIDDEN') {
        newScore = parseFloat((review.reviewScore * 0.5).toFixed(2)); // penalize accuracy score
        // Penalty calculation
        let penalty = 2.30; // default inbound wrong
        const catName = review.callRecording.category.name.toLowerCase();
        if (catName.includes('appointment booked')) {
          penalty = 3.00;
        } else if (catName.includes('inventory')) {
          penalty = 1.50;
        }
        
        // Deduction amount: remove original earnings and subtract penalty
        earningsChange = -(review.earningsAmount + penalty); 

        // Update Client balance
        const client = review.callRecording.client;
        await this.prisma.client.update({
          where: { id: client.id },
          data: { balance: Math.max(0, client.balance + earningsChange) },
        });

        // Add Earnings Deduction log
        await this.prisma.earnings.create({
          data: {
            userId: client.userId,
            amount: penalty,
            type: 'DEDUCTION',
            description: `Admin Override Penalty: ${review.callRecording.originalName}`,
            categoryName: review.callRecording.category.name,
          },
        });

        await this.prisma.notification.create({
          data: {
            userId: client.userId,
            message: `Admin overridden review: ${review.callRecording.originalName}. Deduction applied: -$${(review.earningsAmount + penalty).toFixed(2)}`,
          },
        });
      }

      const updated = await this.prisma.aIReview.update({
        where: { id: reviewId },
        data: {
          overrideStatus,
          reviewScore: newScore,
          earningsAmount: overrideStatus === 'ADMIN_OVERRIDDEN' ? -Math.abs(earningsChange) : review.earningsAmount,
        },
      });

      return updated;
    } catch (e) {
      console.warn("OverrideReview falling back to InMemoryDB", e);
      const review = InMemoryDB.reviews.find(rev => rev.id === reviewId);
      if (!review) throw new NotFoundException('Review not found');

      const rec = InMemoryDB.recordings.find(r => r.id === review.callRecordingId);
      const cat = InMemoryDB.categories.find(c => c.id === rec.categoryId);
      const client = InMemoryDB.clients.find(c => c.id === rec.clientId);

      // Update Answers in memory
      answers.forEach((ans: any) => {
        const dbAns = InMemoryDB.answers.find(a => a.reviewId === reviewId && a.questionId === ans.questionId);
        if (dbAns) {
          dbAns.answerValue = ans.answerValue;
          dbAns.confidenceScore = 1.0;
        }
      });

      if (overrideStatus === 'ADMIN_OVERRIDDEN') {
        let penalty = 2.30;
        const catName = cat.name.toLowerCase();
        if (catName.includes('appointment booked')) {
          penalty = 3.00;
        } else if (catName.includes('inventory')) {
          penalty = 1.50;
        }
        
        const earningsChange = -(review.earningsAmount + penalty);
        if (client) {
          client.balance = parseFloat(Math.max(0, client.balance + earningsChange).toFixed(2));
          
          InMemoryDB.earnings.push({
            id: `earn-${Date.now()}`,
            userId: client.userId,
            amount: penalty,
            type: 'DEDUCTION',
            description: `Admin Override Penalty: ${rec.originalName}`,
            categoryName: cat.name,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          InMemoryDB.notifications.push({
            id: `not-${Date.now()}`,
            userId: client.userId,
            message: `Admin overridden review: ${rec.originalName}. Deduction applied: -$${(review.earningsAmount + penalty).toFixed(2)}`,
            isRead: false,
            createdAt: new Date(),
          });
        }

        review.reviewScore = parseFloat((review.reviewScore * 0.5).toFixed(2));
        review.earningsAmount = -Math.abs(earningsChange);
      }

      review.overrideStatus = overrideStatus;
      return review;
    }
  }

  async getNotifications(userId: string) {
    try {
      return await this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      return InMemoryDB.notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  async markNotificationsRead(userId: string) {
    try {
      return await this.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } catch (e) {
      InMemoryDB.notifications.filter(n => n.userId === userId).forEach(n => n.isRead = true);
      return { count: InMemoryDB.notifications.length };
    }
  }
}
