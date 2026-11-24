import { useLocalSearchParams } from "expo-router";

import { StoryReader } from "@/features";

export default function StoryScreen() {
	const params = useLocalSearchParams<{ id: string }>();
	const storyId = Array.isArray(params.id) ? params.id[0] : params.id;

	return <StoryReader storyId={storyId ?? ""} />;
}
