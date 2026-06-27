import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      console.warn("Could not connect to PostgreSQL. The app will simulate operations where database is not strictly reachable or if local migrations haven't run yet.");
    }
  }
}
