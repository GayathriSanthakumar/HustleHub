import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types: 'user' or 'business'
export const userTypes = ["user", "business"] as const;

// User status: 'pending' or 'verified'
export const userStatuses = ["pending", "verified"] as const;

// Status for jobs/products: 'open', 'in_progress', 'completed', 'cancelled'
export const itemStatuses = ["open", "in_progress", "completed", "cancelled"] as const;

// Status for bids: 'pending', 'accepted', 'rejected'
export const bidStatuses = ["pending", "accepted", "rejected"] as const;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type", { enum: userTypes }).notNull(),
  fullName: text("full_name"),
  status: text("status", { enum: userStatuses }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Business details table
export const businessDetails = pgTable("business_details", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  gstNumber: text("gst_number"),
  shopLocation: text("shop_location"),
  verificationProof: text("verification_proof"),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  location: text("location").notNull(),
  locationRadius: integer("location_radius").notNull(), // In kilometers
  description: text("description").notNull(),
  contactInfo: text("contact_info").notNull(),
  membersNeeded: integer("members_needed").notNull(),
  status: text("status", { enum: itemStatuses }).notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  acceptedBusinessIds: json("accepted_business_ids").default([]),
  contactInfo: text("contact_info"),
  radius: integer("radius").notNull().default(5),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imagePath: text("image_path"),
  status: text("status", { enum: itemStatuses }).notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Business products table
export const businessProducts = pgTable("business_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // In INR (₹)
  imagePath: text("image_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bids table
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull(), // Can be a job_id or product_id
  itemType: text("item_type").notNull(), // "job" or "product"
  amount: integer("amount").notNull(), // In INR (₹)
  details: text("details"),
  deliveryTime: text("delivery_time"),
  status: text("status", { enum: bidStatuses }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema for user registration and insert
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Schema for business details
export const insertBusinessDetailsSchema = createInsertSchema(businessDetails).omit({ 
  id: true 
});

// Schema for job creation
export const insertJobSchema = createInsertSchema(jobs).omit({ 
  id: true, 
  userId: true, 
  status: true, 
  createdAt: true 
});

// Schema for product creation
export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  userId: true, 
  status: true, 
  createdAt: true,
  imagePath: true
});

// Schema for business product creation
export const insertBusinessProductSchema = createInsertSchema(businessProducts).omit({ 
  id: true, 
  userId: true, 
  createdAt: true,
  imagePath: true
});

// Schema for bid creation
export const insertBidSchema = createInsertSchema(bids).omit({ 
  id: true, 
  businessId: true, 
  status: true, 
  createdAt: true 
});

// Export types
export type InsertUser = Omit<z.infer<typeof insertUserSchema>, "confirmPassword">;
export type User = typeof users.$inferSelect;
export type BusinessDetails = typeof businessDetails.$inferSelect;
export type InsertBusinessDetails = z.infer<typeof insertBusinessDetailsSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type BusinessProduct = typeof businessProducts.$inferSelect;
export type InsertBusinessProduct = z.infer<typeof insertBusinessProductSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;