import type { MathExercise, MathTopicId } from '@/types';
import { EXERCISES_DE, TOPICS_DE } from './math.de';

export interface MathTopic {
  id: MathTopicId;
  name: string;
  description: string;
  formulas: { name: string; formula: string; note?: string }[];
}

export const MATH_TOPICS: MathTopic[] = [
  {
    id: 'algebra',
    name: 'Algebra',
    description: 'Linear equations, systems, factoring and quadratics.',
    formulas: [
      { name: 'Linear equation', formula: 'ax + b = c  ⇒  x = (c − b) / a' },
      { name: 'Distributive law', formula: 'a(b + c) = ab + ac' },
      { name: 'Binomial square', formula: '(a + b)² = a² + 2ab + b²' },
      { name: 'Difference of squares', formula: 'a² − b² = (a + b)(a − b)' },
      { name: 'Quadratic formula', formula: 'x = (−b ± √(b² − 4ac)) / 2a', note: 'for ax² + bx + c = 0' },
    ],
  },
  {
    id: 'geometry',
    name: 'Geometry',
    description: 'Areas, perimeters, angles, volumes and Pythagoras.',
    formulas: [
      { name: 'Pythagorean theorem', formula: 'a² + b² = c²', note: 'c is the hypotenuse' },
      { name: 'Area of a circle', formula: 'A = π · r²' },
      { name: 'Circumference', formula: 'C = 2 · π · r' },
      { name: 'Area of a triangle', formula: 'A = ½ · b · h' },
      { name: 'Angle sum (triangle)', formula: 'α + β + γ = 180°' },
      { name: 'Volume of a cylinder', formula: 'V = π · r² · h' },
    ],
  },
  {
    id: 'percentages',
    name: 'Percentages',
    description: 'Discounts, increases, reverse percentages and interest.',
    formulas: [
      { name: 'Percentage value', formula: 'W = G · p / 100', note: 'G = base value, p = percent' },
      { name: 'Percentage rate', formula: 'p = W / G · 100' },
      { name: 'Increase by p %', formula: 'new = old · (1 + p/100)' },
      { name: 'Decrease by p %', formula: 'new = old · (1 − p/100)' },
      { name: 'Compound interest', formula: 'K = K₀ · (1 + p/100)ⁿ' },
    ],
  },
];

export const MATH_EXERCISES: MathExercise[] = [
  // ---------- Algebra ----------
  {
    id: 'alg1',
    topic: 'algebra',
    title: 'Solve a linear equation',
    difficulty: 'Easy',
    question: 'Solve for x:  3x + 7 = 22',
    formula: 'ax + b = c  ⇒  x = (c − b) / a',
    kind: 'input',
    answer: '5',
    steps: [
      { text: 'Subtract 7 from both sides to isolate the term with x.', math: '3x + 7 − 7 = 22 − 7  ⇒  3x = 15' },
      { text: 'Divide both sides by 3.', math: 'x = 15 / 3' },
      { text: 'Check: 3 · 5 + 7 = 22 ✓', math: 'x = 5' },
    ],
  },
  {
    id: 'alg2',
    topic: 'algebra',
    title: 'Expand brackets',
    difficulty: 'Easy',
    question: 'Expand and simplify:  4(2x − 3) − 2x',
    formula: 'a(b + c) = ab + ac',
    kind: 'mc',
    options: ['6x − 12', '8x − 12', '6x − 3', '2x − 12'],
    answer: '6x − 12',
    steps: [
      { text: 'Multiply 4 into each term inside the bracket.', math: '4 · 2x − 4 · 3 = 8x − 12' },
      { text: 'Subtract 2x.', math: '8x − 12 − 2x' },
      { text: 'Combine like terms.', math: '6x − 12' },
    ],
  },
  {
    id: 'alg3',
    topic: 'algebra',
    title: 'Equation with x on both sides',
    difficulty: 'Medium',
    question: 'Solve for x:  5x − 4 = 2x + 11',
    kind: 'input',
    answer: '5',
    steps: [
      { text: 'Bring all x terms to the left by subtracting 2x.', math: '5x − 2x − 4 = 11  ⇒  3x − 4 = 11' },
      { text: 'Add 4 to both sides.', math: '3x = 15' },
      { text: 'Divide by 3.', math: 'x = 5' },
    ],
  },
  {
    id: 'alg4',
    topic: 'algebra',
    title: 'Factor a quadratic',
    difficulty: 'Medium',
    question: 'Factor completely:  x² − 9',
    formula: 'a² − b² = (a + b)(a − b)',
    kind: 'mc',
    options: ['(x − 3)²', '(x + 3)(x − 3)', '(x + 9)(x − 1)', 'x(x − 9)'],
    answer: '(x + 3)(x − 3)',
    steps: [
      { text: 'Recognise the pattern: both terms are perfect squares separated by a minus sign.', math: 'x² − 9 = x² − 3²' },
      { text: 'Apply the difference of squares with a = x and b = 3.', math: '(x + 3)(x − 3)' },
      { text: 'Check by expanding: x² − 3x + 3x − 9 = x² − 9 ✓' },
    ],
  },
  {
    id: 'alg5',
    topic: 'algebra',
    title: 'System of two equations',
    difficulty: 'Medium',
    question: 'Solve the system:  x + y = 10  and  x − y = 4.  What is x?',
    kind: 'input',
    answer: '7',
    steps: [
      { text: 'Add the two equations so that y cancels out.', math: '(x + y) + (x − y) = 10 + 4  ⇒  2x = 14' },
      { text: 'Divide by 2.', math: 'x = 7' },
      { text: 'Substitute back to find y: 7 + y = 10.', math: 'y = 3' },
    ],
  },
  {
    id: 'alg6',
    topic: 'algebra',
    title: 'Quadratic formula',
    difficulty: 'Hard',
    question: 'Find the positive solution of  x² + 2x − 15 = 0',
    formula: 'x = (−b ± √(b² − 4ac)) / 2a',
    kind: 'input',
    answer: '3',
    steps: [
      { text: 'Read off the coefficients.', math: 'a = 1,  b = 2,  c = −15' },
      { text: 'Compute the discriminant.', math: 'b² − 4ac = 4 + 60 = 64,  √64 = 8' },
      { text: 'Insert into the formula.', math: 'x = (−2 ± 8) / 2' },
      { text: 'The two solutions are 3 and −5. The positive one is 3.', math: 'x = 3' },
    ],
  },
  // ---------- Geometry ----------
  {
    id: 'geo1',
    topic: 'geometry',
    title: 'Hypotenuse with Pythagoras',
    difficulty: 'Easy',
    question: 'A right triangle has legs a = 6 cm and b = 8 cm. How long is the hypotenuse c?',
    formula: 'a² + b² = c²',
    kind: 'input',
    answer: '10',
    unit: 'cm',
    steps: [
      { text: 'Insert the legs into the theorem.', math: 'c² = 6² + 8² = 36 + 64' },
      { text: 'Add.', math: 'c² = 100' },
      { text: 'Take the square root.', math: 'c = √100 = 10 cm' },
    ],
  },
  {
    id: 'geo2',
    topic: 'geometry',
    title: 'Area of a circle',
    difficulty: 'Easy',
    question: 'A circle has a radius of 5 cm. What is its area? (round to one decimal, π ≈ 3.14159)',
    formula: 'A = π · r²',
    kind: 'mc',
    options: ['31.4 cm²', '78.5 cm²', '15.7 cm²', '25.0 cm²'],
    answer: '78.5 cm²',
    steps: [
      { text: 'Square the radius.', math: 'r² = 5² = 25' },
      { text: 'Multiply by π.', math: 'A = 3.14159 · 25 ≈ 78.54' },
      { text: 'Round to one decimal place.', math: 'A ≈ 78.5 cm²' },
    ],
  },
  {
    id: 'geo3',
    topic: 'geometry',
    title: 'Missing angle',
    difficulty: 'Easy',
    question: 'Two angles of a triangle measure 47° and 68°. How large is the third angle (in degrees)?',
    formula: 'α + β + γ = 180°',
    kind: 'input',
    answer: '65',
    unit: '°',
    steps: [
      { text: 'Add the known angles.', math: '47° + 68° = 115°' },
      { text: 'Subtract from 180°.', math: 'γ = 180° − 115° = 65°' },
    ],
  },
  {
    id: 'geo4',
    topic: 'geometry',
    title: 'Triangle area',
    difficulty: 'Medium',
    question: 'A triangle has a base of 12 m and a height of 7 m. What is its area in m²?',
    formula: 'A = ½ · b · h',
    kind: 'input',
    answer: '42',
    unit: 'm²',
    steps: [
      { text: 'Multiply base and height.', math: '12 · 7 = 84' },
      { text: 'Take half of the result.', math: 'A = 84 / 2 = 42 m²' },
    ],
  },
  {
    id: 'geo5',
    topic: 'geometry',
    title: 'Volume of a cylinder',
    difficulty: 'Medium',
    question: 'A can has radius 4 cm and height 10 cm. What is its volume? (π ≈ 3.14159)',
    formula: 'V = π · r² · h',
    kind: 'mc',
    options: ['125.7 cm³', '502.7 cm³', '251.3 cm³', '160.0 cm³'],
    answer: '502.7 cm³',
    steps: [
      { text: 'Square the radius.', math: 'r² = 16' },
      { text: 'Multiply by the height.', math: '16 · 10 = 160' },
      { text: 'Multiply by π and round.', math: 'V = 3.14159 · 160 ≈ 502.7 cm³' },
    ],
  },
  {
    id: 'geo6',
    topic: 'geometry',
    title: 'Missing leg',
    difficulty: 'Hard',
    question: 'A 13 m ladder leans against a wall. Its foot is 5 m from the wall. How high up the wall does it reach (in m)?',
    formula: 'a² + b² = c²',
    kind: 'input',
    answer: '12',
    unit: 'm',
    steps: [
      { text: 'The ladder is the hypotenuse c = 13, the ground distance is one leg a = 5.', math: 'b² = c² − a²' },
      { text: 'Insert the values.', math: 'b² = 169 − 25 = 144' },
      { text: 'Take the square root.', math: 'b = 12 m' },
    ],
  },
  // ---------- Percentages ----------
  {
    id: 'pct1',
    topic: 'percentages',
    title: 'Percent of a value',
    difficulty: 'Easy',
    question: 'What is 15 % of 240?',
    formula: 'W = G · p / 100',
    kind: 'input',
    answer: '36',
    steps: [
      { text: 'Write the percentage as a decimal.', math: '15 % = 0.15' },
      { text: 'Multiply by the base value.', math: '240 · 0.15 = 36' },
    ],
  },
  {
    id: 'pct2',
    topic: 'percentages',
    title: 'Sale price',
    difficulty: 'Easy',
    question: 'A jacket costs €80 and is reduced by 25 %. What is the sale price?',
    formula: 'new = old · (1 − p/100)',
    kind: 'mc',
    options: ['€55', '€60', '€65', '€20'],
    answer: '€60',
    steps: [
      { text: 'A 25 % discount means you pay 75 % of the price.', math: '1 − 0.25 = 0.75' },
      { text: 'Multiply.', math: '80 · 0.75 = 60' },
      { text: 'The sale price is €60 (you save €20).' },
    ],
  },
  {
    id: 'pct3',
    topic: 'percentages',
    title: 'Percentage rate',
    difficulty: 'Medium',
    question: 'In a class of 28 students, 21 passed the test. What percentage passed?',
    formula: 'p = W / G · 100',
    kind: 'input',
    answer: '75',
    unit: '%',
    steps: [
      { text: 'Divide the part by the whole.', math: '21 / 28 = 0.75' },
      { text: 'Multiply by 100.', math: '0.75 · 100 = 75 %' },
    ],
  },
  {
    id: 'pct4',
    topic: 'percentages',
    title: 'Price increase',
    difficulty: 'Medium',
    question: 'A monthly ticket costs €49. The price rises by 8 %. What is the new price (in €, two decimals)?',
    formula: 'new = old · (1 + p/100)',
    kind: 'input',
    answer: '52.92',
    tolerance: 0.01,
    unit: '€',
    steps: [
      { text: 'An 8 % increase means multiplying by 1.08.', math: 'q = 1 + 0.08 = 1.08' },
      { text: 'Multiply.', math: '49 · 1.08 = 52.92' },
    ],
  },
  {
    id: 'pct5',
    topic: 'percentages',
    title: 'Reverse percentage',
    difficulty: 'Hard',
    question: 'After a 20 % discount, a pair of headphones costs €96. What was the original price?',
    kind: 'mc',
    options: ['€115.20', '€116', '€120', '€76.80'],
    answer: '€120',
    steps: [
      { text: '€96 is 80 % of the original price.', math: 'original · 0.8 = 96' },
      { text: 'Divide by 0.8, not multiply by 1.2.', math: 'original = 96 / 0.8 = 120' },
      { text: 'Common trap: adding 20 % to €96 gives €115.20, which is wrong because the 20 % was taken from a larger base.' },
    ],
  },
  {
    id: 'pct6',
    topic: 'percentages',
    title: 'Compound interest',
    difficulty: 'Hard',
    question: 'You save €1,000 at 3 % interest per year, compounded yearly. How much do you have after 2 years (in €)?',
    formula: 'K = K₀ · (1 + p/100)ⁿ',
    kind: 'input',
    answer: '1060.9',
    tolerance: 0.05,
    unit: '€',
    steps: [
      { text: 'Identify the values.', math: 'K₀ = 1000,  p = 3,  n = 2' },
      { text: 'Compute the growth factor.', math: '1.03² = 1.0609' },
      { text: 'Multiply.', math: 'K = 1000 · 1.0609 = €1,060.90' },
    ],
  },
];

/** Topics and exercises in the interface language. Ids never change, so progress is shared. */
/** Word variables in formulas ("new = old · …") read naturally in German. */
const deFormula = (f?: string) => f?.replace(/\bnew\b/g, 'neu').replace(/\bold\b/g, 'alt');

export function getMathTopics(lang: 'en' | 'de'): MathTopic[] {
  if (lang !== 'de') return MATH_TOPICS;
  return MATH_TOPICS.map((t) => {
    const d = TOPICS_DE[t.id];
    return { ...t, name: d.name, description: d.description, formulas: t.formulas.map((f, i) => ({ ...f, formula: deFormula(f.formula) ?? f.formula, name: d.formulaNames[i] ?? f.name, note: d.notes?.[i] ?? f.note })) };
  });
}

export function getMathExercises(lang: 'en' | 'de'): MathExercise[] {
  if (lang !== 'de') return MATH_EXERCISES;
  return MATH_EXERCISES.map((e) => {
    const d = EXERCISES_DE[e.id];
    if (!d) return e;
    return {
      ...e,
      title: d.title ?? e.title,
      question: d.question ?? e.question,
      options: d.options ?? e.options,
      answer: d.answer ?? e.answer,
      formula: d.formula ?? deFormula(e.formula),
      steps: e.steps.map((s, i) => ({ text: d.steps[i] ?? s.text, math: deFormula(d.maths?.[i] ?? s.math) })),
    };
  });
}
