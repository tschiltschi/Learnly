// German versions of the built-in sample content. Ids match vocab.ts and theory.ts, so
// learning progress (boxes, scores) carries over when the language is switched.

type WordDE = [term: string, translation: string, note?: string];

export const VOCAB_DE: Record<string, { name: string; description: string; sourceLang: string; targetLang: string; words: Record<string, WordDE> }> = {
  food01: {
    name: 'Essen & Trinken',
    description: 'Alltagswörter für Küche, Café und Supermarkt.',
    sourceLang: 'German',
    targetLang: 'English',
    words: {
      f1: ['der Apfel', 'apple', 'Plural: apples'],
      f2: ['das Brot', 'bread'],
      f3: ['das Wasser', 'water'],
      f4: ['der Käse', 'cheese'],
      f5: ['die Milch', 'milk'],
      f6: ['die Erdbeere', 'strawberry', 'Plural: strawberries'],
      f7: ['das Frühstück', 'breakfast'],
      f8: ['das Messer', 'knife', 'Plural: knives'],
      f9: ['die Gabel', 'fork'],
      f10: ['die Tasse', 'cup'],
      f11: ['das Gemüse', 'vegetables', 'im Englischen meist Plural'],
      f12: ['die Rechnung (im Restaurant)', 'the bill', 'US-Englisch: the check'],
    },
  },
  travel01: {
    name: 'Reise-Grundwortschatz',
    description: 'Was du am Flughafen, am Bahnhof und im Hotel brauchst.',
    sourceLang: 'German',
    targetLang: 'Spanish',
    words: {
      t1: ['der Bahnhof', 'la estación de tren'],
      t2: ['die Fahrkarte', 'el billete'],
      t3: ['der Flughafen', 'el aeropuerto'],
      t4: ['das Gepäck', 'el equipaje'],
      t5: ['der Reisepass', 'el pasaporte'],
      t6: ['das Zimmer', 'la habitación'],
      t7: ['der Schlüssel', 'la llave'],
      t8: ['die Abfahrt', 'la salida'],
      t9: ['die Ankunft', 'la llegada'],
      t10: ['Wo ist …?', '¿Dónde está…?'],
    },
  },
  verbs01: {
    name: 'Alltagsverben',
    description: 'Die 8 regelmäßigen und unregelmäßigen Verben, die du am häufigsten brauchst.',
    sourceLang: 'German',
    targetLang: 'French',
    words: {
      v1: ['sein', 'être', 'je suis, tu es, il est'],
      v2: ['haben', 'avoir', "j'ai, tu as, il a"],
      v3: ['gehen', 'aller', 'je vais, tu vas, il va'],
      v4: ['machen / tun', 'faire', 'je fais, tu fais, il fait'],
      v5: ['sprechen', 'parler'],
      v6: ['essen', 'manger'],
      v7: ['wollen', 'vouloir', 'je veux, tu veux, il veut'],
      v8: ['wissen', 'savoir'],
    },
  },
};

export const THEORY_DE: Record<string, { title: string; description: string; notes: string; documents?: Record<string, string>; cards: Record<string, [front: string, back: string]> }> = {
  mitosis: {
    title: 'Zellteilung: Mitose',
    description: 'Wie sich eine Zelle in zwei genetisch identische Tochterzellen teilt.',
    notes: `Mitose: Teilung eines Zellkerns, bei der zwei genetisch identische Tochterkerne entstehen.
Interphase: Die Phase vor der Mitose, in der die Zelle wächst und ihre DNA verdoppelt.
Prophase: Die Chromosomen verdichten sich und werden sichtbar; die Kernhülle beginnt sich aufzulösen.
Metaphase: Die Chromosomen ordnen sich in der Mitte der Zelle an (Äquatorialebene).
Anaphase: Die Schwesterchromatiden werden zu den entgegengesetzten Zellpolen gezogen.
Telophase: Um die beiden Chromosomensätze bilden sich neue Kernhüllen.
Zytokinese: Das Zellplasma teilt sich, sodass zwei getrennte Tochterzellen entstehen.
Spindelfasern: Proteinstrukturen, die an den Chromosomen ansetzen und sie auseinanderziehen.
Chromatid: Eine der beiden identischen Hälften eines verdoppelten Chromosoms.`,
    documents: { doc1: 'Biologie_Kap4_Zellzyklus.pdf' },
    cards: {
      m1: ['Was ist Mitose?', 'Teilung eines Zellkerns, bei der zwei genetisch identische Tochterkerne entstehen.'],
      m2: ['Was passiert in der Metaphase?', 'Die Chromosomen ordnen sich in der Mitte der Zelle an (Äquatorialebene).'],
      m3: ['Was passiert in der Anaphase?', 'Die Schwesterchromatiden werden zu den entgegengesetzten Zellpolen gezogen.'],
      m4: ['Was ist Zytokinese?', 'Die Teilung des Zellplasmas, bei der zwei getrennte Tochterzellen entstehen.'],
      m5: ['Was passiert in der Prophase?', 'Die Chromosomen verdichten sich und werden sichtbar; die Kernhülle löst sich auf.'],
      m6: ['Was sind Spindelfasern?', 'Proteinstrukturen, die an den Chromosomen ansetzen und sie auseinanderziehen.'],
      m7: ['Was passiert in der Telophase?', 'Um die beiden Chromosomensätze bilden sich neue Kernhüllen.'],
    },
  },
  photosyn: {
    title: 'Fotosynthese',
    description: 'Wie Pflanzen aus Licht, Wasser und CO₂ Glukose und Sauerstoff herstellen.',
    notes: `Fotosynthese: Vorgang, bei dem Pflanzen mit Lichtenergie aus Kohlenstoffdioxid und Wasser Glukose herstellen.
Chlorophyll: Der grüne Farbstoff in den Chloroplasten, der Lichtenergie aufnimmt.
Chloroplast: Das Zellorganell, in dem die Fotosynthese stattfindet.
Lichtabhängige Reaktionen: Reaktionen in den Thylakoidmembranen, die ATP, NADPH und Sauerstoff erzeugen.
Calvin-Zyklus: Lichtunabhängige Reaktionen im Stroma, die CO₂ zu Glukose verarbeiten.
Spaltöffnungen: Kleine Poren auf der Blattoberfläche, die CO₂ hinein- und Sauerstoff herauslassen.`,
    cards: {
      p1: ['Was ist Fotosynthese?', 'Der Vorgang, bei dem Pflanzen mit Lichtenergie aus Kohlenstoffdioxid und Wasser Glukose herstellen.'],
      p2: ['Was ist Chlorophyll?', 'Der grüne Farbstoff in den Chloroplasten, der Lichtenergie aufnimmt.'],
      p3: ['Wo findet der Calvin-Zyklus statt?', 'Im Stroma des Chloroplasten.'],
      p4: ['Was sind Spaltöffnungen?', 'Kleine Poren auf der Blattoberfläche, die CO₂ hinein- und Sauerstoff herauslassen.'],
    },
  },
  frenchrev: {
    title: 'Die Französische Revolution (1789–1799)',
    description: 'Ursachen, wichtige Ereignisse und Folgen der Revolution.',
    notes: `Generalstände: Versammlung der drei Stände (Klerus, Adel, Bürger und Bauern), die Ludwig XVI. im Mai 1789 einberief.
Ballhausschwur: Schwur des Dritten Standes am 20. Juni 1789, nicht auseinanderzugehen, bis Frankreich eine Verfassung hat.
Sturm auf die Bastille: Angriff auf die Pariser Festung am 14. Juli 1789, Symbol für den Beginn der Revolution.
Erklärung der Menschenrechte: Dokument vom August 1789, nach dem alle Menschen frei und gleich an Rechten geboren sind.
Schreckensherrschaft: Zeit von 1793 bis 1794, in der der Wohlfahrtsausschuss Tausende vermeintliche Feinde hinrichten ließ.
Robespierre: Jakobinerführer, der den Wohlfahrtsausschuss beherrschte und im Juli 1794 hingerichtet wurde.
Napoleon Bonaparte: General, der im November 1799 mit dem Staatsstreich vom 18. Brumaire die Macht übernahm.`,
    documents: { doc2: 'Franzoesische_Revolution_Zeitstrahl.docx' },
    cards: {
      h1: ['Wann war der Sturm auf die Bastille?', '14. Juli 1789'],
      h2: ['Was war der Ballhausschwur?', 'Der Schwur des Dritten Standes am 20. Juni 1789, nicht auseinanderzugehen, bis Frankreich eine Verfassung hat.'],
      h3: ['Was war die Schreckensherrschaft?', 'Die Zeit von 1793 bis 1794, in der der Wohlfahrtsausschuss Tausende vermeintliche Feinde hinrichten ließ.'],
      h4: ['Wer war Robespierre?', 'Jakobinerführer, der den Wohlfahrtsausschuss beherrschte; im Juli 1794 hingerichtet.'],
      h5: ['Wie kam Napoleon an die Macht?', 'Durch den Staatsstreich vom 18. Brumaire im November 1799.'],
      h6: ['Was besagte die Erklärung der Menschenrechte?', 'Dass die Menschen frei und gleich an Rechten geboren werden und bleiben (August 1789).'],
    },
  },
  binary: {
    title: 'Binärsystem & Zahlensysteme',
    description: 'Bits, Bytes, Binär- und Hexadezimalzahlen und wie Computer Zahlen speichern.',
    notes: `Bit: Die kleinste Dateneinheit im Computer, entweder 0 oder 1.
Byte: Eine Gruppe aus 8 Bits, die 256 verschiedene Werte darstellen kann.
Binärsystem: Zahlensystem zur Basis 2, das nur die Ziffern 0 und 1 verwendet.
Hexadezimalsystem: Zahlensystem zur Basis 16 mit den Ziffern 0–9 und den Buchstaben A–F.
Zweierkomplement: Darstellung negativer Ganzzahlen im Binärsystem, indem man alle Bits umkehrt und 1 addiert.
ASCII: Zeichenkodierung, die 128 Zeichen den Zahlen 0–127 zuordnet.`,
    cards: {
      c1: ['Was ist ein Bit?', 'Die kleinste Dateneinheit im Computer, entweder 0 oder 1.'],
      c2: ['Wie viele Bits hat ein Byte?', '8 Bits, die 256 verschiedene Werte darstellen können.'],
      c3: ['Was ist 1011 im Dezimalsystem?', '11  (8 + 0 + 2 + 1)'],
      c4: ['Was ist das Hexadezimalsystem?', 'Ein Zahlensystem zur Basis 16 mit 0–9 und A–F.'],
      c5: ['Was ist das Zweierkomplement?', 'Eine Darstellung negativer Ganzzahlen: alle Bits umkehren und 1 addieren.'],
    },
  },
  sorting: {
    title: 'Sortieralgorithmen',
    description: 'Bubblesort, Mergesort, Quicksort und ihre Laufzeiten.',
    notes: `Bubblesort: Vertauscht wiederholt benachbarte Elemente, die falsch herum stehen; Laufzeit O(n²).
Mergesort: Teilt die Liste in Hälften, sortiert jede Hälfte und fügt sie wieder zusammen; Laufzeit O(n log n).
Quicksort: Wählt ein Pivotelement und teilt die Liste darum herum auf; im Mittel O(n log n).
Stabiles Sortieren: Ein Verfahren, bei dem gleiche Elemente ihre ursprüngliche Reihenfolge behalten.
O-Notation: Beschreibt, wie die Laufzeit eines Algorithmus mit der Eingabegröße wächst.`,
    cards: {},
  },
};
