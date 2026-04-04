// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ruCommon from './locales/ru/common.json'
import enCommon from './locales/en/common.json'

void i18n
    .use(LanguageDetector) // читает localStorage, navigator.language и т.д.
    .use(initReactI18next) // подключает i18n к React-контексту
    .init({
        fallbackLng: 'ru', // если язык не определён — русский
        defaultNS: `common`,
        resources: {
            ru: { common: ruCommon },
            en: { common: enCommon },
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'rpa_lang',  // ключ в localStorage
        },
        interpolation: {
            escapeValue: false,  // React сам экранирует XSS
        },
    })