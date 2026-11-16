import type { CoachScript, VoiceScript } from './coachScripts';

// Deutsche Beispielgespräche für den Demo-Modus. Keine KI: vorgeschriebene Antworten,
// die zeigen, wie der Lerncoach erklärt und nachfragt.
export const COACH_SCRIPTS_DE: CoachScript[] = [
  {
    id: 'mitosis',
    subject: 'Biology',
    match: ['ich verstehe mitose nicht', 'mitose', 'erklär mir mitose', 'erkläre mitose'],
    messages: [
      'Kein Problem, bei Mitose stolpern am Anfang viele. Lass sie uns von der einfachsten Idee aus aufbauen.\n\n**Mitose ist der Vorgang, bei dem eine Zelle eine exakte Kopie von sich selbst macht.** Dein Körper macht das ständig: wenn du wächst oder wenn eine Schnittwunde verheilt, teilen sich Zellen durch Mitose.\n\nStell es dir vor wie ein Buch, das du kopierst, bevor du es einer Freundin gibst:\n1. **Kopieren** – die Zelle verdoppelt zuerst ihre gesamte DNA, sodass sie zwei vollständige Sätze hat.\n2. **Ordnen** – die Kopien werden eng zu Chromosomen verpackt und in der Mitte aufgereiht.\n3. **Trennen** – die beiden Sätze werden zu entgegengesetzten Seiten gezogen.\n4. **Teilen** – die Zelle schnürt sich in der Mitte ein und wird zu zwei Zellen.',
      'Kurzer Check, bevor wir weitermachen: Wie viele Zellen hast du nach der Mitose, und wie ist ihre DNA im Vergleich zur ursprünglichen Zelle?',
    ],
    suggestions: ['Zwei Zellen mit derselben DNA?', 'Warum müssen sich Zellen teilen?'],
  },
  {
    id: 'mitosis-2',
    subject: 'Biology',
    match: ['zwei zellen mit derselben dna', 'zwei identische zellen', 'zwei zellen'],
    messages: [
      'Genau richtig. **Zwei Tochterzellen, jede mit derselben DNA wie die Ausgangszelle.** Genau darum geht es bei der Mitose: mehr von derselben Zelle herzustellen.\n\nDas ist auch der entscheidende Unterschied zur **Meiose**, die Geschlechtszellen mit nur der *halben* DNA bildet. Dieser Vergleich kommt in Prüfungen sehr gern vor, also merk ihn dir.',
      'Bereit für die vier Phasen? Eine beliebte Eselsbrücke ist **PMAT**. Willst du raten, wofür die Buchstaben stehen, oder soll ich sie dir erklären?',
    ],
    suggestions: ['Erklär mir die Phasen', 'Was ist der Unterschied zur Meiose?'],
  },
  {
    id: 'phases',
    subject: 'Biology',
    match: ['erklär mir die phasen', 'phasen der mitose', 'pmat'],
    messages: [
      'Hier ist **PMAT**, Phase für Phase:\n\n- **P – Prophase:** Die Chromosomen verdichten sich und werden sichtbar. Die Kernhülle löst sich auf.\n- **M – Metaphase:** Die Chromosomen ordnen sich in der **M**itte der Zelle an.\n- **A – Anaphase:** Die Schwesterchromatiden werden **a**useinandergezogen, zu den Polen.\n- **T – Telophase:** Es bilden sich zwei neue Zellkerne. Danach teilt die Zytokinese die Zelle.\n\nDie Buchstaben-Hinweise (Mitte, auseinander) sind der einfachste Weg, sie dir zu merken.',
      'Lass uns testen: In welcher Phase siehst du die Chromosomen in einer Reihe quer durch die Zellmitte?',
    ],
    suggestions: ['Metaphase', 'Mach mir Karteikarten dazu'],
  },
  {
    id: 'metaphase',
    subject: 'Biology',
    match: ['metaphase'],
    messages: [
      'Richtig, **Metaphase**. M wie Mitte. Du kennst jetzt die Reihenfolge und das wichtigste Ereignis jeder Phase, damit sind die meisten Prüfungsfragen zur Mitose abgedeckt.',
      'Willst du es festigen? In deinem Theorie-Bereich gibt es schon das Thema **Cell division: Mitosis** mit Karteikarten. Fünf Minuten Wiederholung heute und noch einmal in zwei Tagen, dann sitzt es.',
    ],
    suggestions: ['Was ist der Unterschied zur Meiose?', 'Hilf mir bei der Vorbereitung auf meine Bio-Prüfung'],
  },
  {
    id: 'divide-why',
    subject: 'Biology',
    match: ['warum müssen sich zellen teilen', 'warum teilen sich zellen'],
    messages: [
      'Gute Frage, denn sie erklärt, *warum* Mitose wichtig ist. Zellen teilen sich aus drei Hauptgründen:\n\n1. **Wachstum** – aus einem Baby wird ein Erwachsener, indem Billionen Zellen dazukommen.\n2. **Reparatur** – wenn du dich in den Finger schneidest, füllen neue Hautzellen die Lücke.\n3. **Erneuerung** – rote Blutkörperchen leben nur etwa 120 Tage und werden ständig ersetzt.',
      'Fällt dir ein Körperteil ein, in dem gerade jetzt Zellen ersetzt werden?',
    ],
    suggestions: ['Zwei Zellen mit derselben DNA?', 'Erklär mir die Phasen'],
  },
  {
    id: 'meiosis',
    subject: 'Biology',
    match: ['unterschied zur meiose', 'meiose'],
    messages: [
      'Hier im direkten Vergleich:\n\n| | Mitose | Meiose |\n|---|---|---|\n| Zweck | Wachstum & Reparatur | Geschlechtszellen |\n| Teilungen | 1 | 2 |\n| Tochterzellen | 2 | 4 |\n| DNA | identisch (diploid) | halbiert, verschieden (haploid) |\n\nIn einem Satz: **Mitose kopiert, Meiose mischt und halbiert.**',
      'Welcher der beiden Vorgänge sorgt für genetische Vielfalt?',
    ],
    suggestions: ['Erklär mir die Phasen', 'Mach mir Karteikarten dazu'],
  },
  {
    id: 'pythagoras',
    subject: 'Mathematics',
    match: ['satz des pythagoras', 'pythagoras'],
    messages: [
      'Der Satz des Pythagoras gilt für **rechtwinklige Dreiecke** (ein Winkel ist 90°).\n\nWenn die beiden kürzeren Seiten (Katheten) **a** und **b** heißen und die längste Seite gegenüber dem rechten Winkel (Hypotenuse) **c**, dann gilt:\n\n`a² + b² = c²`\n\nBeispiel: a = 3, b = 4 → 9 + 16 = 25 → c = √25 = **5**.\n\nSo kannst du es dir vorstellen: Ein Quadrat über der Seite c hat genau dieselbe Fläche wie die Quadrate über a und b zusammen.',
      'Jetzt du: Ein rechtwinkliges Dreieck hat Katheten von 6 und 8. Wie lang ist die Hypotenuse, ohne Taschenrechner? (Tipp: Schau dir das 3-4-5-Beispiel an.)',
    ],
    suggestions: ['Ist es 10?', 'Wofür brauche ich das im echten Leben?'],
  },
  {
    id: 'pyth-10',
    subject: 'Mathematics',
    match: ['ist es 10', '10'],
    messages: [
      'Ja! 6-8-10 ist einfach das verdoppelte 3-4-5-Dreieck. Wer diese **pythagoreischen Tripel** (3-4-5, 5-12-13, 8-15-17) erkennt, spart in Prüfungen viel Zeit.',
      'Nächste Aufgabe: Die Hypotenuse ist 13 und eine Kathete 5. Wie würdest du die Gleichung aufstellen, um die andere Kathete zu finden?',
    ],
    suggestions: ['Wofür brauche ich das im echten Leben?', 'Gib mir eine Übungsaufgabe'],
  },
  {
    id: 'french-rev',
    subject: 'History',
    match: ['französische revolution', 'ursachen der französischen'],
    messages: [
      'Historiker:innen fassen die Ursachen der Französischen Revolution (1789) meist in vier Bereiche zusammen:\n\n1. **Geld** – Frankreich war nach teuren Kriegen, auch durch die Unterstützung der Amerikanischen Revolution, fast bankrott.\n2. **Ungerechte Gesellschaft** – der Dritte Stand (rund 97 % der Menschen) zahlte die meisten Steuern, Klerus und Adel kaum etwas.\n3. **Neue Ideen** – Aufklärer wie Rousseau und Voltaire stellten die absolute Macht der Könige infrage.\n4. **Hunger** – schlechte Ernten 1788 verdoppelten den Brotpreis.\n\nAls Ludwig XVI. im Mai 1789 die Generalstände einberief, um Steuern zu erhöhen, kamen all diese Spannungen auf einmal zum Ausbruch.',
      'Welche dieser vier Ursachen war deiner Meinung nach der *Auslöser*, und welche waren langfristige Ursachen? Prüfungsfragen verlangen oft genau diese Unterscheidung.',
    ],
    suggestions: ['War Geld der Auslöser?', 'Erklär mir die Generalstände'],
  },
  {
    id: 'vokabeln',
    subject: 'Languages',
    match: ['vokabeln besser merken', 'vokabeln merken', 'vokabeln'],
    messages: [
      'Vokabeln bleiben am besten hängen, wenn du drei Dinge kombinierst:\n\n- **Kurz und oft statt lang und selten:** 10 Minuten täglich schlagen eine Stunde am Sonntag.\n- **Aktiv abrufen:** Deck die Lösung ab und sag das Wort laut, bevor du die Karte umdrehst.\n- **In beide Richtungen üben:** Englisch → Deutsch ist leichter als Deutsch → Englisch. Prüfungen fragen meistens die schwere Richtung.\n\nUnd lerne Wörter immer im Zusammenhang, zum Beispiel *a cup of tea* statt nur *cup*.',
      'Mit welcher Sprache lernst du gerade, und in welche Richtung fällt es dir schwerer?',
    ],
    suggestions: ['Englisch nach Deutsch', 'Hilf mir bei der Vorbereitung auf meine Bio-Prüfung'],
  },
  {
    id: 'exam-prep',
    subject: 'General',
    match: ['vorbereitung auf meine', 'prüfung'],
    messages: [
      'Lass uns deine Vorbereitung konkret machen. Ein Plan, der für die meisten Prüfungen funktioniert:\n\n1. **Zuerst Lücken finden (Tag 1)** – mach zu jedem Thema ein kurzes Quiz und notier, was du falsch hattest.\n2. **Kurze tägliche Einheiten (Tag 2–8)** – 20–30 Minuten, das schwächste Thema zuerst.\n3. **Wiederholungen verteilen** – jedes Thema nach 1, 3 und 7 Tagen wiederholen statt alles auf einmal zu pauken.\n4. **Prüfung simulieren (2 Tage vorher)** – mit Zeitlimit, ohne Notizen.\n5. **Am Tag davor nur locker wiederholen** – Schlaf bringt mehr als eine Stunde zusätzliches Lernen.',
      'Wann ist deine Prüfung, und welches Thema fühlt sich gerade am wackligsten an? Ich kann daraus einen Plan in deinem Lernplan machen.',
    ],
    suggestions: ['Öffne meinen Lernplan', 'Ich verstehe Mitose nicht.'],
  },
];

export const COACH_STARTERS_DE = [
  'Ich verstehe Mitose nicht.',
  'Erklär mir den Satz des Pythagoras',
  'Was waren die Ursachen der Französischen Revolution?',
  'Wie kann ich mir Vokabeln besser merken?',
  'Hilf mir bei der Vorbereitung auf meine Bio-Prüfung',
];

export const VOICE_SCRIPTS_DE: VoiceScript[] = [
  {
    subject: 'Languages',
    turns: [
      { user: 'Lass uns Spanisch für meine Reise üben.', ai: '¡Claro! Ich sage ein Wort auf Deutsch, und du antwortest auf Spanisch. Bereit? Das erste ist: Fahrkarte.' },
      { user: 'El billete.', ai: '¡Perfecto! El billete. Das nächste ist etwas schwerer: Gepäck.' },
      { user: 'La… equipaje?', ai: 'Fast! Es heißt el equipaje, männlich, obwohl es auf -e endet. Sag es noch einmal: el equipaje.' },
      { user: 'El equipaje.', ai: 'Super Aussprache. Zwei von drei richtig. Machen wir mit Wörtern rund ums Hotel weiter?' },
    ],
  },
  {
    subject: 'Biology',
    turns: [
      { user: 'Frag mich zur Photosynthese ab.', ai: 'Gern. Erste Frage: Welches Gas nehmen Pflanzen bei der Photosynthese auf?' },
      { user: 'Kohlenstoffdioxid.', ai: 'Richtig! Und welches Gas geben sie ab?' },
      { user: 'Sauerstoff.', ai: 'Genau. Letzte Frage: In welchem Organell findet die Photosynthese statt?' },
      { user: 'Im Chloroplasten.', ai: 'Drei von drei. Die Grundlagen sitzen, beim nächsten Mal gehen wir in den Calvin-Zyklus.' },
    ],
  },
  {
    subject: 'Mathematics',
    turns: [
      { user: 'Hilf mir bei Prozentrechnung.', ai: 'Klar. Eine Jacke kostet 80 Euro und ist um 25 Prozent reduziert. Was zahlst du?' },
      { user: 'Sechzig Euro.', ai: 'Richtig. Jetzt die knifflige Rückwärts-Version: Nach 20 Prozent Rabatt kostet etwas 96 Euro. Was war der ursprüngliche Preis?' },
      { user: 'Hundertfünfzehn?', ai: 'Das ist die häufigste Falle. 96 Euro sind 80 Prozent des ursprünglichen Preises, also teilst du durch 0,8. Was kommt raus?' },
      { user: 'Hundertzwanzig.', ai: 'Genau, 120 Euro. Merk dir: Beim Rückwärtsrechnen wird geteilt, nicht aufgeschlagen.' },
    ],
  },
];
