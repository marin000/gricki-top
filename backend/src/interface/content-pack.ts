export type ContentOption = {
	id: "A" | "B" | "C" | "D";
	text: string;
};

export type ContentSourcePack = {
	id: string;
	title: string;
	publisher: string;
	url: string;
	checkedAt: string;
};

export type ContentStoryPack = {
	id: string;
	dayNumber: number | null;
	isMain: boolean;
	title: string;
	lead: string;
	paragraphs: string[];
	category: string;
	sourceIds: string[];
	status: string;
	version: number;
	contentHash: string;
};

export type ContentQuestionPack = {
	id: string;
	factKey: string;
	sourceStoryId: string;
	prompt: string;
	options: ContentOption[];
	correctOptionId: "A" | "B" | "C" | "D";
	explanation: string;
	sourceIds: string[];
	version: number;
	status: string;
};

export type ContentDailyQuizPack = {
	id: string;
	dayNumber: number;
	storyId: string;
	questionIds: string[];
	status: string;
	version: number;
	contentHash: string;
};

export type ContentPack = {
	schemaVersion: number;
	contentPackVersion: string;
	language: string;
	timezone: string;
	publication: {
		startDate: string | null;
		unlockLocalTime: string;
		requiresExplicitStartDate: boolean;
	};
	sources: ContentSourcePack[];
	mainStory: ContentStoryPack;
	stories: ContentStoryPack[];
	questions: ContentQuestionPack[];
	dailyQuizzes: ContentDailyQuizPack[];
};
