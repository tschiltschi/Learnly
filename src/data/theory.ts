import type { TheoryCard, TheoryTopic } from '@/types';

export const THEORY_SUBJECTS = ['Biology', 'History', 'Computer Science', 'Chemistry', 'Geography', 'Economics'];

const card = (id: string, front: string, back: string, box = 0, correct = 0, wrong = 0): TheoryCard => ({
  id,
  front,
  back,
  box,
  correct,
  wrong,
  due: 0,
});

export function sampleTheoryTopics(now = Date.now()): TheoryTopic[] {
  const d = 86400000;
  return [
    {
      id: 'mitosis',
      subject: 'Biology',
      title: 'Cell division: Mitosis',
      description: 'How one cell divides into two genetically identical daughter cells.',
      notes: `Mitosis: Division of a cell nucleus that produces two genetically identical daughter nuclei.
Interphase: The phase before mitosis in which the cell grows and copies its DNA.
Prophase: Chromosomes condense and become visible; the nuclear envelope starts to break down.
Metaphase: Chromosomes line up along the middle of the cell (the metaphase plate).
Anaphase: Sister chromatids are pulled apart to opposite poles of the cell.
Telophase: New nuclear envelopes form around the two sets of chromosomes.
Cytokinesis: The cytoplasm divides, creating two separate daughter cells.
Spindle fibres: Protein structures that attach to chromosomes and pull them apart.
Chromatid: One of the two identical halves of a duplicated chromosome.`,
      documents: [{ id: 'doc1', name: 'Biology_Ch4_Cell_Cycle.pdf', size: 2_412_000, type: 'application/pdf', uploadedAt: now - 4 * d }],
      cards: [
        card('m1', 'What is mitosis?', 'Division of a cell nucleus that produces two genetically identical daughter nuclei.', 2, 3, 1),
        card('m2', 'What happens in metaphase?', 'Chromosomes line up along the middle of the cell (the metaphase plate).', 1, 1, 1),
        card('m3', 'What happens in anaphase?', 'Sister chromatids are pulled apart to opposite poles of the cell.', 0, 0, 2),
        card('m4', 'What is cytokinesis?', 'The division of the cytoplasm, creating two separate daughter cells.', 2, 2, 0),
        card('m5', 'What happens in prophase?', 'Chromosomes condense and become visible; the nuclear envelope breaks down.', 1, 1, 0),
        card('m6', 'What are spindle fibres?', 'Protein structures that attach to chromosomes and pull them apart.', 0, 0, 1),
        card('m7', 'What happens in telophase?', 'New nuclear envelopes form around the two sets of chromosomes.', 0, 0, 0),
      ],
      quizScores: [
        { at: now - 5 * d, correct: 4, total: 7 },
        { at: now - 2 * d, correct: 5, total: 7 },
      ],
      createdAt: now - 12 * d,
      updatedAt: now - 2 * d,
      sample: true,
    },
    {
      id: 'photosyn',
      subject: 'Biology',
      title: 'Photosynthesis',
      description: 'How plants turn light, water and CO₂ into glucose and oxygen.',
      notes: `Photosynthesis: The process in which plants use light energy to make glucose from carbon dioxide and water.
Chlorophyll: The green pigment in chloroplasts that absorbs light energy.
Chloroplast: The organelle where photosynthesis takes place.
Light-dependent reactions: Reactions in the thylakoid membranes that produce ATP, NADPH and oxygen.
Calvin cycle: Light-independent reactions in the stroma that fix CO₂ into glucose.
Stomata: Small pores on the leaf surface that let CO₂ in and oxygen out.`,
      documents: [],
      cards: [
        card('p1', 'What is photosynthesis?', 'The process in which plants use light energy to make glucose from carbon dioxide and water.', 1, 1, 0),
        card('p2', 'What is chlorophyll?', 'The green pigment in chloroplasts that absorbs light energy.', 2, 2, 0),
        card('p3', 'Where does the Calvin cycle take place?', 'In the stroma of the chloroplast.', 0, 0, 1),
        card('p4', 'What are stomata?', 'Small pores on the leaf surface that let CO₂ in and oxygen out.', 1, 1, 0),
      ],
      quizScores: [],
      createdAt: now - 8 * d,
      updatedAt: now - 3 * d,
      sample: true,
    },
    {
      id: 'frenchrev',
      subject: 'History',
      title: 'The French Revolution (1789–1799)',
      description: 'Causes, key events and consequences of the revolution.',
      notes: `Estates-General: Assembly of the three estates (clergy, nobility, commoners) called by Louis XVI in May 1789.
Tennis Court Oath: Pledge on 20 June 1789 by the Third Estate not to separate until France had a constitution.
Storming of the Bastille: Attack on the Paris fortress-prison on 14 July 1789, a symbol of the revolution's start.
Declaration of the Rights of Man: Document from August 1789 stating that men are born free and equal in rights.
Reign of Terror: Period 1793–1794 in which the Committee of Public Safety executed thousands of suspected enemies.
Robespierre: Jacobin leader who dominated the Committee of Public Safety and was executed in July 1794.
Napoleon Bonaparte: General who seized power in the coup of 18 Brumaire in November 1799.`,
      documents: [{ id: 'doc2', name: 'French_Revolution_Timeline.docx', size: 418_000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadedAt: now - 6 * d }],
      cards: [
        card('h1', 'When was the Storming of the Bastille?', '14 July 1789', 3, 3, 0),
        card('h2', 'What was the Tennis Court Oath?', 'A pledge on 20 June 1789 by the Third Estate not to separate until France had a constitution.', 1, 1, 1),
        card('h3', 'What was the Reign of Terror?', 'The period 1793–1794 in which the Committee of Public Safety executed thousands of suspected enemies.', 2, 2, 0),
        card('h4', 'Who was Robespierre?', 'Jacobin leader who dominated the Committee of Public Safety; executed in July 1794.', 1, 1, 1),
        card('h5', 'How did Napoleon come to power?', 'Through the coup of 18 Brumaire in November 1799.', 0, 0, 1),
        card('h6', 'What did the Declaration of the Rights of Man state?', 'That men are born and remain free and equal in rights (August 1789).', 2, 2, 0),
      ],
      quizScores: [{ at: now - 3 * d, correct: 5, total: 6 }],
      createdAt: now - 10 * d,
      updatedAt: now - 3 * d,
      sample: true,
    },
    {
      id: 'binary',
      subject: 'Computer Science',
      title: 'Binary & number systems',
      description: 'Bits, bytes, binary, hexadecimal and how computers store numbers.',
      notes: `Bit: The smallest unit of data in a computer, either 0 or 1.
Byte: A group of 8 bits that can represent 256 different values.
Binary: Base-2 number system that uses only the digits 0 and 1.
Hexadecimal: Base-16 number system using the digits 0–9 and the letters A–F.
Two's complement: Method for representing negative integers in binary by inverting the bits and adding 1.
ASCII: Character encoding that maps 128 characters to the numbers 0–127.`,
      documents: [],
      cards: [
        card('c1', 'What is a bit?', 'The smallest unit of data in a computer, either 0 or 1.', 3, 3, 0),
        card('c2', 'How many bits are in a byte?', '8 bits, which can represent 256 different values.', 3, 2, 0),
        card('c3', 'What is 1011 in decimal?', '11  (8 + 0 + 2 + 1)', 1, 1, 1),
        card('c4', 'What is hexadecimal?', 'A base-16 number system using 0–9 and A–F.', 1, 1, 0),
        card('c5', "What is two's complement?", 'A way to represent negative integers: invert all bits and add 1.', 0, 0, 2),
      ],
      quizScores: [{ at: now - 1 * d, correct: 4, total: 5 }],
      createdAt: now - 7 * d,
      updatedAt: now - 1 * d,
      sample: true,
    },
    {
      id: 'sorting',
      subject: 'Computer Science',
      title: 'Sorting algorithms',
      description: 'Bubble sort, merge sort, quicksort and their running times.',
      notes: `Bubble sort: Repeatedly swaps neighbouring elements that are in the wrong order; O(n²) time.
Merge sort: Divides the list in halves, sorts each half and merges them; O(n log n) time.
Quicksort: Picks a pivot and partitions the list around it; O(n log n) on average.
Stable sort: A sort that keeps equal elements in their original relative order.
Big O notation: Describes how the running time of an algorithm grows with input size.`,
      documents: [],
      cards: [],
      quizScores: [],
      createdAt: now - 2 * d,
      updatedAt: now - 2 * d,
      sample: true,
    },
  ];
}
