import { type InferSchemaType, model, Schema } from "mongoose";

const storyProgressSchema = new Schema(
	{
		deviceId: { type: String, required: true, index: true },
		storyId: { type: String, required: true },
		readAt: { type: Date, default: null },
		promptDismissedAt: { type: Date, default: null },
		clientUpdatedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

storyProgressSchema.index({ deviceId: 1, storyId: 1 }, { unique: true });

export type StoryProgressDocument = InferSchemaType<
	typeof storyProgressSchema
> & {
	_id: Schema.Types.ObjectId;
};

export const StoryProgress = model("StoryProgress", storyProgressSchema);
