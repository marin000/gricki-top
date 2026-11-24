import { type InferSchemaType, model, Schema } from "mongoose";

const rateLimitBucketSchema = new Schema(
	{
		keyHash: { type: String, required: true },
		windowStart: { type: Date, required: true },
		count: { type: Number, required: true, default: 0 },
		expiresAt: { type: Date, required: true },
	},
	{ timestamps: false },
);

rateLimitBucketSchema.index({ keyHash: 1, windowStart: 1 }, { unique: true });
rateLimitBucketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RateLimitBucketDocument = InferSchemaType<
	typeof rateLimitBucketSchema
> & {
	_id: Schema.Types.ObjectId;
};

export const RateLimitBucket = model("RateLimitBucket", rateLimitBucketSchema);
