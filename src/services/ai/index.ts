import { AI_CONFIG } from './config';
import { demoProvider } from './demoProvider';
import { httpProvider } from './httpProvider';
import type { AIProvider } from './types';

export const ai: AIProvider = AI_CONFIG.provider === 'http' ? httpProvider : demoProvider;
export type * from './types';
