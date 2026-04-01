import { z } from "zod";
import { UserRole, UserStatus } from "../models/User";
import { RecordType } from "../models/FinancialRecord";

// ==========================================
// USER VALIDATIONS
// ==========================================

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ==========================================
// FINANCIAL RECORD VALIDATIONS
// ==========================================

export const createFinancialRecordSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  type: z.nativeEnum(RecordType),
  category: z.string().min(1, "Category is required").trim(),
  date: z
    .string()
    .datetime()
    .or(z.date())
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  notes: z.string().trim().optional(),
  // createdBy is expected to be extracted from auth token, not body payload
  // so it's not present in the creation/update schema.
});

export const updateFinancialRecordSchema = z.object({
  amount: z.number().positive("Amount must be a positive number").optional(),
  type: z.nativeEnum(RecordType).optional(),
  category: z.string().min(1, "Category cannot be empty").trim().optional(),
  date: z
    .string()
    .datetime()
    .or(z.date())
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  notes: z.string().trim().optional(),
});
