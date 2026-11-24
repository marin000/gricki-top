import { errorMessages } from "../src/constants";
import { connectDatabase, resetContentSchedule } from "../src/service";

const parseArgs = (argv: string[]): { startDate: string | null; dryRun: boolean } => {
	let startDate: string | null = null;
	let dryRun = false;

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--dry-run") {
			dryRun = true;
			continue;
		}
		if (arg === "--start-date") {
			startDate = argv[index + 1] ?? null;
			index += 1;
		}
	}

	return { startDate, dryRun };
};

const main = async (): Promise<void> => {
	const { startDate, dryRun } = parseArgs(process.argv.slice(2));
	if (!startDate) {
		throw new Error(errorMessages.missingStartDate);
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
		throw new Error(errorMessages.invalidStartDate);
	}

	await connectDatabase();
	const result = await resetContentSchedule({ startDate, dryRun });
	console.log(JSON.stringify(result, null, 2));
	process.exit(0);
};

main().catch((error: unknown) => {
	console.error("FAIL:", error instanceof Error ? error.message : error);
	process.exit(1);
});
