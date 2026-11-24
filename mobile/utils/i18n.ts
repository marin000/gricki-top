import "intl-pluralrules";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import hr from "@/locales/hr/common.json";

if (!i18n.isInitialized) {
	void i18n.use(initReactI18next).init({
		compatibilityJSON: "v4",
		lng: "hr",
		fallbackLng: "hr",
		resources: {
			hr: { translation: hr },
		},
		interpolation: {
			escapeValue: false,
		},
	});
}

export { i18n };
