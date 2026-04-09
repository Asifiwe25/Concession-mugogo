import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr    from './locales/fr.json'
import en    from './locales/en.json'
import sw    from './locales/sw.json'
import mashi from './locales/mashi.json'

const savedLang = localStorage.getItem('mugogo_lang') || 'fr'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr:    { translation: fr    },
      en:    { translation: en    },
      sw:    { translation: sw    },
      mashi: { translation: mashi },
    },
    lng:         savedLang,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang)
  localStorage.setItem('mugogo_lang', lang)
  document.documentElement.setAttribute('lang', lang)
}

export default i18n
