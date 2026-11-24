import { type InferSchemaType, model, Schema } from "mongoose";

const appConfigSchema = new Schema(
	{
		key: { type: String, required: true, unique: true, default: "app" },
		contentStartDate: { type: String, required: true },
		timezone: { type: String, required: true, default: "Europe/Zagreb" },
		contentPackVersion: { type: String, required: true },
		activeDayCount: { type: Number, required: true, default: 100 },
		minimumSupportedAppVersion: { type: String, default: null },
	},
	{ timestamps: true },
);

export type AppConfigDocument = InferSchemaType<typeof appConfigSchema> & {
	_id: Schema.Types.ObjectId;
};

export const AppConfig = model("AppConfig", appConfigSchema);
