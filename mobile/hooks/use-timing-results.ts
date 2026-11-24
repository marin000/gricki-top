import { useQuery } from "@tanstack/react-query";

import { fetchTimingResults } from "@/api";
import { useDevice } from "@/context";

export const useTimingResults = () => {
	const { identity } = useDevice();

	return useQuery({
		queryKey: ["timing-results", identity?.deviceId],
		enabled: Boolean(identity),
		queryFn: async () => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			return fetchTimingResults(identity);
		},
	});
};
