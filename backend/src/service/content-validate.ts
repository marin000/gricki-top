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

function ensure(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

export const validateContentPack = (pack: ContentPack): ValidateOk => {
	ensure(pack.schemaVersion === 1, "Nepodržan schemaVersion");
	ensure(pack.timezone === "Europe/Zagreb", "Pogrešna vremenska zona");
	ensure(pack.publication.startDate === null, "Datum početka treba izričito zadati pri seedanju");
	ensure(pack.stories.length === 100, "Mora biti točno 100 dnevnih priča");
	ensure(pack.questions.length === 500, "Mora biti točno 500 pitanja");
	ensure(pack.dailyQuizzes.length === 100, "Mora biti točno 100 kvizova");
	ensure(pack.mainStory.id === "MAIN", "Nedostaje glavna priča");
	ensure(pack.mainStory.dayNumber === null, "Glavna priča nije dnevna priča");
	ensure(pack.mainStory.isMain === true, "Pogrešna oznaka glavne priče");

	const allStories = [pack.mainStory, ...pack.stories];
	const storyById = new Map(allStories.map((story) => [story.id, story]));
	const questionById = new Map(pack.questions.map((question) => [question.id, question]));
	const sourceById = new Map(pack.sources.map((source) => [source.id, source]));

	ensure(storyById.size === 101, "Dupli story id");
	ensure(questionById.size === 500, "Dupli question id");
	ensure(sourceById.size === pack.sources.length, "Dupli source id");
	ensure(
		[...pack.stories.map((story) => story.dayNumber)].sort((a, b) => Number(a) - Number(b)).join(",") ===
			Array.from({ length: 100 }, (_, index) => index + 1).join(","),
		"Dani priča imaju rupe ili duplikate",
	);
	ensure(
		[...pack.dailyQuizzes.map((quiz) => quiz.dayNumber)].sort((a, b) => a - b).join(",") ===
			Array.from({ length: 100 }, (_, index) => index + 1).join(","),
		"Dani kvizova imaju rupe ili duplikate",
	);
	ensure(new Set(pack.dailyQuizzes.map((quiz) => quiz.id)).size === 100, "Dupli dailyQuiz id");
	ensure(
		new Set(pack.questions.map((question) => question.prompt.toLocaleLowerCase("hr").trim())).size === 500,
		"Ponovljen tekst pitanja",
	);
	ensure(new Set(pack.questions.map((question) => question.factKey)).size === 500, "Ponovljen factKey");

	for (const source of pack.sources) {
		ensure(source.url.startsWith("https://"), `Izvor nije HTTPS: ${source.id}`);
		ensure(Boolean(source.title) && Boolean(source.publisher), "Nepotpuni izvor");
	}

	for (const story of allStories) {
		ensure(story.title.trim() && story.lead.trim(), `Nepotpuna priča ${story.id}`);
		ensure(story.paragraphs.length > 0 && story.paragraphs.every((paragraph) => paragraph.trim()), `Prazan tekst ${story.id}`);
		ensure(
			story.sourceIds.length > 0 && story.sourceIds.every((id) => sourceById.has(id)),
			`Nevaljani izvori priče ${story.id}`,
		);
	}

	for (const question of pack.questions) {
		ensure(storyById.has(question.sourceStoryId), `Nepostojeća priča pitanja ${question.id}`);
		ensure(question.options.length === 4, `Pogrešan broj opcija ${question.id}`);
		ensure(
			question.options.map((option) => option.id).join("") === "ABCD",
			`Pogrešni option id-jevi ${question.id}`,
		);
		ensure(
			new Set(question.options.map((option) => option.text.toLocaleLowerCase("hr").trim())).size === 4,
			`Duple opcije ${question.id}`,
		);
		ensure(
			question.options.every((option) => option.text.trim()),
			`Prazna opcija ${question.id}`,
		);
		ensure("ABCD".includes(question.correctOptionId), `Nema točnog odgovora ${question.id}`);
		ensure(question.prompt.trim() && question.explanation.trim(), `Nepotpuno pitanje ${question.id}`);
		ensure(
			question.sourceIds.length > 0 && question.sourceIds.every((id) => sourceById.has(id)),
			`Nevaljani izvori pitanja ${question.id}`,
		);
	}

	const used: string[] = [];
	let maxReviewGapDays = 0;

	for (const quiz of pack.dailyQuizzes) {
		const day = quiz.dayNumber;
		ensure(quiz.storyId === `S${String(day).padStart(3, "0")}`, `Pogrešna dnevna priča ${quiz.id}`);
		const ids = quiz.questionIds;
		ensure(ids.length === 5 && new Set(ids).size === 5, `Kviz nema pet različitih pitanja ${quiz.id}`);
		ensure(ids.every((id) => questionById.has(id)), `Nepostojeće pitanje ${quiz.id}`);

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

		ensure(sourceDays.every((sourceDay) => sourceDay <= day), `Pitanje iz budućnosti ${quiz.id}`);
		if (day === 1) {
			ensure(sourceDays.every((sourceDay) => sourceDay === 0 || sourceDay === 1), "Prvi dan smije samo MAIN i S001");
		} else {
			ensure(sourceDays.filter((sourceDay) => sourceDay === day).length === 2, `Nisu dva današnja pitanja ${quiz.id}`);
			ensure(sourceDays.filter((sourceDay) => sourceDay < day).length === 3, `Nisu tri ranija pitanja ${quiz.id}`);
		}
		maxReviewGapDays = Math.max(maxReviewGapDays, ...sourceDays.map((sourceDay) => day - sourceDay));
		used.push(...ids);
	}

	ensure(used.length === 500 && new Set(used).size === 500, "Pitanja se ponavljaju između kvizova");
	ensure(used.every((id) => questionById.has(id)) && used.length === questionById.size, "Postoje neraspoređena pitanja");

	const letters: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
	for (const question of pack.questions) {
		letters[question.correctOptionId] += 1;
	}
	ensure(letters.A === 125 && letters.B === 125 && letters.C === 125 && letters.D === 125, "Točni položaji nisu ravnomjerni");

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
