import { type InferSchemaType, model, Schema } from "mongoose";

/** Minimal schema for Phase 2 metadata; full attempt flow lands in Phase 4. */
const quizAttemptSchema = new Schema(
	{
		id: { type: String, required: true, unique: true },
		deviceId: { type: String, required: true, index: true },
		dailyQuizId: { type: String, required: true },
		quizVersion: { type: Number, required: true },
		status: {
			type: String,
			enum: ["in_progress", "completed"],
			required: true,
		},
		startedAt: { type: Date, required: true },
		completedAt: { type: Date, default: null },
		score: { type: Number, default: null },
		nextQuestionIndex: { type: Number, default: 0 },
		revision: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

quizAttemptSchema.index({ deviceId: 1, dailyQuizId: 1 }, { unique: true });
quizAttemptSchema.index({ deviceId: 1, completedAt: -1 });

export type QuizAttemptDocument = InferSchemaType<typeof quizAttemptSchema> & {
	_id: Schema.Types.ObjectId;
};

export const QuizAttempt = model("QuizAttempt", quizAttemptSchema);
