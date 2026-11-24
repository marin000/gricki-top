import type { ContentPack } from "../interface";

type ValidateOk = {
	stories: number;
	mainStories: number;
	questions: number;
	dailyQuizzes: number;
	sources: number;
	correctOptions: Record<string, number>;
	maxReviewGapDays: number;
	status: "PASS";
};

function require(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

export const validateContentPack = (pack: ContentPack): ValidateOk => {
	require(pack.schemaVersion === 1, "Nepodržan schemaVersion");
	require(pack.timezone === "Europe/Zagreb", "Pogrešna vremenska zona");
	require(pack.publication.startDate === null, "Datum početka treba izričito zadati pri seedanju");
	require(pack.stories.length === 100, "Mora biti točno 100 dnevnih priča");
	require(pack.questions.length === 500, "Mora biti točno 500 pitanja");
	require(pack.dailyQuizzes.length === 100, "Mora biti točno 100 kvizova");
	require(pack.mainStory.id === "MAIN", "Nedostaje glavna priča");
	require(pack.mainStory.dayNumber === null, "Glavna priča nije dnevna priča");
	require(pack.mainStory.isMain === true, "Pogrešna oznaka glavne priče");

	const allStories = [pack.mainStory, ...pack.stories];
	const storyById = new Map(allStories.map((story) => [story.id, story]));
	const questionById = new Map(pack.questions.map((question) => [question.id, question]));
	const sourceById = new Map(pack.sources.map((source) => [source.id, source]));

	require(storyById.size === 101, "Dupli story id");
	require(questionById.size === 500, "Dupli question id");
	require(sourceById.size === pack.sources.length, "Dupli source id");
	require(
		[...pack.stories.map((story) => story.dayNumber)].sort((a, b) => Number(a) - Number(b)).join(",") ===
			Array.from({ length: 100 }, (_, index) => index + 1).join(","),
		"Dani priča imaju rupe ili duplikate",
	);
	require(
		[...pack.dailyQuizzes.map((quiz) => quiz.dayNumber)].sort((a, b) => a - b).join(",") ===
			Array.from({ length: 100 }, (_, index) => index + 1).join(","),
		"Dani kvizova imaju rupe ili duplikate",
	);
	require(new Set(pack.dailyQuizzes.map((quiz) => quiz.id)).size === 100, "Dupli dailyQuiz id");
	require(
		new Set(pack.questions.map((question) => question.prompt.toLocaleLowerCase("hr").trim())).size === 500,
		"Ponovljen tekst pitanja",
	);
	require(new Set(pack.questions.map((question) => question.factKey)).size === 500, "Ponovljen factKey");

	for (const source of pack.sources) {
		require(source.url.startsWith("https://"), `Izvor nije HTTPS: ${source.id}`);
		require(Boolean(source.title) && Boolean(source.publisher), "Nepotpuni izvor");
	}

	for (const story of allStories) {
		require(story.title.trim() && story.lead.trim(), `Nepotpuna priča ${story.id}`);
		require(story.paragraphs.length > 0 && story.paragraphs.every((paragraph) => paragraph.trim()), `Prazan tekst ${story.id}`);
		require(
			story.sourceIds.length > 0 && story.sourceIds.every((id) => sourceById.has(id)),
			`Nevaljani izvori priče ${story.id}`,
		);
	}

	for (const question of pack.questions) {
		require(storyById.has(question.sourceStoryId), `Nepostojeća priča pitanja ${question.id}`);
		require(question.options.length === 4, `Pogrešan broj opcija ${question.id}`);
		require(
			question.options.map((option) => option.id).join("") === "ABCD",
			`Pogrešni option id-jevi ${question.id}`,
		);
		require(
			new Set(question.options.map((option) => option.text.toLocaleLowerCase("hr").trim())).size === 4,
			`Duple opcije ${question.id}`,
		);
		require(
			question.options.every((option) => option.text.trim()),
			`Prazna opcija ${question.id}`,
		);
		require("ABCD".includes(question.correctOptionId), `Nema točnog odgovora ${question.id}`);
		require(question.prompt.trim() && question.explanation.trim(), `Nepotpuno pitanje ${question.id}`);
		require(
			question.sourceIds.length > 0 && question.sourceIds.every((id) => sourceById.has(id)),
			`Nevaljani izvori pitanja ${question.id}`,
		);
	}

	const used: string[] = [];
	let maxReviewGapDays = 0;

	for (const quiz of pack.dailyQuizzes) {
		const day = quiz.dayNumber;
		require(quiz.storyId === `S${String(day).padStart(3, "0")}`, `Pogrešna dnevna priča ${quiz.id}`);
		const ids = quiz.questionIds;
		require(ids.length === 5 && new Set(ids).size === 5, `Kviz nema pet različitih pitanja ${quiz.id}`);
		require(ids.every((id) => questionById.has(id)), `Nepostojeće pitanje ${quiz.id}`);

		const sourceDays = ids.map((id) => {
			const question = questionById.get(id);
			if (!question) {
				throw new Error(`Nepostojeće pitanje ${quiz.id}`);
			}
			const story = storyById.get(question.sourceStoryId);
			if (!story) {
				throw new Error(`Nepostojeća priča pitanja ${question.id}`);
			}
			return story.dayNumber ?? 0;
		});

		require(sourceDays.every((sourceDay) => sourceDay <= day), `Pitanje iz budućnosti ${quiz.id}`);
		if (day === 1) {
			require(sourceDays.every((sourceDay) => sourceDay === 0 || sourceDay === 1), "Prvi dan smije samo MAIN i S001");
		} else {
			require(sourceDays.filter((sourceDay) => sourceDay === day).length === 2, `Nisu dva današnja pitanja ${quiz.id}`);
			require(sourceDays.filter((sourceDay) => sourceDay < day).length === 3, `Nisu tri ranija pitanja ${quiz.id}`);
		}
		maxReviewGapDays = Math.max(maxReviewGapDays, ...sourceDays.map((sourceDay) => day - sourceDay));
		used.push(...ids);
	}

	require(used.length === 500 && new Set(used).size === 500, "Pitanja se ponavljaju između kvizova");
	require(used.every((id) => questionById.has(id)) && used.length === questionById.size, "Postoje neraspoređena pitanja");

	const letters: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
	for (const question of pack.questions) {
		letters[question.correctOptionId] += 1;
	}
	require(letters.A === 125 && letters.B === 125 && letters.C === 125 && letters.D === 125, "Točni položaji nisu ravnomjerni");

	return {
		stories: 100,
		mainStories: 1,
		questions: 500,
		dailyQuizzes: 100,
		sources: sourceById.size,
		correctOptions: letters,
		maxReviewGapDays,
		status: "PASS",
	};
};
