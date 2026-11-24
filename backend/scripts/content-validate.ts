import { loadContentPack, validateContentPack } from "../src/service";

const main = async (): Promise<void> => {
	const pack = await loadContentPack();
	const report = validateContentPack(pack);
	console.log(JSON.stringify(report, null, 2));
};

main().catch((error: unknown) => {
	console.error("FAIL:", error instanceof Error ? error.message : error);
	process.exit(1);
});
