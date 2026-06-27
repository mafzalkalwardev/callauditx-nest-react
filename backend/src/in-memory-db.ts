import * as bcrypt from 'bcrypt';

export class InMemoryDB {
  static users: any[] = [];
  static clients: any[] = [];
  static categories: any[] = [];
  static questions: any[] = [];
  static recordings: any[] = [];
  static reviews: any[] = [];
  static answers: any[] = [];
  static earnings: any[] = [];
  static notifications: any[] = [];

  static isInitialized = false;

  static async init() {
    if (this.isInitialized) return;
    
    // Seed Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const adminUser = {
      id: 'admin-uuid-1111',
      email: 'admin@callauditx.com',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const clientUser = {
      id: 'client-uuid-2222',
      email: 'client@callauditx.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'CLIENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(adminUser, clientUser);

    // Seed Client
    const clientProfile = {
      id: 'client-profile-uuid',
      userId: 'client-uuid-2222',
      companyName: 'Acme Sales & Support',
      balance: 145.20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clients.push(clientProfile);

    // Seed Categories
    const catInbound = {
      id: 'cat-inbound-uuid',
      name: 'Inbound Calls',
      description: 'Review inbound customer calls for greeting and routing',
      clientId: 'client-profile-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const catAppt = {
      id: 'cat-appt-uuid',
      name: 'Appointment Booked',
      description: 'Check if an appointment was successfully booked and scheduled',
      clientId: 'client-profile-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.categories.push(catInbound, catAppt);

    // Seed Questions for Inbound
    const q1 = {
      id: 'q1-uuid',
      text: 'Did someone answer the call?',
      type: 'YES_NO',
      options: null,
      categoryId: 'cat-inbound-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const q2 = {
      id: 'q2-uuid',
      text: 'Was it a voicemail response?',
      type: 'YES_NO',
      options: null,
      categoryId: 'cat-inbound-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const q3 = {
      id: 'q3-uuid',
      text: 'Rate the agent politeness (1-5)',
      type: 'RATING',
      options: '1,2,3,4,5',
      categoryId: 'cat-inbound-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Seed Questions for Appointment Booked
    const q4 = {
      id: 'q4-uuid',
      text: 'Was an appointment successfully booked?',
      type: 'YES_NO',
      options: null,
      categoryId: 'cat-appt-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const q5 = {
      id: 'q5-uuid',
      text: 'What day and time was set?',
      type: 'TEXT',
      options: null,
      categoryId: 'cat-appt-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.questions.push(q1, q2, q3, q4, q5);

    // Seed Recordings & Reviews
    const rec1 = {
      id: 'rec-1',
      filename: 'inbound_lead_01.mp3',
      filepath: 'uploads/inbound_lead_01.mp3',
      originalName: 'inbound_lead_01.mp3',
      duration: 45.5,
      size: 1024 * 1024 * 2,
      status: 'COMPLETED',
      transcript: 'Agent: Thank you for calling Acme Support, this is Sarah. How can I help you today? Caller: Hi Sarah, I was calling to ask if the standard widget is in stock? Agent: Yes! We have 5 units in stock. Would you like to schedule an order? Caller: No, just checking for now, thank you! Agent: Have a wonderful day!',
      summary: 'Caller inquired about standard widget inventory. Sarah confirmed 5 in stock. Caller declined booking/order but was satisfied.',
      clientId: 'client-profile-uuid',
      categoryId: 'cat-inbound-uuid',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 2), // 2 days ago
      updatedAt: new Date(),
    };

    const rec2 = {
      id: 'rec-2',
      filename: 'appt_booked_02.mp3',
      filepath: 'uploads/appt_booked_02.mp3',
      originalName: 'appt_booked_02.mp3',
      duration: 72.3,
      size: 1024 * 1024 * 3.5,
      status: 'COMPLETED',
      transcript: 'Agent: Hello, scheduling desk. Caller: Yes, I need to set up an HVAC consultation for tomorrow if possible. Agent: Sure! I have tomorrow Tuesday at 2:00 PM open. Caller: Perfect, lock me in for 2:00 PM. Agent: Got it. What is your name? Caller: Bob Smith. Agent: Awesome, see you then Bob.',
      summary: 'Bob Smith scheduled an HVAC consultation for tomorrow at 2:00 PM. Confirmation sent.',
      clientId: 'client-profile-uuid',
      categoryId: 'cat-appt-uuid',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 1), // 1 day ago
      updatedAt: new Date(),
    };

    this.recordings.push(rec1, rec2);

    // Seed Reviews
    const rev1 = {
      id: 'rev-1',
      callRecordingId: 'rec-1',
      confidenceScore: 0.94,
      reviewScore: 0.85,
      sentiment: 'POSITIVE',
      earningsAmount: 0.70,
      isFlagged: false,
      overrideStatus: 'AI',
      createdAt: rec1.createdAt,
      updatedAt: rec1.createdAt,
    };

    const rev2 = {
      id: 'rev-2',
      callRecordingId: 'rec-2',
      confidenceScore: 0.98,
      reviewScore: 1.0,
      sentiment: 'POSITIVE',
      earningsAmount: 1.20,
      isFlagged: false,
      overrideStatus: 'AI',
      createdAt: rec2.createdAt,
      updatedAt: rec2.createdAt,
    };

    this.reviews.push(rev1, rev2);

    // Seed Answers
    this.answers.push(
      { id: 'ans-1', reviewId: 'rev-1', questionId: 'q1-uuid', answerValue: 'YES', confidenceScore: 0.99 },
      { id: 'ans-2', reviewId: 'rev-1', questionId: 'q2-uuid', answerValue: 'NO', confidenceScore: 0.95 },
      { id: 'ans-3', reviewId: 'rev-1', questionId: 'q3-uuid', answerValue: '5', confidenceScore: 0.88 },
      
      { id: 'ans-4', reviewId: 'rev-2', questionId: 'q4-uuid', answerValue: 'YES', confidenceScore: 0.99 },
      { id: 'ans-5', reviewId: 'rev-2', questionId: 'q5-uuid', answerValue: 'Tuesday at 2:00 PM', confidenceScore: 0.97 }
    );

    // Seed Earnings
    this.earnings.push(
      {
        id: 'earn-1',
        userId: 'client-uuid-2222',
        amount: 0.70,
        type: 'EARNING',
        description: 'Correct Review: Inbound call checked.',
        categoryName: 'Inbound Calls',
        createdAt: rec1.createdAt,
        updatedAt: rec1.createdAt,
      },
      {
        id: 'earn-2',
        userId: 'client-uuid-2222',
        amount: 1.20,
        type: 'EARNING',
        description: 'Correct Review: Appointment scheduled successfully.',
        categoryName: 'Appointment Booked',
        createdAt: rec2.createdAt,
        updatedAt: rec2.createdAt,
      }
    );

    // Seed Notifications
    this.notifications.push(
      {
        id: 'not-1',
        userId: 'client-uuid-2222',
        message: 'Your recording inbound_lead_01.mp3 has been successfully reviewed by AI.',
        isRead: false,
        createdAt: rec1.createdAt,
      },
      {
        id: 'not-2',
        userId: 'client-uuid-2222',
        message: 'Your recording appt_booked_02.mp3 has been successfully reviewed by AI.',
        isRead: false,
        createdAt: rec2.createdAt,
      }
    );

    this.isInitialized = true;
    console.log("InMemoryDB initialized successfully with seed records!");
  }
}
