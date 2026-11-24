import { type InferSchemaType, model, Schema } from "mongoose";

const storySchema = new Schema(
	{
		id: { type: String, required: true, unique: true },
		dayNumber: { type: Number, default: null },
		isMain: { type: Boolean, default: false },
		title: { type: String, required: true },
		lead: { type: String, required: true },
		paragraphs: { type: [String], required: true },
		category: { type: String, required: true },
		sourceIds: { type: [String], default: [] },
		status: {
			type: String,
			enum: ["draft", "approved", "retired"],
			required: true,
		},
		publishAt: { type: Date, default: null },
		version: { type: Number, required: true },
		contentHash: { type: String, required: true },
	},
	{ timestamps: true },
);

storySchema.index(
	{ dayNumber: 1 },
	{
		unique: true,
		partialFilterExpression: { dayNumber: { $type: "number" } },
	},
);
storySchema.index({ status: 1, publishAt: -1 });

export type StoryDocument = InferSchemaType<typeof storySchema> & {
	_id: Schema.Types.ObjectId;
};

export const Story = model("Story", storySchema);
