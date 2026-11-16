export const PREMIUM_PERKS = [
  'Personal AI Learning Coach',
  'AI-generated learning plans',
  'AI voice learning mode',
  'Realistic exam simulations',
  'Detailed weakness analysis',
  'Intelligent spaced repetition',
  'Advanced document analysis',
  'Unlimited AI-generated content',
];

export const FREE_PERKS = [
  'Languages, Mathematics and Theory',
  'Create vocabulary lists',
  'Flashcards',
  'Vocabulary tests',
  'Basic quizzes',
  'Limited AI-generated learning content (10 / month)',
  'Basic learning statistics',
];

export const COMPARISON: { feature: string; free: string | boolean; premium: string | boolean; group: string }[] = [
  { group: 'Learning', feature: 'Languages, Mathematics & Theory', free: true, premium: true },
  { group: 'Learning', feature: 'Vocabulary lists & flashcards', free: true, premium: true },
  { group: 'Learning', feature: 'Vocabulary tests & basic quizzes', free: true, premium: true },
  { group: 'Learning', feature: 'Step-by-step math solutions', free: true, premium: true },
  { group: 'Learning', feature: 'Document uploads', free: 'Store files', premium: 'Advanced analysis' },
  { group: 'AI', feature: 'AI-generated flashcards & quizzes', free: '10 / month', premium: 'Unlimited' },
  { group: 'AI', feature: 'Personal AI Learning Coach', free: false, premium: true },
  { group: 'AI', feature: 'AI voice learning mode', free: false, premium: true },
  { group: 'AI', feature: 'Personalized learning plans', free: false, premium: true },
  { group: 'Progress', feature: 'Learning statistics', free: 'Basic', premium: 'Detailed' },
  { group: 'Progress', feature: 'Weakness analysis', free: false, premium: true },
  { group: 'Progress', feature: 'Intelligent spaced repetition', free: false, premium: true },
  { group: 'Progress', feature: 'Realistic exam simulations', free: false, premium: true },
];
