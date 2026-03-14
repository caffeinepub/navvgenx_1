// Friendly openers — vary by question type
const casualOpeners = [
  "Hey, great question! ",
  "Oh, I love this one! ",
  "Honestly, ",
  "So glad you asked! ",
  "Let me tell you — ",
  "Here's what I'd tell a friend: ",
  "Good thinking! ",
  "Okay so, ",
  "You know what? ",
  "Totally get why you're asking! ",
];

const adviceOpeners = [
  "Okay, here's my honest advice: ",
  "Been there! Here's what actually helps: ",
  "Real talk — ",
  "Here's what I'd do in your shoes: ",
  "This is super common, don't worry! ",
  "Let me give you some real advice: ",
  "From one friend to another — ",
];

const greetingReplies = [
  "Hey hey! So happy you're here. What's on your mind today?",
  "Hi there! I'm Navv, your AI bestie. Ask me literally anything!",
  "Hey! Great to see you. I'm here to help, chat, or give advice — you name it!",
  "Hello! What can I help you with today? No question is too big or too small.",
];

const closers = [
  " Hope that helps! Let me know if you want me to go deeper on anything.",
  " Feel free to ask follow-up questions — I'm right here!",
  " Hope that clears things up! What else is on your mind?",
  " You've got this! Anything else I can help with?",
  " Let me know if you want more details on any part of this.",
  " Hope that was useful! Ask away if you need more.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getFriendlyOpener(query: string): string {
  const q = query.toLowerCase();
  if (/^(hi|hello|hey|good morning|good evening|howdy|sup|yo)/.test(q)) {
    return pick(greetingReplies);
  }
  if (
    /help|advice|should i|what do i do|how do i|i feel|i am|i'm|struggling|worried|sad|stressed|lonely|anxious/.test(
      q,
    )
  ) {
    return pick(adviceOpeners);
  }
  return pick(casualOpeners);
}

export function getFriendlyCloser(): string {
  return pick(closers);
}

export function wrapFriendly(answer: string, query: string): string {
  const q = query.toLowerCase();
  // Don't double-wrap greetings
  if (/^(hi|hello|hey|good morning|good evening|howdy|sup|yo)/.test(q)) {
    return answer;
  }
  return getFriendlyOpener(query) + answer + getFriendlyCloser();
}
