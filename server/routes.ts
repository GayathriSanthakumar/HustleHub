import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertJobSchema,
  insertProductSchema,
  insertBusinessProductSchema,
  insertBidSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, and PDF files are allowed'));
    }
    cb(null, true);
  }
});

function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

function isBusinessAccount(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.userType === "business") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Business account required" });
}

function isUserAccount(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.userType === "user") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: User account required" });
}

function isVerifiedBusiness(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.userType === "business") {
    return next(); // Skip verification check
  }
  res.status(403).json({ message: "Forbidden: Business account required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Business details endpoints
  app.get("/api/business/details", isAuthenticated, async (req, res) => {
    try {
      const businessDetails = await storage.getBusinessDetails(req.user.id);
      if (!businessDetails) {
        return res.status(404).json({ message: "Business details not found" });
      }
      res.json(businessDetails);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/business/details", isAuthenticated, upload.single("verificationProof"), async (req, res) => {
    try {
      const verificationProof = req.file ? `/uploads/${req.file.filename}` : "";
      
      const businessData = {
        userId: req.user.id,
        businessName: req.body.businessName,
        gstNumber: req.body.gstNumber,
        shopLocation: req.body.shopLocation,
        verificationProof
      };
      
      const businessDetails = await storage.createBusinessDetails(businessData);
      
      // Update user status to pending verification
      await storage.updateUserStatus(req.user.id, "pending");
      
      res.status(201).json(businessDetails);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Job endpoints
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/jobs/user", isAuthenticated, async (req, res) => {
    try {
      const jobs = await storage.getJobsByUser(req.user.id);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData, req.user.id);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/jobs/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      // Validate status
      if (!["open", "in_progress", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Ensure user owns the job
      if (job.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't own this job" });
      }
      
      const updatedJob = await storage.updateJobStatus(id, status);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Product endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/user", isAuthenticated, async (req, res) => {
    try {
      const products = await storage.getProductsByUser(req.user.id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/products", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      const imagePath = req.file ? `/uploads/${req.file.filename}` : "";
      
      const productData = {
        name: req.body.name,
        description: req.body.description,
        imagePath
      };
      
      const validatedData = insertProductSchema.parse(productData);
      const product = await storage.createProduct(validatedData, req.user.id);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/products/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      // Validate status
      if (!["open", "in_progress", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Ensure user owns the product
      if (product.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't own this product" });
      }
      
      const updatedProduct = await storage.updateProductStatus(id, status);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Business product endpoints
  app.get("/api/business-products", async (req, res) => {
    try {
      const products = await storage.getAllBusinessProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/business-products/user", isAuthenticated, async (req, res) => {
    try {
      const products = await storage.getBusinessProductsByUser(req.user.id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/business-products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getBusinessProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Business product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/business-products", isBusinessAccount, upload.single("image"), async (req, res) => {
    try {
      const imagePath = req.file ? `/uploads/${req.file.filename}` : "";
      
      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: parseInt(req.body.price),
        imagePath
      };
      
      const validatedData = insertBusinessProductSchema.parse(productData);
      const product = await storage.createBusinessProduct(validatedData, req.user.id);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Bid endpoints
  app.get("/api/bids/business", isAuthenticated, async (req, res) => {
    try {
      const bids = await storage.getBidsByBusiness(req.user.id);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/bids/item/:itemId/:itemType", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const { itemType } = req.params;
      
      // Validate item type
      if (!["job", "product"].includes(itemType)) {
        return res.status(400).json({ message: "Invalid item type" });
      }
      
      const bids = await storage.getBidsByItem(itemId, itemType);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/bids", isVerifiedBusiness, async (req, res) => {
    try {
      const validatedData = insertBidSchema.parse(req.body);
      
      // Validate that item exists
      if (validatedData.itemType === "job") {
        const job = await storage.getJob(validatedData.itemId);
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }
        if (job.status !== "open") {
          return res.status(400).json({ message: "Job is not open for bids" });
        }
      } else if (validatedData.itemType === "product") {
        const product = await storage.getProduct(validatedData.itemId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        if (product.status !== "open") {
          return res.status(400).json({ message: "Product is not open for bids" });
        }
      } else {
        return res.status(400).json({ message: "Invalid item type" });
      }
      
      // Check if business already has a bid for this item
      const existingBids = await storage.getBidsByItem(validatedData.itemId, validatedData.itemType);
      const alreadyBid = existingBids.some(bid => bid.businessId === req.user.id);
      if (alreadyBid) {
        return res.status(400).json({ message: "You have already placed a bid for this item" });
      }
      
      const bid = await storage.createBid(validatedData, req.user.id);
      res.status(201).json(bid);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/bids/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      // Validate status
      if (!["pending", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const bid = await storage.getBid(id);
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      // Update job's accepted business IDs when accepting bid
      if (status === "accepted") {
        const job = await storage.getJob(bid.itemId);
        if (job) {
          const acceptedIds = job.acceptedBusinessIds || [];
          acceptedIds.push(bid.businessId);
          await storage.updateJobAcceptedBusinesses(job.id, acceptedIds);
        }
      }
      
      const existingBid = await storage.getBid(id);
      if (!existingBid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      // Determine the item to check ownership
      let item;
      if (existingBid.itemType === "job") {
        item = await storage.getJob(existingBid.itemId);
      } else if (existingBid.itemType === "product") {
        item = await storage.getProduct(existingBid.itemId);
      }
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Ensure user owns the item
      if (item.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't own this item" });
      }
      
      const updatedBid = await storage.updateBidStatus(id, status);
      
      // If bid is accepted and there are other bids, reject them
      if (status === "accepted") {
        // Allow multiple bids to be accepted
        const job = await storage.getJob(bid.itemId);
        if (job) {
          const acceptedIds = job.acceptedBusinessIds || [];
          acceptedIds.push(bid.businessId);
          await storage.updateJobAcceptedBusinesses(job.id, acceptedIds);
        }
        
        // Update item status to in_progress
        if (bid.itemType === "job") {
          await storage.updateJobStatus(bid.itemId, "in_progress");
        } else if (bid.itemType === "product") {
          await storage.updateProductStatus(bid.itemId, "in_progress");
        }
      }
      
      res.json(updatedBid);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin endpoints for business verification
  app.patch("/api/admin/verify-business/:id", isAuthenticated, async (req, res) => {
    try {
      // In a real application, this would be restricted to admin users
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.userType !== "business") {
        return res.status(400).json({ message: "User is not a business account" });
      }
      
      const updatedUser = await storage.updateUserStatus(id, "verified");
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";
