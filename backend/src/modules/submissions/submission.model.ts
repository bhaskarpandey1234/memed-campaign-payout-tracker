import { Schema, model } from 'mongoose';

export const submissionSchema = new Schema(
  {
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    postUrl: { type: String, required: true },
    dedupeVersion: { type: Number },
    views: { type: Number, default: 0, min: 0 },
    highestMilestone: { type: Number, default: 0 },
    creditedPayout: { type: Number, default: 0, min: 0 },
    budgetCapped: { type: Boolean, default: false },
  },
  { timestamps: true },
);

submissionSchema.index({ campaign: 1, creator: 1 });
submissionSchema.index({ campaign: 1, creator: 1, postUrl: 1 }, { unique: true });

export const Submission = model('Submission', submissionSchema);
