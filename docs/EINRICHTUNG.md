# Learnly live schalten: Schritt für Schritt (nur im Browser)

Mit dieser Anleitung wird aus der Demo eine echte App mit Konten, Speicherung über alle Geräte, Premium-Abo über Stripe und echter KI.
Du brauchst **kein Terminal**: Alles geht in den Webseiten von GitHub, Supabase, Stripe und Vercel.
Solange ein Teil fehlt, läuft die App an dieser Stelle einfach im Demo-Modus weiter.

**Wichtig:** Geheime Schlüssel gehören nie in den Chat, nie in den Code und nie in eine Variable, die mit `VITE_` beginnt. Das Repository ist öffentlich, also kann dort jeder alles lesen.

Dein Supabase-Projekt: `wwuxobiaosstrgbhlcyi`, die Adresse ist `https://wwuxobiaosstrgbhlcyi.supabase.co`.

**Schon erledigt:** Supabase-Projekt angelegt, `ANTHROPIC_API_KEY` als Secret gespeichert.

---

## Schritt 1: GitHub darf Supabase einrichten

GitHub legt die Datenbank-Tabellen an und lädt die Server-Funktionen hoch. Dafür braucht GitHub zwei Schlüssel.

1. **Zugangs-Token holen:** [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) öffnen → **Generate new token** → Name z. B. „GitHub“ → Token kopieren.
2. **Datenbank-Passwort:** Das ist das Passwort, das du beim Anlegen des Projekts gewählt hast. Falls du es nicht mehr weißt: im Supabase-Projekt **Project Settings → Database → Reset database password** und ein neues setzen.
3. **Beide in GitHub eintragen:** Öffne [github.com/tschiltschi/Learnly/settings/secrets/actions](https://github.com/tschiltschi/Learnly/settings/secrets/actions) → **New repository secret**, zweimal:

   | Name | Wert |
   |---|---|
   | `SUPABASE_ACCESS_TOKEN` | das Token aus Punkt 1 |
   | `SUPABASE_DB_PASSWORD` | das Datenbank-Passwort |

## Schritt 2: Pull Request übernehmen

1. Öffne [Pull Request #1](https://github.com/tschiltschi/Learnly/pull/1) → **Merge pull request** → **Confirm merge**.
2. Unter [Actions](https://github.com/tschiltschi/Learnly/actions) startet jetzt „Deploy Supabase“. Nach ein bis zwei Minuten sollte es einen grünen Haken haben.
3. Kontrolle in Supabase: Unter **Table Editor** gibt es jetzt `profiles`, `app_state` und `ai_usage`. Unter **Edge Functions** gibt es `ai`, `create-checkout`, `customer-portal` und `stripe-webhook`.

Bei einem roten Kreuz: Klick auf den Lauf, kopier mir die rote Fehlermeldung, und ich kümmere mich darum.

## Schritt 3: Stripe einrichten (Premium für 7,99 € im Monat)

Mach erst alles im **Testmodus** (Schalter oben rechts im Stripe-Dashboard). Echtes Geld fließt erst später.

1. **Produkt:** **Produktkatalog → Produkt hinzufügen** → Name „Learnly Premium“, Preis **7,99 €**, **wiederkehrend, monatlich** → speichern. Beim Preis die **Preis-ID** kopieren (beginnt mit `price_`).
2. **Geheimschlüssel:** **Entwickler → API-Schlüssel** → **Geheimschlüssel** anzeigen und kopieren (beginnt mit `sk_test_`).
3. **Webhook:** **Entwickler → Webhooks → Endpunkt hinzufügen**
   - Endpunkt-URL: `https://wwuxobiaosstrgbhlcyi.supabase.co/functions/v1/stripe-webhook`
   - Ereignisse auswählen: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Speichern, dann das **Signaturgeheimnis** kopieren (beginnt mit `whsec_`).
4. **Kundenportal:** **Einstellungen → Billing → Kundenportal** → aktivieren und „Kunden können Abos kündigen“ einschalten. Hier kündigen deine Nutzer später selbst.

## Schritt 4: Stripe-Schlüssel in Supabase speichern

So wie du es schon mit dem Anthropic-Schlüssel gemacht hast: im Supabase-Projekt **Edge Functions → Secrets** → **Add new secret**:

| Name | Wert |
|---|---|
| `STRIPE_SECRET_KEY` | Geheimschlüssel aus Schritt 3.2 (`sk_test_…`) |
| `STRIPE_PRICE_ID` | Preis-ID aus Schritt 3.1 (`price_…`) |
| `STRIPE_WEBHOOK_SECRET` | Signaturgeheimnis aus Schritt 3.3 (`whsec_…`) |

## Schritt 5: App ins Internet bringen (Vercel)

1. Auf [vercel.com](https://vercel.com) **mit GitHub anmelden** → **Add New → Project** → das Repository `Learnly` → **Import**.
2. Vor dem Klick auf Deploy die **Environment Variables** eintragen:

   | Name | Wert |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://wwuxobiaosstrgbhlcyi.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | in Supabase unter **Project Settings → API Keys** der **anon public** Key (oder der **Publishable key**, beginnt mit `sb_publishable_`) |
   | `VITE_PAYMENTS` | `stripe` |
   | `VITE_AI_PROVIDER` | `http` |

   Der anon- bzw. Publishable-Key ist öffentlich gedacht und darf hier stehen. Den **service_role**- oder **Secret key** bitte nie eintragen.
3. **Deploy** klicken. Danach bekommst du eine Adresse wie `https://learnly-xyz.vercel.app`.

## Schritt 6: Supabase die Adresse der App mitteilen

1. **Edge Functions → Secrets** → neues Secret `APP_URL` = deine Vercel-Adresse (ohne `/` am Ende).
2. **Authentication → URL Configuration**:
   - **Site URL**: deine Vercel-Adresse
   - **Redirect URLs**: deine Vercel-Adresse noch einmal hinzufügen
3. Optional: Unter **Authentication → Emails** die Bestätigungs-Mail auf Deutsch umschreiben. Unter **Authentication → Providers → Google** kannst du „Mit Google anmelden“ einschalten.

## Schritt 7: Testen

1. Deine Vercel-Adresse öffnen, Konto anlegen, die Bestätigungs-Mail öffnen und dich anmelden.
2. Auf **Upgrade** klicken und mit der Stripe-Testkarte `4242 4242 4242 4242` bezahlen. Datum und Prüfziffer sind beliebig, das Datum muss nur in der Zukunft liegen.
3. Nach der Rückkehr erscheint nach wenigen Sekunden „Premium ist aktiv“.
4. Den KI-Coach öffnen und eine Frage stellen. Die Antwort kommt jetzt von Claude und hat keinen „Demo“-Hinweis mehr.
5. In den **Einstellungen → Abo verwalten** kündigen. Danach sollte das Konto wieder auf Free stehen.

Wenn etwas hakt, schreib mir, bei welchem Schritt und was du siehst.

## Schritt 8: Echtes Geld

Wenn alles klappt: In Stripe auf **Live** umschalten, Schritt 3 dort wiederholen und in Supabase die drei Stripe-Secrets mit den Live-Werten ersetzen (`sk_live_…`, neue `price_…`, neues `whsec_…`).

## Vor dem Start nicht vergessen

Wer in Deutschland ein Abo verkauft, braucht auf der Website ein **Impressum**, eine **Datenschutzerklärung** (Supabase, Stripe, Anthropic und Vercel als Dienstleister nennen) sowie **AGB und Widerrufsbelehrung**. Das ist kein Rechtsrat: Lass das am besten kurz prüfen.

---

<details>
<summary>Für Entwickler: dasselbe mit dem Terminal</summary>

```bash
npx supabase login
npx supabase link --project-ref wwuxobiaosstrgbhlcyi
npx supabase db push
npx supabase secrets set ANTHROPIC_API_KEY=… STRIPE_SECRET_KEY=… STRIPE_PRICE_ID=… STRIPE_WEBHOOK_SECRET=… APP_URL=https://…
npx supabase functions deploy ai create-checkout customer-portal
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

Lokal entwickeln: `.env.example` nach `.env.local` kopieren, ausfüllen, `npm run dev`.
</details>
