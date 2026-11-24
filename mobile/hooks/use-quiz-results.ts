import { useQuery } from "@tanstack/react-query";

import { fetchQuizResults } from "@/api";
import { useDevice } from "@/context";

export const useQuizResults = () => {
	const { identity } = useDevice();

	return useQuery({
		queryKey: ["quiz-results", identity?.deviceId],
		enabled: Boolean(identity),
		queryFn: async () => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			return fetchQuizResults(identity);
		},
	});
};
