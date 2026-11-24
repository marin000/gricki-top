import { type InferSchemaType, model, Schema } from "mongoose";

const settingsSchema = new Schema(
	{
		soundEnabled: { type: Boolean, default: true },
		hapticsEnabled: { type: Boolean, default: true },
		reminderEnabled: { type: Boolean, default: false },
		reminderLeadMinutes: { type: Number, default: 1 },
	},
	{ _id: false },
);

const deviceSchema = new Schema(
	{
		deviceId: { type: String, required: true, unique: true, index: true },
		tokenHash: { type: String, required: true, select: false },
		platform: { type: String, enum: ["ios", "android"], required: true },
		locale: { type: String, default: "hr-HR" },
		appVersion: { type: String, required: true },
		settings: { type: settingsSchema, default: () => ({}) },
		lastSeenAt: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

export type DeviceDocument = InferSchemaType<typeof deviceSchema> & {
	_id: Schema.Types.ObjectId;
};

export const Device = model("Device", deviceSchema);
