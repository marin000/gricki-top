import { type InferSchemaType, model, Schema } from "mongoose";

const optionSchema = new Schema(
	{
		id: { type: String, enum: ["A", "B", "C", "D"], required: true },
		text: { type: String, required: true },
	},
	{ _id: false },
);

const questionSchema = new Schema(
	{
		id: { type: String, required: true, unique: true },
		factKey: { type: String, required: true, unique: true },
		sourceStoryId: { type: String, required: true },
		prompt: { type: String, required: true },
		options: { type: [optionSchema], required: true },
		correctOptionId: { type: String, enum: ["A", "B", "C", "D"], required: true, select: false },
		explanation: { type: String, required: true, select: false },
		sourceIds: { type: [String], default: [] },
		version: { type: Number, required: true },
		status: { type: String, enum: ["approved", "retired"], required: true },
	},
	{ timestamps: true },
);

export type QuestionDocument = InferSchemaType<typeof questionSchema> & {
	_id: Schema.Types.ObjectId;
};

export const Question = model("Question", questionSchema);
