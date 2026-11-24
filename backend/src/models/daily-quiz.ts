import { type InferSchemaType, model, Schema } from "mongoose";

const dailyQuizSchema = new Schema(
	{
		id: { type: String, required: true, unique: true },
		dayNumber: { type: Number, required: true, unique: true },
		storyId: { type: String, required: true },
		questionIds: { type: [String], required: true },
		publishAt: { type: Date, required: true },
		status: {
			type: String,
			enum: ["draft", "approved", "retired"],
			required: true,
		},
		version: { type: Number, required: true },
		contentHash: { type: String, required: true },
	},
	{ timestamps: true },
);

dailyQuizSchema.index({ questionIds: 1 });

export type DailyQuizDocument = InferSchemaType<typeof dailyQuizSchema> & {
	_id: Schema.Types.ObjectId;
};

export const DailyQuiz = model("DailyQuiz", dailyQuizSchema);
