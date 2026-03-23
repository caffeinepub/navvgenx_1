// i18n utility - English only

const translations: Record<string, string> = {
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
  installApp: "Install NAVVURA AI",
  askAI: "Ask AI",
  askAnything: "Ask NAVVURA AI anything — history, science, advice...",
  yourAICompanion:
    "Your AI companion — ask anything, get ideas, images, and voice answers",
  helloImNavvAI: "Hello, I'm NAVVURA AI",
  explorTopics: "Explore Topics",
  moreSection: "More Sections",
  addReminder: "Add Reminder",
  reminderTitle: "Reminder title...",
  save: "Save",
  cancel: "Cancel",
  name: "Name",
  mobile: "Mobile Number",
  gender: "Gender",
  age: "Age",
  male: "Male",
  female: "Female",
  other: "Other",
  preferNotToSay: "Prefer not to say",
  english: "English",
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
};

export function t(key: string): string {
  return translations[key] ?? key;
}

export function setLanguage(_lang: string): void {
  // English only — no-op
}

export function getLanguage(): string {
  return "en";
}
