// Translations
import enTranslations from '../i18n/en.json';
import esTranslations from '../i18n/es.json';

export const i18nConfig = {
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations }
    },
    languages: ['en', 'es'],
    lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en", // fallback to this language if nothing is detected
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
};