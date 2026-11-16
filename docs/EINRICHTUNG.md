# Learnly live schalten: Schritt für Schritt

Diese Anleitung macht aus der Demo eine echte App mit Konten, Speicherung über alle Geräte, Premium-Abo über Stripe und echter KI.
Du kannst die Schritte einzeln erledigen: Solange ein Teil fehlt, läuft die App an dieser Stelle einfach im Demo-Modus weiter.

**Wichtig:** Geheime Schlüssel (Stripe Secret Key, Webhook Secret, Anthropic API Key) gehören nie in den Chat, nie in GitHub und nie in eine Variable, die mit `VITE_` beginnt. Sie kommen nur in Supabase (Schritt 6).

Du brauchst einmalig [Node.js](https://nodejs.org) (Version 20 oder neuer) und ein Terminal im Projektordner. Die Supabase-Befehle laufen über `npx supabase …`, eine Installation ist nicht nötig.

## 1. Supabase-Projekt anlegen (Konten und Datenbank)

1. Auf [supabase.com](https://supabase.com) registrieren und **New project** anlegen. Als Region **Frankfurt (eu-central-1)** wählen, dann liegen die Daten in der EU.
2. Unter **Project Settings → API** findest du die **Project URL** und den **anon public key**. Beide brauchst du in Schritt 8.
3. Im Terminal:
   ```bash
   npx supabase login
   npx supabase link --project-ref DEINE-PROJEKT-REF   # die Ref steht in der Project URL: https://DEINE-PROJEKT-REF.supabase.co
   npx supabase db push                                # legt Tabellen und Zugriffsregeln an
   ```

## 2. Anmeldung einstellen

1. In Supabase unter **Authentication → URL Configuration**:
   - **Site URL**: die Adresse, unter der Learnly später läuft, z. B. `https://learnly.app`
   - **Redirect URLs**: dieselbe Adresse und `http://localhost:5173` für lokale Tests
2. Unter **Authentication → Emails** kannst du die Bestätigungs-Mail auf Deutsch umschreiben.
3. Optional **Mit Google anmelden**: unter **Authentication → Providers → Google** einschalten. Supabase verlinkt dort die Anleitung für den Google-Schlüssel.

## 3. Stripe einrichten (Premium für 7,99 € im Monat)

Erst alles im **Testmodus** von Stripe machen (Schalter oben rechts im Stripe-Dashboard), dann ein zweites Mal im Live-Modus.

1. **Produkt anlegen:** Produktkatalog → **Produkt hinzufügen** → Name „Learnly Premium“, Preis 7,99 €, **wiederkehrend, monatlich**. Danach die **Preis-ID** kopieren (beginnt mit `price_`).
2. **Secret Key:** Entwickler → API-Schlüssel → **Geheimschlüssel** (beginnt mit `sk_test_` bzw. `sk_live_`).
3. **Webhook:** Entwickler → Webhooks → **Endpunkt hinzufügen**
   - URL: `https://DEINE-PROJEKT-REF.supabase.co/functions/v1/stripe-webhook`
   - Ereignisse: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Danach das **Signing Secret** kopieren (beginnt mit `whsec_`).
4. **Kundenportal einschalten:** Einstellungen → Billing → **Kundenportal** → aktivieren und „Kündigen erlauben“ anhaken. Dort kündigen deine Nutzer später ihr Abo.

## 4. KI-Schlüssel von Anthropic holen

1. Auf [console.anthropic.com](https://console.anthropic.com) registrieren.
2. Unter **Billing** eine Zahlungsmethode hinterlegen und etwas Guthaben aufladen. Die Kosten richten sich nach der Nutzung.
3. Unter **API Keys → Create Key** einen Schlüssel erstellen (beginnt mit `sk-ant-`). Er wird nur einmal angezeigt, also gleich in Schritt 6 verwenden.

Learnly nutzt standardmäßig das Modell `claude-opus-5-5`. Ein anderes Modell kannst du mit dem Secret `ANTHROPIC_MODEL` festlegen.

## 5. Adresse der App festlegen

Wenn du noch keine Domain hast: Hoste die App zuerst (Schritt 8), dann bekommst du eine Adresse wie `https://learnly.vercel.app`. Diese Adresse ist `APP_URL`.

## 6. Geheime Schlüssel in Supabase speichern

```bash
npx supabase secrets set \
  ANTHROPIC_API_KEY=sk-ant-... \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_PRICE_ID=price_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  APP_URL=https://deine-adresse
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` und `SUPABASE_SERVICE_ROLE_KEY` setzt Supabase für die Funktionen automatisch.

## 7. Server-Funktionen hochladen

```bash
npx supabase functions deploy ai
npx supabase functions deploy create-checkout
npx supabase functions deploy customer-portal
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

`stripe-webhook` braucht `--no-verify-jwt`, weil Stripe sich nicht bei Supabase anmeldet. Die Funktion prüft stattdessen die Signatur von Stripe.

## 8. App hosten (z. B. Vercel)

1. Auf [vercel.com](https://vercel.com) mit GitHub anmelden und das Repository `Learnly` importieren. Vercel erkennt Vite automatisch (Build: `npm run build`, Ausgabe: `dist`).
2. Unter **Environment Variables** eintragen:
   | Name | Wert |
   |---|---|
   | `VITE_SUPABASE_URL` | Project URL aus Schritt 1 |
   | `VITE_SUPABASE_ANON_KEY` | anon public key aus Schritt 1 |
   | `VITE_PAYMENTS` | `stripe` |
   | `VITE_AI_PROVIDER` | `http` |
3. **Deploy** klicken. Die Adresse in Supabase (Schritt 2) und als `APP_URL` (Schritt 6) eintragen, falls noch nicht geschehen.

Netlify oder Cloudflare Pages funktionieren genauso.

## 9. Testen

1. Konto anlegen, Bestätigungs-Mail öffnen, anmelden.
2. Auf **Upgrade** klicken und mit der Stripe-Testkarte `4242 4242 4242 4242` bezahlen (beliebiges Datum in der Zukunft, beliebige Prüfziffer).
3. Nach der Rückkehr sollte nach wenigen Sekunden „Premium ist aktiv“ erscheinen.
4. KI-Coach öffnen und eine Frage stellen. Die Antwort kommt jetzt von Claude, ohne „Demo“-Hinweis.
5. In den Einstellungen unter **Abo verwalten** kündigen und prüfen, dass das Konto wieder auf Free steht.

Wenn alles klappt: In Stripe auf **Live** umschalten, Schritt 3 dort wiederholen und die Live-Schlüssel mit Schritt 6 neu setzen.

## Vor dem Start nicht vergessen

Wer in Deutschland ein Abo verkauft, braucht auf der Website ein **Impressum**, eine **Datenschutzerklärung** (Supabase, Stripe und Anthropic als Auftragsverarbeiter nennen) sowie **AGB und Widerrufsbelehrung**. Das ist kein Rechtsrat: Lass das am besten kurz prüfen.
