import AsyncStorage from "@react-native-async-storage/async-storage";

const autoFireKey = (localDate: string) => `gricki.cannon.autoFired.${localDate}`;
const sheetShownKey = (storyId: string) => `gricki.sheet.shown.${storyId}`;

export const hasAutoFiredToday = async (localDate: string): Promise<boolean> => {
	const value = await AsyncStorage.getItem(autoFireKey(localDate));
	return value === "1";
};

export const markAutoFiredToday = async (localDate: string): Promise<void> => {
	await AsyncStorage.setItem(autoFireKey(localDate), "1");
};

export const hasShownStorySheetLocally = async (storyId: string): Promise<boolean> => {
	const value = await AsyncStorage.getItem(sheetShownKey(storyId));
	return value === "1";
};

export const markStorySheetShownLocally = async (storyId: string): Promise<void> => {
	await AsyncStorage.setItem(sheetShownKey(storyId), "1");
};
