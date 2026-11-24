import { type InferSchemaType, model, Schema } from "mongoose";

const contentSourceSchema = new Schema(
	{
		id: { type: String, required: true, unique: true },
		title: { type: String, required: true },
		publisher: { type: String, required: true },
		url: { type: String, required: true },
		checkedAt: { type: Date, required: true },
	},
	{ timestamps: true },
);

export type ContentSourceDocument = InferSchemaType<
	typeof contentSourceSchema
> & {
	_id: Schema.Types.ObjectId;
};

export const ContentSource = model("ContentSource", contentSourceSchema);
