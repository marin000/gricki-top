import { type InferSchemaType, model, Schema } from "mongoose";

const timingAttemptSchema = new Schema(
	{
		id: { type: String, required: true, unique: true },
		deviceId: { type: String, required: true, index: true },
		localDate: { type: String, required: true },
		clientAttemptId: { type: String, required: true },
		noonAt: { type: Date, required: true },
		estimatedTapAt: { type: Date, required: true },
		deltaMs: { type: Number, required: true },
		syncStatus: {
			type: String,
			enum: ["synced", "unverified"],
			required: true,
		},
		clockRttMs: { type: Number, default: null },
		recordedAt: { type: Date, required: true },
		appVersion: { type: String, required: true },
	},
	{ timestamps: true },
);

timingAttemptSchema.index({ deviceId: 1, localDate: 1 }, { unique: true });
timingAttemptSchema.index(
	{ deviceId: 1, clientAttemptId: 1 },
	{ unique: true },
);
timingAttemptSchema.index({ deviceId: 1, recordedAt: -1 });

export type TimingAttemptDocument = InferSchemaType<
	typeof timingAttemptSchema
> & {
	_id: Schema.Types.ObjectId;
};

export const TimingAttempt = model("TimingAttempt", timingAttemptSchema);
