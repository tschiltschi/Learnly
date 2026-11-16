// Learnly AI: the server side of src/services/ai/httpProvider.ts.
// Routes: POST /ai/chat, /ai/voice, /ai/flashcards, /ai/plan, /ai/document
// The Anthropic API key stays here and never reaches the browser.
import Anthropic from 'npm:@anthropic-ai/sdk@1.3.0';
import { adminClient, corsHeaders, json, requestUser } from '../_shared/http.ts';

const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-opus-5-5';
const FREE_MONTHLY_GENERATIONS = 10;
const PREMIUM_ROUTES = new Set(['chat', 'voice', 'plan', 'document']);

type Lang = 'en' | 'de';
type Effort = 'low' | 'medium' | 'high';
const LANGUAGE_NAME: Record<Lang, string> = { en: 'English', de: 'German' };

let client: Anthropic | null = null;
function anthropic(): Anthropic | null {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return null;
  client ??= new Anthropic({ apiKey });
  return client;
}

/** One Claude call that must answer with JSON matching `schema`. */
async function ask<T>(opts: { system: string; messages: Anthropic.Beta.BetaMessageParam[]; schema: Record<string, unknown>; effort: Effort; maxTokens?: number }): Promise<T | null> {
  const response = await anthropic()!.beta.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 8000,
    // If the main model declines, the API retries the same request on a suitable fallback model.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: opts.system,
    messages: opts.messages,
    output_config: { effort: opts.effort, format: { type: 'json_schema', schema: opts.schema } },
  });
  if (response.stop_reason === 'refusal') return null;
  const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')?.text;
  return text ? (JSON.parse(text) as T) : null;
}

const strictObject = (properties: Record<string, unknown>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });

const TUTOR = (lang: Lang, subject: string, spoken: boolean) =>
  `You are Learnly's learning coach, a patient tutor for school and university students.
Explain in simple words, one step at a time, and check understanding with a short question before moving on.
Correct mistakes kindly and say why. Do not just hand over answers to homework; guide the student to them.
Subject: ${subject}. Always answer in ${LANGUAGE_NAME[lang]}.
${spoken ? 'This is a spoken conversation: keep each reply to two or three short sentences, with no lists or formatting.' : 'Use short paragraphs and Markdown lists or bold text where it helps.'}
"suggestions" are two or three short follow-up messages the student might tap next, written from the student's point of view.`;

const notice = (lang: Lang, en: string, de: string) => (lang === 'de' ? de : en);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const route = new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';
  const user = await requestUser(req);
  if (!user) return json({ error: 'not_signed_in' }, 401);
  if (!anthropic()) return json({ error: 'ai_not_configured' }, 503);

  const body = await req.json().catch(() => ({}));
  const lang: Lang = body.language === 'de' ? 'de' : 'en';
  const db = adminClient();

  const { data: profile } = await db.from('profiles').select('plan').eq('id', user.id).single();
  const premium = profile?.plan === 'premium';
  if (PREMIUM_ROUTES.has(route) && !premium) return json({ error: 'premium_required' }, 402);

  try {
    switch (route) {
      case 'chat':
      case 'voice': {
        const spoken = route === 'voice';
        const history: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(body.history) ? body.history.slice(-20) : [];
        const message = String(spoken ? body.transcript ?? '' : body.message ?? '').slice(0, 4000);
        if (!message.trim()) return json({ error: 'empty_message' }, 400);
        const messages: Anthropic.Beta.BetaMessageParam[] = [
          ...history.filter((m) => m.role === 'user' || m.role === 'assistant').map((m) => ({ role: m.role, content: String(m.content).slice(0, 8000) })),
          { role: 'user', content: message },
        ];
        // The API needs the conversation to start with the student.
        while (messages.length && messages[0].role !== 'user') messages.shift();
        const out = await ask<{ reply: string; suggestions: string[] }>({
          system: TUTOR(lang, String(body.subject ?? 'General'), spoken),
          messages,
          effort: 'low',
          schema: strictObject({ reply: { type: 'string' }, suggestions: { type: 'array', items: { type: 'string' } } }),
        });
        if (!out) return json({ messages: [], demo: false, notice: notice(lang, 'I can’t help with that one. Try asking about something you are learning.', 'Dabei kann ich nicht helfen. Frag mich gern etwas zu deinem Lernstoff.') });
        return json({ messages: [out.reply], suggestions: out.suggestions.slice(0, 3), demo: false });
      }

      case 'flashcards': {
        if (!premium) {
          const month = new Date().toISOString().slice(0, 7);
          const { data: used } = await db.from('ai_usage').select('count').eq('user_id', user.id).eq('month', month).maybeSingle();
          if ((used?.count ?? 0) >= FREE_MONTHLY_GENERATIONS) return json({ error: 'free_limit_reached' }, 402);
          await db.rpc('increment_ai_usage', { p_user: user.id, p_month: month });
        }
        const max = Math.min(Number(body.max) || 20, 40);
        const out = await ask<{ cards: { front: string; back: string }[] }>({
          system: `You turn a student's learning material into flashcards. Write each card in ${LANGUAGE_NAME[lang]} unless the material itself is in another language.
The front is a short question or term; the back is a short, correct answer taken from the material. Make at most ${max} cards and skip anything trivial.`,
          messages: [{ role: 'user', content: `Topic: ${String(body.topicTitle ?? '')}\n\nMaterial:\n${String(body.text ?? '').slice(0, 60000)}` }],
          effort: 'medium',
          schema: strictObject({ cards: { type: 'array', items: strictObject({ front: { type: 'string' }, back: { type: 'string' } }) } }),
        });
        return json({ items: (out?.cards ?? []).slice(0, max), method: 'ai', demo: false });
      }

      case 'plan': {
        const out = await ask<{ sessions: { day: number; subject: string; title: string; minutes: number }[] }>({
          system: `You plan a student's study week. Days are numbered 0 = Monday to 6 = Sunday. Subjects are "languages", "math" or "theory".
Spread the work over the week, give more time to subjects with an exam soon, keep each day near the daily goal including sessions that already exist, and write short titles in ${LANGUAGE_NAME[lang]}.`,
          messages: [{ role: 'user', content: JSON.stringify({ today: new Date().toISOString().slice(0, 10), dailyMinutes: body.dailyMinutes, exams: body.exams, existingSessions: body.existing }) }],
          effort: 'medium',
          schema: strictObject({
            sessions: { type: 'array', items: strictObject({ day: { type: 'integer' }, subject: { type: 'string', enum: ['languages', 'math', 'theory'] }, title: { type: 'string' }, minutes: { type: 'integer' } }) },
          }),
        });
        const items = (out?.sessions ?? []).filter((s) => s.day >= 0 && s.day <= 6).map((s) => ({ ...s, minutes: Math.max(5, Math.min(180, s.minutes)), done: false, suggested: true }));
        return json({ items, method: 'ai', demo: false });
      }

      case 'document': {
        const text = String(body.text ?? '');
        if (!text.trim()) return json({ available: false, notice: notice(lang, 'Reading PDF and Word files needs a document parser, which is not set up yet. Paste the text into your notes instead.', 'Zum Lesen von PDF- und Word-Dateien fehlt noch ein Dokumentenleser. Füge den Text stattdessen in deine Notizen ein.') });
        const out = await ask<{ summary: string; keyConcepts: string[] }>({
          system: `Summarise a student's study document in ${LANGUAGE_NAME[lang]}: a short summary and the key concepts they must know.`,
          messages: [{ role: 'user', content: `File: ${String(body.fileName ?? '')}\n\n${text.slice(0, 120000)}` }],
          effort: 'medium',
          schema: strictObject({ summary: { type: 'string' }, keyConcepts: { type: 'array', items: { type: 'string' } } }),
        });
        return json(out ? { available: true, ...out } : { available: false });
      }

      default:
        return json({ error: 'not_found' }, 404);
    }
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'busy' }, 429);
    if (err instanceof Anthropic.APIError) {
      console.error('Anthropic API error', err.status, err.message);
      return json({ error: 'ai_error' }, 502);
    }
    console.error(err);
    return json({ error: 'server_error' }, 500);
  }
});
