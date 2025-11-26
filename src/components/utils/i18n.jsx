// DishCore i18n System
// Supported languages: en, ru, uk, es, de, fr, pt, tr, ar, zh, hi

const translations = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.measurements': 'Body Measurements',
    'nav.goals': 'Body Goals',
    'nav.aiCoach': 'AI Body Coach',
    'nav.reports': 'Reports & Share',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.generate': 'Generate',
    'measurements.title': 'Body Measurements & Indicators',
    'goals.title': 'Body Goals & Ideal Shape',
    'reports.title': 'Reports & Sharing'
  },
  ru: {
    'nav.dashboard': 'Панель',
    'nav.measurements': 'Измерения',
    'nav.goals': 'Цели',
    'nav.aiCoach': 'AI тренер',
    'nav.reports': 'Отчёты',
    'common.save': 'Сохранить',
    'common.cancel': 'Отменить',
    'common.generate': 'Сгенерировать',
    'measurements.title': 'Измерения тела',
    'goals.title': 'Цели по телу',
    'reports.title': 'Отчёты и обмен'
  }
};

export const t = (key, lang = null) => {
  const currentLang = lang || localStorage.getItem('dishcore-language') || 'en';
  return translations[currentLang]?.[key] || translations['en'][key] || key;
};

export default translations;