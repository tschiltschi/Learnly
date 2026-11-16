export function uid(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const DAY = 86_400_000;

export function startOfDay(t: number | Date = Date.now()): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function relativeTime(t: number, lang: 'en' | 'de' = 'en'): string {
  const de = lang === 'de';
  const diff = Date.now() - t;
  const m = Math.round(diff / 60000);
  if (m < 1) return de ? 'gerade eben' : 'just now';
  if (m < 60) return de ? `vor ${m} Min.` : `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return de ? `vor ${h} Std.` : `${h} h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return de ? 'gestern' : 'yesterday';
  if (d < 7) return de ? `vor ${d} Tagen` : `${d} days ago`;
  return new Date(t).toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short' });
}

export function formatMinutes(min: number, lang: 'en' | 'de' = 'en'): string {
  const unit = lang === 'de' ? 'Min.' : 'min';
  const hr = lang === 'de' ? 'Std.' : 'h';
  if (min < 60) return `${Math.round(min)} ${unit}`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h} ${hr} ${m} ${unit}` : `${h} ${hr}`;
}

export function pct(correct: number, total: number): number {
  return total ? Math.round((correct / total) * 100) : 0;
}

export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^(the|a|an|to|der|die|das|el|la|los|las|le|les|un|une)\s+/, '')
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\s+/g, ' ');
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
