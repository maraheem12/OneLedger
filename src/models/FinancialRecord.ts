import mongoose, { Schema, Document, Model, Types } from "mongoose";

export enum RecordType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface IFinancialRecord extends Document {
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialRecordSchema: Schema<IFinancialRecord> = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(RecordType),
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of the model during Next.js hot reloading
const FinancialRecord: Model<IFinancialRecord> =
  mongoose.models?.FinancialRecord ||
  mongoose.model<IFinancialRecord>("FinancialRecord", FinancialRecordSchema);

export default FinancialRecord;
