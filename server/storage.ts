import { users, businessDetails, jobs, products, businessProducts, bids, conversations, messages } from "@shared/schema";
import type { 
  User, InsertUser, BusinessDetails, InsertBusinessDetails, 
  Job, InsertJob, Product, InsertProduct, 
  BusinessProduct, InsertBusinessProduct, Bid, InsertBid,
  Conversation, InsertConversation, Message, InsertMessage
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;

  // Business details methods
  getBusinessDetails(userId: number): Promise<BusinessDetails | undefined>;
  createBusinessDetails(details: InsertBusinessDetails): Promise<BusinessDetails>;

  // Jobs methods
  getAllJobs(): Promise<Job[]>;
  getJobsByUser(userId: number): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob, userId: number): Promise<Job>;
  updateJob(id: number, updatedJob: Partial<Job>): Promise<Job | undefined>;
  updateJobStatus(id: number, status: string): Promise<Job | undefined>;
  updateJobAcceptedBusinesses(jobId: number, acceptedBusinessIds: number[]): Promise<Job | undefined>;
  getAcceptedJobs(userId: number): Promise<Job[]>;

  // Products methods
  getAllProducts(): Promise<Product[]>;
  getProductsByUser(userId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct, userId: number): Promise<Product>;
  updateProductStatus(id: number, status: string): Promise<Product | undefined>;

  // Business products methods
  getAllBusinessProducts(): Promise<BusinessProduct[]>;
  getBusinessProductsByUser(userId: number): Promise<BusinessProduct[]>;
  getBusinessProduct(id: number): Promise<BusinessProduct | undefined>;
  createBusinessProduct(product: InsertBusinessProduct, userId: number): Promise<BusinessProduct>;

  // Bids methods
  getAllBids(): Promise<Bid[]>;
  getBidsByBusiness(businessId: number): Promise<Bid[]>;
  getBidsByItem(itemId: number, itemType: string): Promise<Bid[]>;
  getBid(id: number): Promise<Bid | undefined>;
  createBid(bid: InsertBid, businessId: number): Promise<Bid>;
  updateBidStatus(id: number, status: string, replacedBy?: number): Promise<Bid | undefined>;
  reviveBid(id: number, newBidData: Partial<InsertBid>): Promise<Bid | undefined>;
  
  // Chat conversations methods
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByParticipants(userId: number, businessId: number, itemId: number, itemType: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: number): Promise<Conversation[]>;
  getConversationsByBusiness(businessId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversationLastMessageTime(id: number): Promise<Conversation | undefined>;
  
  // Chat messages methods
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<boolean>;
  getUnreadMessageCount(conversationId: number, userId: number): Promise<number>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private businessDetails: Map<number, BusinessDetails>;
  private jobs: Map<number, Job>;
  private products: Map<number, Product>;
  private businessProducts: Map<number, BusinessProduct>;
  private bids: Map<number, Bid>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private userId: number;
  private businessDetailsId: number;
  private jobId: number;
  private productId: number;
  private businessProductId: number;
  private bidId: number;
  private conversationId: number;
  private messageId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.businessDetails = new Map();
    this.jobs = new Map();
    this.products = new Map();
    this.businessProducts = new Map();
    this.bids = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.userId = 1;
    this.businessDetailsId = 1;
    this.jobId = 1;
    this.productId = 1;
    this.businessProductId = 1;
    this.bidId = 1;
    this.conversationId = 1;
    this.messageId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every 24h
    });

    // Add some seed data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...userData, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, status };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Business details methods
  async getBusinessDetails(userId: number): Promise<BusinessDetails | undefined> {
    return Array.from(this.businessDetails.values()).find(
      (details) => details.userId === userId
    );
  }

  async createBusinessDetails(details: InsertBusinessDetails): Promise<BusinessDetails> {
    const id = this.businessDetailsId++;
    const newDetails: BusinessDetails = { ...details, id };
    this.businessDetails.set(id, newDetails);
    return newDetails;
  }

  // Jobs methods
  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getJobsByUser(userId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.userId === userId
    );
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(job: InsertJob, userId: number): Promise<Job> {
    const id = this.jobId++;
    const newJob: Job = { ...job, id, userId, status: "open", createdAt: new Date(), acceptedBusinessIds: [] };
    this.jobs.set(id, newJob);
    return newJob;
  }
  
  async updateJob(id: number, updatedJob: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    // Create updated job object while preserving userId and createdAt
    const { userId, createdAt } = job;
    const newJob = { 
      ...job, 
      ...updatedJob,
      userId, // Ensure userId doesn't change
      createdAt // Ensure createdAt doesn't change
    };
    
    this.jobs.set(id, newJob);
    return newJob;
  }

  async updateJobStatus(id: number, status: string): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, status };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async updateJobAcceptedBusinesses(jobId: number, acceptedBusinessIds: number[]): Promise<Job | undefined> {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    const updatedJob = { ...job, acceptedBusinessIds };
    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }

  async getAcceptedJobs(userId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.acceptedBusinessIds.includes(userId));
  }


  // Products methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByUser(userId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.userId === userId
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct, userId: number): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { 
      ...product, 
      id, 
      userId, 
      status: "open", 
      createdAt: new Date(),
      imagePath: product.imagePath || "",
      productLink: product.productLink || null
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProductStatus(id: number, status: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, status };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Business products methods
  async getAllBusinessProducts(): Promise<BusinessProduct[]> {
    return Array.from(this.businessProducts.values());
  }

  async getBusinessProductsByUser(userId: number): Promise<BusinessProduct[]> {
    return Array.from(this.businessProducts.values()).filter(
      (product) => product.userId === userId
    );
  }

  async getBusinessProduct(id: number): Promise<BusinessProduct | undefined> {
    return this.businessProducts.get(id);
  }

  async createBusinessProduct(product: InsertBusinessProduct, userId: number): Promise<BusinessProduct> {
    const id = this.businessProductId++;
    const newProduct: BusinessProduct = { 
      ...product, 
      id, 
      userId, 
      createdAt: new Date(),
      imagePath: product.imagePath || "" 
    };
    this.businessProducts.set(id, newProduct);
    return newProduct;
  }

  // Bids methods
  async getAllBids(): Promise<Bid[]> {
    return Array.from(this.bids.values());
  }

  async getBidsByBusiness(businessId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      (bid) => bid.businessId === businessId
    );
  }

  async getBidsByItem(itemId: number, itemType: string): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      (bid) => bid.itemId === itemId && bid.itemType === itemType
    );
  }

  async getBid(id: number): Promise<Bid | undefined> {
    return this.bids.get(id);
  }

  async createBid(bid: InsertBid, businessId: number): Promise<Bid> {
    const id = this.bidId++;
    const newBid: Bid = { 
      ...bid, 
      id, 
      businessId, 
      status: "pending", 
      createdAt: new Date(),
      imagePath: bid.imagePath || "",
      replacedBy: undefined
    };
    this.bids.set(id, newBid);
    return newBid;
  }

  async updateBidStatus(id: number, status: string, replacedBy?: number): Promise<Bid | undefined> {
    const bid = this.bids.get(id);
    if (!bid) return undefined;

    const updatedBid = { ...bid, status, ...(replacedBy !== undefined ? { replacedBy } : {}) };
    this.bids.set(id, updatedBid);
    return updatedBid;
  }
  
  async reviveBid(id: number, newBidData: Partial<InsertBid>): Promise<Bid | undefined> {
    const existingBid = this.bids.get(id);
    if (!existingBid) return undefined;
    
    // Create a new bid with updated information
    const updatedBid: Bid = { 
      ...existingBid, 
      ...newBidData,
      status: "pending", 
      createdAt: new Date(),
      replacedBy: undefined
    };
    
    this.bids.set(id, updatedBid);
    return updatedBid;
  }

  // Chat conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationByParticipants(
    userId: number, 
    businessId: number, 
    itemId: number, 
    itemType: string
  ): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(
      (conversation) => 
        conversation.userId === userId &&
        conversation.businessId === businessId &&
        conversation.itemId === itemId &&
        conversation.itemType === itemType
    );
  }

  async getConversationsByUser(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === userId
    );
  }

  async getConversationsByBusiness(businessId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.businessId === businessId
    );
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationId++;
    const newConversation: Conversation = {
      ...conversation,
      id,
      createdAt: new Date(),
      lastMessageAt: new Date()
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversationLastMessageTime(id: number): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;

    const updatedConversation = { 
      ...conversation, 
      lastMessageAt: new Date() 
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Chat message methods
  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const newMessage: Message = {
      ...message,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, newMessage);
    
    // Update the conversation's last message time
    this.updateConversationLastMessageTime(message.conversationId);
    
    return newMessage;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<boolean> {
    let success = false;
    
    const messagesToUpdate = Array.from(this.messages.values()).filter(
      (message) => 
        message.conversationId === conversationId && 
        message.senderId !== userId && 
        message.readStatus === "unread"
    );
    
    for (const message of messagesToUpdate) {
      const updatedMessage = { ...message, readStatus: "read" as const };
      this.messages.set(message.id, updatedMessage);
      success = true;
    }
    
    return success;
  }

  async getUnreadMessageCount(conversationId: number, userId: number): Promise<number> {
    return Array.from(this.messages.values()).filter(
      (message) => 
        message.conversationId === conversationId && 
        message.senderId !== userId && 
        message.readStatus === "unread"
    ).length;
  }

  // Seed some initial data
  private seedData() {
    // This method intentionally left empty as we should not mock data in production
  }
}

export const storage = new MemStorage();