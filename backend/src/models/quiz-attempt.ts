import { type InferSchemaType, model, Schema } from "mongoose";

const optionSchema = new Schema(
	{
		id: { type: String, enum: ["A", "B", "C", "D"], required: true },
		text: { type: String, required: true },
	},
	{ _id: false },
);

const questionSnapshotSchema = new Schema(
	{
		questionId: { type: String, required: true },
		questionVersion: { type: Number, required: true },
		sourceStoryId: { type: String, required: true },
		prompt: { type: String, required: true },
		options: { type: [optionSchema], required: true },
		correctOptionId: { type: String, enum: ["A", "B", "C", "D"], required: true },
		explanation: { type: String, required: true },
		sourceIds: { type: [String], default: [] },
	},
	{ _id: false },
);

const answerSchema = new Schema(
	{
		questionId: { type: String, required: true },
		selectedOptionId: { type: String, enum: ["A", "B", "C", "D"], required: true },
		isCorrect: { type: Boolean, required: true },
		answeredAt: { type: Date, required: true },
		clientRequestId: { type: String, required: true },
	},
	{ _id: false },
);

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
		questionSnapshots: { type: [questionSnapshotSchema], default: [] },
		answers: { type: [answerSchema], default: [] },
	},
	{ timestamps: true },
);

quizAttemptSchema.index({ deviceId: 1, dailyQuizId: 1 }, { unique: true });
quizAttemptSchema.index({ deviceId: 1, completedAt: -1 });

export type QuizAttemptDocument = InferSchemaType<typeof quizAttemptSchema> & {
	_id: Schema.Types.ObjectId;
};

export const QuizAttempt = model("QuizAttempt", quizAttemptSchema);
