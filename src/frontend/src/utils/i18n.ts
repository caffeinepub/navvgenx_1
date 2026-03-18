// i18n utility for English/Hindi support

const translations: Record<string, Record<string, string>> = {
  en: {
    home: "Home",
    chat: "Chat",
    health: "Health",
    reminders: "Reminders",
    business: "Business",
    study: "Study",
    fashion: "Fashion",
    love: "Love",
    career: "Career",
    law: "Law",
    live: "Live",
    account: "Account",
    search: "Search",
    signOut: "Sign out",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    install: "Install",
    installApp: "Install NavvGenX AI",
    askAI: "Ask AI",
    askAnything: "Ask NavvGenX anything — history, science, advice...",
    yourAICompanion:
      "Your AI companion — ask anything, get ideas, images, and voice answers",
    helloImNavvGenX: "Hello, I'm NavvGenX",
    explorTopics: "Explore Topics",
    moreSection: "More Sections",
    addReminder: "Add Reminder",
    reminderTitle: "Reminder title...",
    save: "Save",
    cancel: "Cancel",
    name: "Name",
    mobile: "Mobile Number",
    gender: "Gender",
    language: "Language",
    age: "Age",
    male: "Male",
    female: "Female",
    other: "Other",
    preferNotToSay: "Prefer not to say",
    english: "English",
    hindi: "हिंदी",
    profilePhoto: "Profile Photo",
    takePhoto: "Take Photo",
    chooseGallery: "Choose from Gallery",
    saveProfile: "Save Profile",
    myAccount: "My Account",
    profileSetup: "Profile Setup",
    liveSection: "Live Updates",
    liveWeather: "Live Weather",
    liveHeadlines: "Live Headlines",
    marketUpdates: "Market Updates",
    loading: "Loading...",
    noReminders: "No reminders yet. Add your first one above!",
  },
  hi: {
    home: "होम",
    chat: "चैट",
    health: "स्वास्थ्य",
    reminders: "रिमाइंडर",
    business: "व्यापार",
    study: "अध्ययन",
    fashion: "फैशन",
    love: "प्यार",
    career: "करियर",
    law: "कानून",
    live: "लाइव",
    account: "खाता",
    search: "खोज",
    signOut: "साइन आउट",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    install: "इंस्टॉल",
    installApp: "NavvGenX AI इंस्टॉल करें",
    askAI: "AI से पूछें",
    askAnything: "NavvGenX से कुछ भी पूछें...",
    yourAICompanion:
      "आपका AI साथी — कुछ भी पूछें, विचार पाएं, चित्र और आवाज़ में जवाब पाएं",
    helloImNavvGenX: "नमस्ते, मैं NavvGenX हूँ",
    explorTopics: "विषय खोजें",
    moreSection: "और अनुभाग",
    addReminder: "रिमाइंडर जोड़ें",
    reminderTitle: "रिमाइंडर शीर्षक...",
    save: "सहेजें",
    cancel: "रद्द करें",
    name: "नाम",
    mobile: "मोबाइल नंबर",
    gender: "लिंग",
    language: "भाषा",
    age: "उम्र",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    preferNotToSay: "बताना पसंद नहीं",
    english: "English",
    hindi: "हिंदी",
    profilePhoto: "प्रोफ़ाइल फ़ोटो",
    takePhoto: "फ़ोटो लें",
    chooseGallery: "गैलरी से चुनें",
    saveProfile: "प्रोफ़ाइल सहेजें",
    myAccount: "मेरा खाता",
    profileSetup: "प्रोफ़ाइल सेटअप",
    liveSection: "लाइव अपडेट",
    liveWeather: "लाइव मौसम",
    liveHeadlines: "लाइव समाचार",
    marketUpdates: "बाज़ार अपडेट",
    loading: "लोड हो रहा है...",
    noReminders: "अभी कोई रिमाइंडर नहीं। ऊपर अपना पहला जोड़ें!",
  },
};

export function getLanguage(): string {
  try {
    const acc = localStorage.getItem("navvgenx-account");
    if (acc) {
      const parsed = JSON.parse(acc);
      if (parsed.language) return parsed.language;
    }
  } catch {
    // ignore
  }
  return "en";
}

export function t(key: string): string {
  const lang = getLanguage();
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

export function useLanguage() {
  const lang = getLanguage();
  const translate = (key: string) =>
    translations[lang]?.[key] ?? translations.en[key] ?? key;
  return { lang, t: translate };
}
