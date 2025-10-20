import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import km from './km.json'
import en from './en.json'
import zh from './zh.json'

const urlLang = new URLSearchParams(window.location.search).get('lang')
const stored = localStorage.getItem('lang')
const fallbackLng = 'km'
const initial = urlLang || stored || fallbackLng

i18n
    .use(initReactI18next)
    .init({
        resources: { km: { translation: km }, en: { translation: en }, zh: { translation: zh } },
        lng: initial,
        fallbackLng,
        interpolation: { escapeValue: false }
    })

i18n.on('languageChanged', (lng) => {
    localStorage.setItem('lang', lng)
    document.documentElement.lang = lng
})

export default i18n
