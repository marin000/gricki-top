import type { DeviceSettings } from "../interface";
import { AppConfig, Story } from "../models";
import { getClockSnapshot, latestPublishedDayNumber } from "./time";

export const buildBootstrap = async (deviceSettings?: DeviceSettings) => {
	const clock = getClockSnapshot();
	const appConfig = await AppConfig.findOne({ key: "app" }).lean().exec();
	const contentStartDate = appConfig?.contentStartDate ?? null;
	const latestPublishedDay =
		contentStartDate === null ? 0 : latestPublishedDayNumber(contentStartDate);

	const mainStory = await Story.findOne({ id: "MAIN", status: "approved" })
		.lean()
		.exec();
	const latestStory =
		latestPublishedDay > 0
			? await Story.findOne({
					dayNumber: latestPublishedDay,
					status: "approved",
					isMain: false,
				})
					.lean()
					.exec()
			: null;

	return {
		...clock,
		contentStartDate,
		contentPackVersion: appConfig?.contentPackVersion ?? null,
		latestPublishedDay,
		latestPublishedContent: latestStory
			? {
					storyId: latestStory.id,
					dayNumber: latestStory.dayNumber,
					title: latestStory.title,
					lead: latestStory.lead,
					category: latestStory.category,
				}
			: null,
		mainStoryVersion: mainStory?.version ?? null,
		settings: deviceSettings ?? null,
	};
};
