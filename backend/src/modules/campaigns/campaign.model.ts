import { Schema, model } from 'mongoose';

const milestoneSchema = new Schema(
  {
    threshold: { type: Number, required: true },
    payout: { type: Number, required: true },
  },
  { _id: false },
);

export const campaignSchema = new Schema(
  {
    brand: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    idempotencyKey: { type: String },
    normalizedName: { type: String },
    name: { type: String, required: true, trim: true },
    platform: { type: String, enum: ['Instagram', 'YouTube'], required: true },
    totalBudget: { type: Number, required: true, min: 0 },
    spent: { type: Number, default: 0, min: 0 },
    milestones: { type: [milestoneSchema], required: true },
    status: { type: String, enum: ['active', 'exhausted'], default: 'active' },
  },
  { timestamps: true },
);

campaignSchema.index({ status: 1, platform: 1 });
campaignSchema.index({ brand: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
campaignSchema.index({ brand: 1, platform: 1, normalizedName: 1 }, { unique: true });

export const Campaign = model('Campaign', campaignSchema);
