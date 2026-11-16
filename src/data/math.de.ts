import type { MathExercise, MathTopicId } from '@/types';
import type { MathTopic } from './math';

type ExOverride = Partial<Pick<MathExercise, 'title' | 'question' | 'options' | 'answer' | 'formula'>> & { steps: string[]; maths?: (string | undefined)[] };

// German versions of the math content. Ids match math.ts so progress is shared between languages.
export const TOPICS_DE: Record<MathTopicId, Pick<MathTopic, 'name' | 'description'> & { formulaNames: string[]; notes?: (string | undefined)[] }> = {
  algebra: {
    name: 'Algebra',
    description: 'Lineare Gleichungen, Gleichungssysteme, Faktorisieren und quadratische Gleichungen.',
    formulaNames: ['Lineare Gleichung', 'Distributivgesetz', '1. binomische Formel', '3. binomische Formel', 'Mitternachtsformel'],
    notes: [undefined, undefined, undefined, undefined, 'für ax² + bx + c = 0'],
  },
  geometry: {
    name: 'Geometrie',
    description: 'Flächen, Umfänge, Winkel, Volumen und Pythagoras.',
    formulaNames: ['Satz des Pythagoras', 'Kreisfläche', 'Kreisumfang', 'Dreiecksfläche', 'Winkelsumme im Dreieck', 'Volumen eines Zylinders'],
    notes: ['c ist die Hypotenuse'],
  },
  percentages: {
    name: 'Prozentrechnung',
    description: 'Rabatte, Preiserhöhungen, Rückwärtsrechnen und Zinsen.',
    formulaNames: ['Prozentwert', 'Prozentsatz', 'Erhöhung um p %', 'Senkung um p %', 'Zinseszins'],
    notes: ['G = Grundwert, p = Prozentsatz'],
  },
};

export const EXERCISES_DE: Record<string, ExOverride> = {
  alg1: { title: 'Lineare Gleichung lösen', question: 'Löse nach x auf:  3x + 7 = 22', steps: ['Ziehe auf beiden Seiten 7 ab, damit der x-Term allein steht.', 'Teile beide Seiten durch 3.', 'Probe: 3 · 5 + 7 = 22 ✓'] },
  alg2: { title: 'Klammern auflösen', question: 'Löse die Klammer auf und vereinfache:  4(2x − 3) − 2x', steps: ['Multipliziere die 4 mit jedem Term in der Klammer.', 'Ziehe 2x ab.', 'Fasse gleichartige Terme zusammen.'] },
  alg3: { title: 'x auf beiden Seiten', question: 'Löse nach x auf:  5x − 4 = 2x + 11', steps: ['Bring alle x-Terme nach links, indem du 2x abziehst.', 'Addiere auf beiden Seiten 4.', 'Teile durch 3.'] },
  alg4: { title: 'Quadratischen Term faktorisieren', question: 'Faktorisiere vollständig:  x² − 9', steps: ['Erkenne das Muster: Beide Terme sind Quadratzahlen mit einem Minus dazwischen.', 'Wende die 3. binomische Formel mit a = x und b = 3 an.', 'Probe durch Ausmultiplizieren: x² − 3x + 3x − 9 = x² − 9 ✓'] },
  alg5: { title: 'Gleichungssystem', question: 'Löse das System:  x + y = 10  und  x − y = 4.  Wie groß ist x?', steps: ['Addiere beide Gleichungen, dann fällt y weg.', 'Teile durch 2.', 'Setze ein, um y zu bestimmen: 7 + y = 10.'] },
  alg6: { title: 'Mitternachtsformel', question: 'Bestimme die positive Lösung von  x² + 2x − 15 = 0', steps: ['Lies die Koeffizienten ab.', 'Berechne die Diskriminante.', 'Setze in die Formel ein.', 'Die beiden Lösungen sind 3 und −5. Die positive ist 3.'] },
  geo1: { title: 'Hypotenuse mit Pythagoras', question: 'Ein rechtwinkliges Dreieck hat die Katheten a = 6 cm und b = 8 cm. Wie lang ist die Hypotenuse c?', steps: ['Setze die Katheten in den Satz ein.', 'Addiere.', 'Zieh die Wurzel.'] },
  geo2: {
    title: 'Kreisfläche',
    question: 'Ein Kreis hat den Radius 5 cm. Wie groß ist seine Fläche? (auf eine Nachkommastelle, π ≈ 3,14159)',
    options: ['31,4 cm²', '78,5 cm²', '15,7 cm²', '25,0 cm²'],
    answer: '78,5 cm²',
    steps: ['Quadriere den Radius.', 'Multipliziere mit π.', 'Runde auf eine Nachkommastelle.'],
    maths: [undefined, 'A = 3,14159 · 25 ≈ 78,54', 'A ≈ 78,5 cm²'],
  },
  geo3: { title: 'Fehlender Winkel', question: 'Zwei Winkel eines Dreiecks sind 47° und 68° groß. Wie groß ist der dritte Winkel (in Grad)?', steps: ['Addiere die bekannten Winkel.', 'Zieh das Ergebnis von 180° ab.'] },
  geo4: { title: 'Dreiecksfläche', question: 'Ein Dreieck hat die Grundseite 12 m und die Höhe 7 m. Wie groß ist seine Fläche in m²?', steps: ['Multipliziere Grundseite und Höhe.', 'Nimm die Hälfte davon.'] },
  geo5: {
    title: 'Volumen eines Zylinders',
    question: 'Eine Dose hat den Radius 4 cm und die Höhe 10 cm. Wie groß ist ihr Volumen? (π ≈ 3,14159)',
    options: ['125,7 cm³', '502,7 cm³', '251,3 cm³', '160,0 cm³'],
    answer: '502,7 cm³',
    steps: ['Quadriere den Radius.', 'Multipliziere mit der Höhe.', 'Multipliziere mit π und runde.'],
    maths: [undefined, undefined, 'V = 3,14159 · 160 ≈ 502,7 cm³'],
  },
  geo6: { title: 'Fehlende Kathete', question: 'Eine 13 m lange Leiter lehnt an einer Wand. Ihr Fuß steht 5 m von der Wand entfernt. Wie hoch reicht sie an der Wand (in m)?', steps: ['Die Leiter ist die Hypotenuse c = 13, der Abstand am Boden ist eine Kathete a = 5.', 'Setze die Werte ein.', 'Zieh die Wurzel.'] },
  pct1: { title: 'Prozentwert', question: 'Wie viel sind 15 % von 240?', steps: ['Schreibe den Prozentsatz als Dezimalzahl.', 'Multipliziere mit dem Grundwert.'], maths: ['15 % = 0,15', '240 · 0,15 = 36'] },
  pct2: {
    title: 'Reduzierter Preis',
    question: 'Eine Jacke kostet 80 € und wird um 25 % reduziert. Wie hoch ist der neue Preis?',
    options: ['55 €', '60 €', '65 €', '20 €'],
    answer: '60 €',
    steps: ['25 % Rabatt heißt, du zahlst 75 % des Preises.', 'Multipliziere.', 'Der neue Preis ist 60 € (du sparst 20 €).'],
    maths: ['1 − 0,25 = 0,75', '80 · 0,75 = 60'],
  },
  pct3: { title: 'Prozentsatz', question: 'In einer Klasse mit 28 Schüler:innen haben 21 den Test bestanden. Wie viel Prozent haben bestanden?', steps: ['Teile den Anteil durch das Ganze.', 'Multipliziere mit 100.'], maths: ['21 / 28 = 0,75', '0,75 · 100 = 75 %'] },
  pct4: { title: 'Preiserhöhung', question: 'Ein Monatsticket kostet 49 €. Der Preis steigt um 8 %. Wie hoch ist der neue Preis (in €, zwei Nachkommastellen)?', steps: ['8 % Erhöhung heißt: mit 1,08 multiplizieren.', 'Multipliziere.'], maths: ['q = 1 + 0,08 = 1,08', '49 · 1,08 = 52,92'] },
  pct5: {
    title: 'Rückwärts rechnen',
    question: 'Nach 20 % Rabatt kosten Kopfhörer 96 €. Wie hoch war der ursprüngliche Preis?',
    options: ['115,20 €', '116 €', '120 €', '76,80 €'],
    answer: '120 €',
    steps: ['96 € sind 80 % des ursprünglichen Preises.', 'Teile durch 0,8, statt mit 1,2 zu multiplizieren.', 'Typische Falle: 20 % auf 96 € aufschlagen ergibt 115,20 €. Das ist falsch, weil die 20 % von einem größeren Grundwert abgezogen wurden.'],
    maths: ['Preis · 0,8 = 96', 'Preis = 96 / 0,8 = 120'],
  },
  pct6: { title: 'Zinseszins', question: 'Du legst 1.000 € zu 3 % Zinsen pro Jahr an, jährlich verzinst. Wie viel hast du nach 2 Jahren (in €)?', steps: ['Bestimme die Werte.', 'Berechne den Wachstumsfaktor.', 'Multipliziere.'], maths: [undefined, '1,03² = 1,0609', 'K = 1000 · 1,0609 = 1.060,90 €'] },
};
