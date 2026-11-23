import type { CEFRLevel, LeaderboardEntry } from '../types/ielts';

export const VOCAB_CATEGORIES = [
  'Academic Vocabulary',
  'Environment',
  'Education',
  'Technology',
  'Health',
  'Business',
  'Society',
  'Science',
  'Culture',
  'Government',
  'IELTS Writing Vocabulary',
  'IELTS Speaking Vocabulary',
] as const;

export type VocabCategory = (typeof VOCAB_CATEGORIES)[number];

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  category: VocabCategory;
  uzbek: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  cefr: CEFRLevel;
}

export const VOCABULARY_BANK: VocabWord[] = [
  // Academic Vocabulary
  {
    id: 'v-ac-1',
    word: 'Empirical',
    phonetic: '/ɪmˈpɪr.ɪ.kəl/',
    category: 'Academic Vocabulary',
    uzbek: 'Tajribaga asoslangan, empirik',
    definition: 'Based on verifiable observation or experiment rather than pure theory.',
    example: 'The commission demanded empirical evidence before revising national safety standards.',
    synonyms: ['observational', 'experimental', 'verifiable'],
    antonyms: ['theoretical', 'speculative'],
    cefr: 'C1',
  },
  {
    id: 'v-ac-2',
    word: 'Corroborate',
    phonetic: '/kəˈrɒb.ə.reɪt/',
    category: 'Academic Vocabulary',
    uzbek: 'Tasdiqlamoq, dalillamoq',
    definition: 'To confirm or give support to a statement, theory, or finding.',
    example: 'Independent ice-core samples corroborate the satellite temperature record.',
    synonyms: ['confirm', 'substantiate', 'validate'],
    antonyms: ['contradict', 'refute'],
    cefr: 'C2',
  },
  {
    id: 'v-ac-3',
    word: 'Disparity',
    phonetic: '/dɪˈspær.ə.ti/',
    category: 'Academic Vocabulary',
    uzbek: 'Tafovut, nomutanosiblik',
    definition: 'A significant and often unfair difference between two groups or measurements.',
    example: 'There remains a stark disparity in broadband access between urban and rural schools.',
    synonyms: ['inequality', 'imbalance', 'gap'],
    antonyms: ['parity', 'equality'],
    cefr: 'C1',
  },
  {
    id: 'v-ac-4',
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    category: 'Academic Vocabulary',
    uzbek: 'Hamma joyda uchraydigan',
    definition: 'Present, appearing, or found everywhere.',
    example: 'Contactless payment terminals have become ubiquitous across city transit networks.',
    synonyms: ['omnipresent', 'pervasive', 'widespread'],
    antonyms: ['scarce', 'rare'],
    cefr: 'C1',
  },
  // Environment
  {
    id: 'v-env-1',
    word: 'Mitigate',
    phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
    category: 'Environment',
    uzbek: 'Yumshatmoq, kamaytirmoq',
    definition: 'To make something harmful, unpleasant, or severe less intense.',
    example: 'Restoring coastal wetlands can significantly mitigate seasonal storm flooding.',
    synonyms: ['alleviate', 'lessen', 'curb'],
    antonyms: ['exacerbate', 'intensify'],
    cefr: 'C1',
  },
  {
    id: 'v-env-2',
    word: 'Depletion',
    phonetic: '/dɪˈpliː.ʃən/',
    category: 'Environment',
    uzbek: 'Tugab borish, kamayish',
    definition: 'The gradual reduction in the quantity or supply of a natural resource.',
    example: 'Excessive groundwater extraction has accelerated aquifer depletion in arid basins.',
    synonyms: ['exhaustion', 'drain', 'erosion'],
    antonyms: ['replenishment', 'restoration'],
    cefr: 'C1',
  },
  {
    id: 'v-env-3',
    word: 'Biodiversity',
    phonetic: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/',
    category: 'Environment',
    uzbek: 'Biologik xilma-xillik',
    definition: 'The variety of plant and animal life in a particular habitat or ecosystem.',
    example: 'Wildflower corridors help sustain insect biodiversity inside dense metropolitan areas.',
    synonyms: ['ecological variety', 'species richness'],
    antonyms: ['monoculture', 'homogeneity'],
    cefr: 'B2',
  },
  {
    id: 'v-env-4',
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    category: 'Environment',
    uzbek: 'Bardoshli, tiklanuvchan',
    definition: 'Able to withstand or recover quickly from difficult conditions or shocks.',
    example: 'Drought-resilient grain varieties are essential for stable regional harvests.',
    synonyms: ['adaptable', 'hardy', 'robust'],
    antonyms: ['fragile', 'vulnerable'],
    cefr: 'B2',
  },
  // Education
  {
    id: 'v-edu-1',
    word: 'Pedagogy',
    phonetic: '/ˈped.ə.ɡɒdʒ.i/',
    category: 'Education',
    uzbek: 'Pedagogika, o‘qitish uslubiyati',
    definition: 'The method and practice of teaching, especially as an academic subject.',
    example: 'Inquiry-based pedagogy encourages learners to evaluate evidence rather than memorize facts.',
    synonyms: ['instruction', 'teaching methodology', 'didactics'],
    antonyms: ['neglect'],
    cefr: 'C2',
  },
  {
    id: 'v-edu-2',
    word: 'Curriculum',
    phonetic: '/kəˈrɪk.jə.ləm/',
    category: 'Education',
    uzbek: 'O‘quv dasturi',
    definition: 'The subjects and learning content comprising a course of study in a school or college.',
    example: 'Many educators advocate embedding financial literacy into the secondary curriculum.',
    synonyms: ['syllabus', 'coursework', 'program'],
    antonyms: ['extracurricular'],
    cefr: 'B2',
  },
  {
    id: 'v-edu-3',
    word: 'Proficiency',
    phonetic: '/prəˈfɪʃ.ən.si/',
    category: 'Education',
    uzbek: 'Malaka, yuksak mahorat',
    definition: 'A high degree of competence or skill in a language or discipline.',
    example: 'Consistent reading and speaking practice builds authentic academic proficiency.',
    synonyms: ['mastery', 'competence', 'fluency'],
    antonyms: ['incompetence', 'ineptitude'],
    cefr: 'B2',
  },
  {
    id: 'v-edu-4',
    word: 'Vocational',
    phonetic: '/vəʊˈkeɪ.ʃən.əl/',
    category: 'Education',
    uzbek: 'Kasb-hunarga oid',
    definition: 'Relating to practical skills and training required for a specific trade or occupation.',
    example: 'Germany’s dual vocational system pairs classroom theory with paid apprenticeships.',
    synonyms: ['occupational', 'technical', 'career-oriented'],
    antonyms: ['purely academic'],
    cefr: 'C1',
  },
  // Technology
  {
    id: 'v-tech-1',
    word: 'Obsolete',
    phonetic: '/ˌɒb.səlˈiːt/',
    category: 'Technology',
    uzbek: 'Eskirgan, iste’moldan chiqqan',
    definition: 'No longer produced or used because something newer has replaced it.',
    example: 'Rapid software cycles can render specialized hardware obsolete within five years.',
    synonyms: ['outdated', 'antiquated', 'archaic'],
    antonyms: ['cutting-edge', 'modern'],
    cefr: 'C1',
  },
  {
    id: 'v-tech-2',
    word: 'Automation',
    phonetic: '/ˌɔː.təˈmeɪ.ʃən/',
    category: 'Technology',
    uzbek: 'Avtomatlashtirish',
    definition: 'The use of machines or software to perform tasks with minimal human intervention.',
    example: 'Warehouse automation has increased dispatch speed while changing entry-level job profiles.',
    synonyms: ['mechanization', 'computerization'],
    antonyms: ['manual labor'],
    cefr: 'B2',
  },
  {
    id: 'v-tech-3',
    word: 'Scalable',
    phonetic: '/ˈskeɪ.lə.bəl/',
    category: 'Technology',
    uzbek: 'Kengaytiriluvchan, masshtablanuvchi',
    definition: 'Capable of growing efficiently to handle increased workload or user demand.',
    example: 'Modular solar microgrids provide a scalable power solution for remote towns.',
    synonyms: ['expandable', 'adaptable', 'extensible'],
    antonyms: ['rigid', 'fixed'],
    cefr: 'C1',
  },
  {
    id: 'v-tech-4',
    word: 'Interoperable',
    phonetic: '/ˌɪn.təˈrɒp.ər.ə.bəl/',
    category: 'Technology',
    uzbek: 'O‘zaro moslashib ishlaydigan',
    definition: 'Able to exchange and make use of information smoothly across different systems.',
    example: 'Interoperable health records prevent patients from repeating diagnostic tests.',
    synonyms: ['compatible', 'integrated'],
    antonyms: ['incompatible', 'siloed'],
    cefr: 'C2',
  },
  // Health
  {
    id: 'v-hlth-1',
    word: 'Sedentary',
    phonetic: '/ˈsed.ən.tər.i/',
    category: 'Health',
    uzbek: 'Kamharakat, o‘troq',
    definition: 'Characterized by sitting for long periods with little physical exercise.',
    example: 'A sedentary office lifestyle is closely linked to cardiovascular strain.',
    synonyms: ['inactive', 'desk-bound', 'stationary'],
    antonyms: ['active', 'energetic'],
    cefr: 'C1',
  },
  {
    id: 'v-hlth-2',
    word: 'Preventative',
    phonetic: '/prɪˈven.tə.tɪv/',
    category: 'Health',
    uzbek: 'Oldini oluvchi, profilaktik',
    definition: 'Designed to keep undesirable conditions or illnesses from occurring.',
    example: 'Investing in preventative dental check-ups reduces emergency hospital admissions.',
    synonyms: ['proactive', 'protective', 'precautionary'],
    antonyms: ['curative', 'reactive'],
    cefr: 'B2',
  },
  {
    id: 'v-hlth-3',
    word: 'Longevity',
    phonetic: '/lɒnˈdʒev.ə.ti/',
    category: 'Health',
    uzbek: 'Uzoq umr ko‘rish',
    definition: 'Long duration of individual life or sustained endurance.',
    example: 'Clean water, balanced nutrition, and vaccinations have dramatically extended human longevity.',
    synonyms: ['long life', 'lifespan', 'durability'],
    antonyms: ['brevity', 'shortness'],
    cefr: 'C1',
  },
  {
    id: 'v-hlth-4',
    word: 'Alleviate',
    phonetic: '/əˈliː.vi.eɪt/',
    category: 'Health',
    uzbek: 'Yengillashtirmoq, kamaytirmoq',
    definition: 'To make pain, symptoms, or suffering less severe.',
    example: 'Regular stretching breaks can alleviate chronic neck tension.',
    synonyms: ['ease', 'relieve', 'soothe'],
    antonyms: ['aggravate', 'worsen'],
    cefr: 'C1',
  },
  // Business
  {
    id: 'v-bus-1',
    word: 'Lucrative',
    phonetic: '/ˈluː.krə.tɪv/',
    category: 'Business',
    uzbek: 'Serdaromad, foydali',
    definition: 'Producing a great deal of financial profit.',
    example: 'Green retrofitting has become a lucrative niche for regional construction firms.',
    synonyms: ['profitable', 'rewarding', 'remunerative'],
    antonyms: ['unprofitable', 'loss-making'],
    cefr: 'C1',
  },
  {
    id: 'v-bus-2',
    word: 'Viable',
    phonetic: '/ˈvaɪ.ə.bəl/',
    category: 'Business',
    uzbek: 'Yashovchan, amalga oshirish mumkin',
    definition: 'Capable of working successfully and sustaining itself practically.',
    example: 'Lower battery costs have made electric delivery vans economically viable.',
    synonyms: ['feasible', 'workable', 'practical'],
    antonyms: ['unviable', 'impractical'],
    cefr: 'C1',
  },
  {
    id: 'v-bus-3',
    word: 'Incentive',
    phonetic: '/ɪnˈsen.tɪv/',
    category: 'Business',
    uzbek: 'Rag‘bat, turtki',
    definition: 'A reward or motivation that encourages a particular action or behavior.',
    example: 'Tax incentives prompted factories to install heat-recovery turbines.',
    synonyms: ['motivation', 'stimulus', 'inducement'],
    antonyms: ['deterrent', 'disincentive'],
    cefr: 'B2',
  },
  {
    id: 'v-bus-4',
    word: 'Entrepreneurship',
    phonetic: '/ˌɒn.trə.prəˈnɜː.ʃɪp/',
    category: 'Business',
    uzbek: 'Tadbirkorlik',
    definition: 'The activity of setting up and scaling a business while taking calculated risks.',
    example: 'Micro-grants and mentorship hubs encourage youth entrepreneurship in emerging cities.',
    synonyms: ['enterprise', 'venture creation'],
    antonyms: ['stagnation'],
    cefr: 'B2',
  },
  // Society
  {
    id: 'v-soc-1',
    word: 'Cohesion',
    phonetic: '/kəʊˈhiː.ʒən/',
    category: 'Society',
    uzbek: 'Jipslik, birdamlik',
    definition: 'The action or fact of forming a united, harmonious whole.',
    example: 'Shared public parks and libraries foster social cohesion across generations.',
    synonyms: ['unity', 'solidarity', 'harmony'],
    antonyms: ['fragmentation', 'division'],
    cefr: 'C1',
  },
  {
    id: 'v-soc-2',
    word: 'Demographic',
    phonetic: '/ˌdem.əˈɡræf.ɪk/',
    category: 'Society',
    uzbek: 'Demografik, aholi tarkibiga oid',
    definition: 'Relating to the statistical structure of human populations (age, income, location).',
    example: 'An aging demographic places new demands on pension and healthcare systems.',
    synonyms: ['population-based', 'statistical'],
    antonyms: ['individual'],
    cefr: 'C1',
  },
  {
    id: 'v-soc-3',
    word: 'Affluent',
    phonetic: '/ˈæf.lu.ənt/',
    category: 'Society',
    uzbek: 'Boy, farovon',
    definition: 'Having an abundance of wealth, goods, or material resources.',
    example: 'Housing prices in affluent coastal neighborhoods have outpaced local wages.',
    synonyms: ['wealthy', 'prosperous', 'well-off'],
    antonyms: ['impoverished', 'destitute'],
    cefr: 'C1',
  },
  // Science
  {
    id: 'v-sci-1',
    word: 'Hypothesis',
    phonetic: '/haɪˈpɒθ.ə.sɪs/',
    category: 'Science',
    uzbek: 'Faraz, gipoteza',
    definition: 'A proposed explanation made on limited evidence as a starting point for investigation.',
    example: 'The team designed a double-blind trial to test their circadian hypothesis.',
    synonyms: ['proposition', 'premise', 'assumption'],
    antonyms: ['proof', 'certainty'],
    cefr: 'B2',
  },
  {
    id: 'v-sci-2',
    word: 'Catalyst',
    phonetic: '/ˈkæt.əl.ɪst/',
    category: 'Science',
    uzbek: 'Katalizator, tezlashtiruvchi omil',
    definition: 'A substance or event that speeds up a chemical reaction or major social change.',
    example: 'The new railway line acted as a catalyst for regional tourism and research.',
    synonyms: ['spark', 'trigger', 'accelerator'],
    antonyms: ['inhibitor', 'obstacle'],
    cefr: 'C1',
  },
  {
    id: 'v-sci-3',
    word: 'Anomaly',
    phonetic: '/əˈnɒm.ə.li/',
    category: 'Science',
    uzbek: 'G‘ayritabiiy holat, og‘ish',
    definition: 'Something that deviates from what is standard, normal, or expected.',
    example: 'Astronomers noticed a subtle orbital anomaly indicating an unseen planet.',
    synonyms: ['irregularity', 'outlier', 'aberration'],
    antonyms: ['norm', 'regularity'],
    cefr: 'C1',
  },
  // Culture
  {
    id: 'v-cul-1',
    word: 'Heritage',
    phonetic: '/ˈher.ɪ.tɪdʒ/',
    category: 'Culture',
    uzbek: 'Madaniy meros',
    definition: 'Valued traditions, architecture, and historical artifacts passed down through generations.',
    example: 'Adaptive reuse safeguards architectural heritage while meeting modern housing needs.',
    synonyms: ['legacy', 'tradition', 'patrimony'],
    antonyms: ['novelty'],
    cefr: 'B2',
  },
  {
    id: 'v-cul-2',
    word: 'Homogenization',
    phonetic: '/həˌmɒdʒ.ə.naɪˈzeɪ.ʃən/',
    category: 'Culture',
    uzbek: 'Bir xillashuv',
    definition: 'The process of making diverse cultural traits uniform or indistinguishable.',
    example: 'Critics warn that identical global retail chains cause cultural homogenization.',
    synonyms: ['standardization', 'uniformity'],
    antonyms: ['diversification', 'distinctiveness'],
    cefr: 'C2',
  },
  {
    id: 'v-cul-3',
    word: 'Indigenous',
    phonetic: '/ɪnˈdɪdʒ.ɪ.nəs/',
    category: 'Culture',
    uzbek: 'Mahalliy, tub aholiga oid',
    definition: 'Originating or occurring naturally in a particular place; native.',
    example: 'Indigenous fire-management practices have helped prevent destructive summer wildfires.',
    synonyms: ['native', 'local', 'autochthonous'],
    antonyms: ['foreign', 'imported'],
    cefr: 'C1',
  },
  // Government
  {
    id: 'v-gov-1',
    word: 'Subsidy',
    phonetic: '/ˈsʌb.sɪ.di/',
    category: 'Government',
    uzbek: 'Subsidiya, davlat yordami',
    definition: 'Financial support granted by a government to keep prices low or encourage an industry.',
    example: 'Targeted transit subsidies help low-income commuters reach city employment centers.',
    synonyms: ['grant', 'allowance', 'financial aid'],
    antonyms: ['tariff', 'levy'],
    cefr: 'C1',
  },
  {
    id: 'v-gov-2',
    word: 'Legislation',
    phonetic: '/ˌledʒ.ɪsˈleɪ.ʃən/',
    category: 'Government',
    uzbek: 'Qonunchilik, qonun hujjatlari',
    definition: 'Laws considered collectively, or the process of enacting laws.',
    example: 'Strict right-to-repair legislation requires manufacturers to supply spare parts.',
    synonyms: ['statutes', 'regulation', 'enactment'],
    antonyms: ['deregulation'],
    cefr: 'B2',
  },
  {
    id: 'v-gov-3',
    word: 'Accountability',
    phonetic: '/əˌkaʊn.təˈbɪl.ə.ti/',
    category: 'Government',
    uzbek: 'Hisobdorlik, javobgarlik',
    definition: 'The obligation of individuals or institutions to explain and justify their actions.',
    example: 'Open municipal budget dashboards strengthen public accountability.',
    synonyms: ['responsibility', 'transparency', 'answerability'],
    antonyms: ['impunity', 'evasion'],
    cefr: 'C1',
  },
  // IELTS Writing Vocabulary
  {
    id: 'v-wr-1',
    word: 'Exacerbate',
    phonetic: '/ɪɡˈzæs.ə.beɪt/',
    category: 'IELTS Writing Vocabulary',
    uzbek: 'Yana ham og‘irlashtirmoq',
    definition: 'To make an existing problem, bad situation, or negative feeling worse.',
    example: 'Unplanned suburban sprawl tends to exacerbate peak-hour traffic congestion.',
    synonyms: ['aggravate', 'worsen', 'compound'],
    antonyms: ['mitigate', 'ameliorate'],
    cefr: 'C1',
  },
  {
    id: 'v-wr-2',
    word: 'Trajectory',
    phonetic: '/trəˈdʒek.tər.i/',
    category: 'IELTS Writing Vocabulary',
    uzbek: 'Yo‘nalish, o‘sish chizig‘i',
    definition: 'The path or directional trend followed by a metric or process over time.',
    example: 'Solar adoption followed a steep upward trajectory between 2015 and 2025.',
    synonyms: ['trend', 'course', 'path'],
    antonyms: ['stagnation'],
    cefr: 'C1',
  },
  {
    id: 'v-wr-3',
    word: 'Paramount',
    phonetic: '/ˈpær.ə.maʊnt/',
    category: 'IELTS Writing Vocabulary',
    uzbek: 'Eng muhim, ustuvor',
    definition: 'More important than anything else; supreme.',
    example: 'Ensuring equitable internet access is of paramount importance in digital education.',
    synonyms: ['crucial', 'foremost', 'essential'],
    antonyms: ['trivial', 'secondary'],
    cefr: 'C1',
  },
  {
    id: 'v-wr-4',
    word: 'Conversely',
    phonetic: '/ˈkɒn.vɜːs.li/',
    category: 'IELTS Writing Vocabulary',
    uzbek: 'Aksincha',
    definition: 'Introducing a statement or trend that reverses or contrasts with the previous one.',
    example: 'Wind power surged to 36%; conversely, coal generation fell to historic lows.',
    synonyms: ['by contrast', 'on the other hand'],
    antonyms: ['similarly', 'likewise'],
    cefr: 'C1',
  },
  // IELTS Speaking Vocabulary
  {
    id: 'v-sp-1',
    word: 'Unwind',
    phonetic: '/ʌnˈwaɪnd/',
    category: 'IELTS Speaking Vocabulary',
    uzbek: 'Hordiq chiqarmoq, dam olmoq',
    definition: 'To relax after a period of intense work or tension.',
    example: 'After long study sessions, I like to unwind by walking in the botanical park.',
    synonyms: ['relax', 'decompress', 'chill out'],
    antonyms: ['stress out', 'tense up'],
    cefr: 'B2',
  },
  {
    id: 'v-sp-2',
    word: 'Double-edged sword',
    phonetic: '/ˌdʌb.əl.edʒd ˈsɔːd/',
    category: 'IELTS Speaking Vocabulary',
    uzbek: 'Ikki qirrali qilich (ham foydali, ham zararli)',
    definition: 'Something that has both favorable and unfavorable consequences.',
    example: 'Working remotely is a double-edged sword: you save commute time, yet it can feel isolating.',
    synonyms: ['mixed blessing', 'trade-off'],
    antonyms: ['pure advantage'],
    cefr: 'C1',
  },
  {
    id: 'v-sp-3',
    word: 'Strike a balance',
    phonetic: '/straɪk ə ˈbæl.əns/',
    category: 'IELTS Speaking Vocabulary',
    uzbek: 'Muvozanatni saqlamoq',
    definition: 'To find a fair and sensible middle ground between two opposing priorities.',
    example: 'Cities need to strike a balance between preserving old quarters and building affordable homes.',
    synonyms: ['compromise', 'harmonize'],
    antonyms: ['go to extremes'],
    cefr: 'B2',
  },
  {
    id: 'v-sp-4',
    word: 'Eye-opening',
    phonetic: '/ˈaɪˌəʊ.pən.ɪŋ/',
    category: 'IELTS Speaking Vocabulary',
    uzbek: 'Hayratlanarli, ko‘zni ochuvchi',
    definition: 'Unexpectedly enlightening and revealing new perspective.',
    example: 'Volunteering at the neighborhood repair cafe was a genuinely eye-opening experience.',
    synonyms: ['enlightening', 'revelatory', 'illuminating'],
    antonyms: ['predictable', 'mundane'],
    cefr: 'B2',
  },
];

export interface GrammarQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  bandImpact: string;
  explanationEn: string;
  explanationUz: string;
  examples: { sentence: string; note: string }[];
  commonMistakes: { wrong: string; right: string; reason: string }[];
  quiz: GrammarQuizQuestion[];
}

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 'g-tenses',
    title: 'All English Tenses for IELTS',
    bandImpact: 'Essential for Task 1 Trends & Speaking Narrative',
    explanationEn:
      'Match tense precisely to time markers: Past Simple for completed historical data (2010–2020), Present Perfect for trends continuing up to now, and Future Passive / "is projected to" for forecast charts.',
    explanationUz:
      'Zamonlarni vaqt ko‘rsatkichlariga aniq moslang: tugallangan o‘tmish ma’lumotlari uchun Past Simple, hozirgacha davom etayotgan o‘zgarishlar uchun Present Perfect, prognozlar uchun esa Future shakllarini ishlating.',
    examples: [
      { sentence: 'Solar output surged by 27% between 2010 and 2025.', note: 'Completed past range -> Past Simple' },
      { sentence: 'Urban cycling has doubled since the city installed protected lanes.', note: 'Past start continuing to present -> Present Perfect' },
      { sentence: 'By 2035, renewable sources will have overtaken fossil fuels.', note: 'Completion before a future milestone -> Future Perfect' },
    ],
    commonMistakes: [
      { wrong: 'Since 2015, the population increased rapidly.', right: 'Since 2015, the population has increased rapidly.', reason: '"Since + past year" connecting to now requires Present Perfect.' },
      { wrong: 'In 2010, wind energy has reached 11%.', right: 'In 2010, wind energy reached 11%.', reason: 'A finished past year ("In 2010") takes Past Simple.' },
    ],
    quiz: [
      {
        id: 'gt-1',
        question: 'Between 2005 and 2015, commuter rail usage ________ by 40%.',
        options: ['rose', 'has risen', 'is rising', 'rises'],
        correctAnswer: 'rose',
        explanation: 'A completed past time window (2005–2015) requires Past Simple.',
      },
      {
        id: 'gt-2',
        question: 'Remote work adoption ________ dramatically since 2020.',
        options: ['grew', 'has grown', 'will grow', 'grows'],
        correctAnswer: 'has grown',
        explanation: '"Since 2020" connects a past point to the present -> Present Perfect.',
      },
      {
        id: 'gt-3',
        question: 'By 2040, engineers ________ over 500 kilometers of new tramways.',
        options: ['completed', 'will have completed', 'have completed', 'are completing'],
        correctAnswer: 'will have completed',
        explanation: '"By + future year" takes Future Perfect.',
      },
    ],
  },
  {
    id: 'g-articles',
    title: 'Articles (a, an, the, zero article)',
    bandImpact: 'Eliminates Frequent Band 6->7 Accuracy Slips',
    explanationEn:
      'Use "a/an" for singular countable nouns mentioned for the first time, "the" for specific, unique, or previously introduced nouns (and superlatives), and zero article for plural or uncountable general concepts.',
    explanationUz:
      'Birinchi marta tilga olingan sanaladigan birlik otlar bilan "a/an", aniq yoki oldin aytilgan otlar va orttirma daraja bilan "the", umumiy ko‘plik va sanalmaydigan tushunchalar bilan esa artiklsiz shakl ishlatiladi.',
    examples: [
      { sentence: 'Education is the single strongest driver of social mobility.', note: 'Zero article for general abstract noun; "the" before superlative' },
      { sentence: 'The chart illustrates a steady decline in coal usage.', note: 'Specific chart -> "the"; singular countable trend -> "a"' },
    ],
    commonMistakes: [
      { wrong: 'The technology plays big role in society.', right: 'Technology plays a big role in society.', reason: 'General uncountable "technology" takes no article; singular "role" requires "a".' },
    ],
    quiz: [
      {
        id: 'ga-1',
        question: '________ public transportation reduces urban air pollution.',
        options: ['A', 'An', 'The', '(no article)'],
        correctAnswer: '(no article)',
        explanation: 'General uncountable concepts take zero article.',
      },
      {
        id: 'ga-2',
        question: 'Tokyo recorded ________ highest share of rail commuters.',
        options: ['a', 'an', 'the', '(no article)'],
        correctAnswer: 'the',
        explanation: 'Superlative adjectives ("highest") always require "the".',
      },
      {
        id: 'ga-3',
        question: 'The city built ________ innovative wetland park along the coast.',
        options: ['a', 'an', 'the', '(no article)'],
        correctAnswer: 'an',
        explanation: '"Innovative" starts with a vowel sound -> "an".',
      },
    ],
  },
  {
    id: 'g-prepositions',
    title: 'Prepositions in Data & Academic Prose',
    bandImpact: 'Critical for Task 1 Precision (by / to / at / of)',
    explanationEn:
      'Distinguish carefully between "increased by 15%" (size of change), "increased to 35%" (final level), "stood at 24%" (static level), and "an increase of 15%" (noun collocation).',
    explanationUz:
      'Raqamli ma’lumotlarda predloglarni farqlang: o‘zgarish miqdori uchun "by", yakuniy daraja uchun "to", statik ko‘rsatkich uchun "at", ot bilan esa "of" qo‘llaniladi.',
    examples: [
      { sentence: 'Wind generation rose from 11% to 36%, an increase of 25 percentage points.', note: 'Verb + from/to; noun + of' },
      { sentence: 'In 2010, hydroelectricity stood at 24%.', note: 'Static point -> stood at' },
    ],
    commonMistakes: [
      { wrong: 'Sales grew to 20% (when jumping from 50% to 70%).', right: 'Sales grew by 20% to reach 70%.', reason: 'Use "by" for the amount of change and "to" for the destination figure.' },
    ],
    quiz: [
      {
        id: 'gp-1',
        question: 'Solar output increased ________ 4% in 2010 to 31% in 2025.',
        options: ['at', 'from', 'by', 'of'],
        correctAnswer: 'from',
        explanation: 'Use "from X to Y" for a range of change.',
      },
      {
        id: 'gp-2',
        question: 'There was a sharp rise ________ 18% in bicycle commuting.',
        options: ['at', 'to', 'of', 'on'],
        correctAnswer: 'of',
        explanation: 'The noun phrase "a rise of + amount" takes "of".',
      },
      {
        id: 'gp-3',
        question: 'In 2024, car usage in Vienna stood ________ 31%.',
        options: ['at', 'in', 'by', 'from'],
        correctAnswer: 'at',
        explanation: 'Static figures use "stood at".',
      },
    ],
  },
  {
    id: 'g-modals',
    title: 'Modal Verbs & Academic Hedging',
    bandImpact: 'Band 7–9 Nuance in Task 2 & Speaking Part 3',
    explanationEn:
      'Avoid absolute generalizations ("always", "will definitely") in IELTS essays. Use hedging modals ("may", "might", "could", "can") and policy modals ("should", "ought to", "must") to express calibrated academic claims.',
    explanationUz:
      'IELTS insholarida keskin umumlashtirishlardan saqlaning. Ehtimollik va mulohazali fikr bildirish uchun "may", "might", "could" hamda takliflar uchun "should", "ought to" modal fe’llaridan foydalaning.',
    examples: [
      { sentence: 'Targeted subsidies could encourage more drivers to adopt public transit.', note: 'Measured, realistic claim' },
      { sentence: 'Governments ought to invest in preventative healthcare.', note: 'Formal recommendation' },
    ],
    commonMistakes: [
      { wrong: 'People must to recycle all plastic.', right: 'People must recycle all plastic.', reason: 'Modal verbs are followed directly by the bare infinitive (no "to").' },
    ],
    quiz: [
      {
        id: 'gm-1',
        question: 'Prolonged screen exposure before sleep ________ disrupt melatonin production.',
        options: ['may', 'must to', 'ought', 'have to'],
        correctAnswer: 'may',
        explanation: '"May" provides accurate academic hedging followed by bare infinitive.',
      },
      {
        id: 'gm-2',
        question: 'Municipalities ________ prioritize bus lanes before expanding highways.',
        options: ['should', 'should to', 'musting', 'can to'],
        correctAnswer: 'should',
        explanation: 'Modal verbs take the bare infinitive directly.',
      },
    ],
  },
  {
    id: 'g-passive',
    title: 'Passive Voice in Process Diagrams & Formal Reports',
    bandImpact: 'Mandatory for Academic Task 1 Processes & Maps',
    explanationEn:
      'Use Passive Voice (be + past participle) when the action or transformed object matters more than who performs it—especially in industrial processes, manufacturing steps, and urban map transformations.',
    explanationUz:
      'Jarayon diagrammalari va xarita o‘zgarishlarida ish-harakat bajaruvchisidan ko‘ra natija muhim bo‘lganda majhul nisbat (be + V3) qo‘llaniladi.',
    examples: [
      { sentence: 'Sorted bottles are washed and mechanically crushed into cullet.', note: 'Present Simple Passive for manufacturing' },
      { sentence: 'The coal yard was demolished and replaced with a solar marina.', note: 'Past Simple Passive for historical map change' },
    ],
    commonMistakes: [
      { wrong: 'The cullet is melt at 1,500°C.', right: 'The cullet is melted at 1,500°C.', reason: 'Passive voice requires the past participle ("melted"), not base form.' },
    ],
    quiz: [
      {
        id: 'gpa-1',
        question: 'Once collected, the glass bottles ________ by color.',
        options: ['sort', 'are sorted', 'have sorting', 'were sort'],
        correctAnswer: 'are sorted',
        explanation: 'Routine industrial processes use Present Simple Passive.',
      },
      {
        id: 'gpa-2',
        question: 'Between 2005 and 2025, the old freight road ________ by a tram corridor.',
        options: ['replaced', 'was replaced', 'is replacing', 'has replace'],
        correctAnswer: 'was replaced',
        explanation: 'Completed past change to an object -> Past Simple Passive.',
      },
    ],
  },
  {
    id: 'g-conditionals',
    title: 'Zero, First, Second & Third Conditionals',
    bandImpact: 'Boosts Grammatical Range in Writing Task 2 & Speaking',
    explanationEn:
      'Use First Conditional for likely policy outcomes ("If cities invest..., congestion will fall"), Second Conditional for hypothetical scenarios ("If fares were free, budgets would shrink"), and Third/Mixed Conditionals for past regrets or counterfactuals.',
    explanationUz:
      'Real siyosiy natijalar uchun First Conditional, faraziy vaziyatlar uchun Second Conditional, o‘tmishdagi amalga oshmagan shartlar uchun esa Third Conditional ishlatiladi.',
    examples: [
      { sentence: 'If municipalities expand tram networks, suburban emissions will decline.', note: '1st Conditional: realistic prediction' },
      { sentence: 'Were cities to abolish fares overnight, maintenance budgets would face severe strain.', note: 'Inverted 2nd Conditional (Band 8–9)' },
    ],
    commonMistakes: [
      { wrong: 'If governments will build more parks, citizens will be healthier.', right: 'If governments build more parks, citizens will be healthier.', reason: 'Do not use "will" inside the "if" condition clause.' },
    ],
    quiz: [
      {
        id: 'gc-1',
        question: 'If schools ________ reading choice, adolescent literacy will improve.',
        options: ['encourage', 'will encourage', 'encouraged', 'encouraging'],
        correctAnswer: 'encourage',
        explanation: 'First Conditional uses Present Simple in the "if" clause.',
      },
      {
        id: 'gc-2',
        question: 'If public transport ________ completely free, authorities would need alternative tax revenue.',
        options: ['is', 'were', 'will be', 'has been'],
        correctAnswer: 'were',
        explanation: 'Second Conditional pairs Past Subjunctive ("were") with "would + verb".',
      },
    ],
  },
  {
    id: 'g-relative',
    title: 'Defining & Non-Defining Relative Clauses',
    bandImpact: 'Builds Smooth Complex Sentences',
    explanationEn:
      'Combine choppy sentences cleanly using "which", "who", "whose", and "where". Non-defining clauses add extra context enclosed in commas and NEVER use "that".',
    explanationUz:
      'Qisqa gaplarni "which", "who", "whose", "where" orqali ravon qo‘shma gaplarga aylantiring. Vergul bilan ajratiladigan qo‘shimcha izohlovchi ergash gaplarda "that" ishlatilmaydi.',
    examples: [
      { sentence: 'Copenhagen, where 40% of commuters cycle, led the survey.', note: 'Non-defining clause with commas' },
      { sentence: 'Students who read daily develop stronger lexical intuition.', note: 'Defining clause without commas' },
    ],
    commonMistakes: [
      { wrong: 'Solar power, that rose to 31%, surpassed hydro.', right: 'Solar power, which rose to 31%, surpassed hydro.', reason: 'Use "which", never "that", after a comma in a non-defining clause.' },
    ],
    quiz: [
      {
        id: 'gr-1',
        question: 'Wind energy, ________ climbed to 36%, became the leading source.',
        options: ['that', 'which', 'who', 'where'],
        correctAnswer: 'which',
        explanation: 'Non-defining clauses referring to things must use "which".',
      },
      {
        id: 'gr-2',
        question: 'Graduates ________ portfolios show real teamwork stand out immediately.',
        options: ['who', 'which', 'whose', 'whom'],
        correctAnswer: 'whose',
        explanation: '"Whose" expresses possession ("graduates’ portfolios").',
      },
    ],
  },
  {
    id: 'g-reported',
    title: 'Reported Speech & Academic Citation Verbs',
    bandImpact: 'Key for Reading Paraphrasing & Task 2 Attribution',
    explanationEn:
      'Report arguments accurately using formal reporting verbs (contend, argue, observe, maintain) and appropriate tense backshifting when reporting past studies.',
    explanationUz:
      'Tadqiqot va fikrlarni "argue", "contend", "observe", "maintain" kabi akademik fe’llar yordamida o‘zlashtirma gap shaklida ifodalang.',
    examples: [
      { sentence: 'Critics contend that pilot studies rarely account for scaling costs.', note: 'Present reporting for ongoing debate' },
      { sentence: 'The researchers reported that the mesh had collected 14 liters overnight.', note: 'Backshifted past finding' },
    ],
    commonMistakes: [
      { wrong: 'The author said me that the policy failed.', right: 'The author stated that the policy had failed.', reason: '"Say/state" never takes a direct personal object without "to".' },
    ],
    quiz: [
      {
        id: 'grp-1',
        question: 'Reviewers ________ that clay subsoils slowed infiltration rates.',
        options: ['noted', 'said them', 'told that', 'spoke that'],
        correctAnswer: 'noted',
        explanation: '"Note + that-clause" is natural academic reporting syntax.',
      },
    ],
  },
  {
    id: 'g-complex',
    title: 'Complex & Compound-Complex Sentences',
    bandImpact: 'Required for Band 7+ Grammatical Range',
    explanationEn:
      'Balance clear simple sentences with subordination ("although", "whereas", "provided that", "despite + gerund") and participle clauses to show cause, concession, and contrast.',
    explanationUz:
      'Band 7+ uchun oddiy gaplarni "although", "whereas", "despite + V-ing" kabi bog‘lovchilar va sifatdosh iboralar bilan boyiting.',
    examples: [
      { sentence: 'Although remote work saves commute time, it can erode informal mentoring.', note: 'Concessive complex sentence' },
      { sentence: 'Having analyzed four cities, the study highlighted stark transit differences.', note: 'Perfect participle opening' },
    ],
    commonMistakes: [
      { wrong: 'Although it saves time, but it feels isolating.', right: 'Although it saves time, it can feel isolating.', reason: 'Never combine "Although" and "but" in the same sentence.' },
    ],
    quiz: [
      {
        id: 'gcmp-1',
        question: '________ facing high upfront costs, geothermal networks deliver decades of low-carbon heat.',
        options: ['Although', 'Despite', 'However', 'Whereas'],
        correctAnswer: 'Despite',
        explanation: '"Despite" is a preposition followed by a noun or -ing gerund ("facing").',
      },
      {
        id: 'gcmp-2',
        question: 'Wind output surged to 36%, ________ hydroelectric power edged down to 21%.',
        options: ['despite', 'whereas', 'because of', 'unless'],
        correctAnswer: 'whereas',
        explanation: '"Whereas" contrasts two clauses cleanly.',
      },
    ],
  },
  {
    id: 'g-sva',
    title: 'Subject-Verb Agreement with Complex Noun Phrases',
    bandImpact: 'Prevents Hidden Accuracy Penalties',
    explanationEn:
      'Always match the verb to the head noun of the subject, not a closer noun inside a prepositional phrase. Note: "The number of..." takes a singular verb; "A number of..." takes a plural verb.',
    explanationUz:
      'Fe’lni gap egasining asosiy otiga moslang. "The number of..." birlik fe’l, "A number of..." esa ko‘plik fe’l talab qiladi.',
    examples: [
      { sentence: 'The number of bicycle commuters has risen sharply.', note: 'Head noun "number" -> singular "has"' },
      { sentence: 'A number of European cities have pedestrianized their centers.', note: '"A number of" (= several) -> plural "have"' },
    ],
    commonMistakes: [
      { wrong: 'The proportion of solar and wind installations have doubled.', right: 'The proportion of solar and wind installations has doubled.', reason: 'The head subject is singular ("The proportion").' },
    ],
    quiz: [
      {
        id: 'gsva-1',
        question: 'The percentage of residents using public transit ________ increased since 2015.',
        options: ['have', 'has', 'are', 'were'],
        correctAnswer: 'has',
        explanation: 'Singular head noun "percentage" requires singular "has".',
      },
      {
        id: 'gsva-2',
        question: 'A number of recent trials ________ confirmed the durability of self-healing concrete.',
        options: ['has', 'have', 'is', 'was'],
        correctAnswer: 'have',
        explanation: '"A number of" means "many/several" and takes a plural verb.',
      },
    ],
  },
  {
    id: 'g-punctuation',
    title: 'Academic Punctuation (Commas, Semicolons & Colons)',
    bandImpact: 'Sharpens Coherence & Cohesion Band Scores',
    explanationEn:
      'Avoid comma splices (joining two full sentences with only a comma). Use a semicolon before conjunctive adverbs ("however", "consequently", "nevertheless") and a comma immediately after them.',
    explanationUz:
      'Ikki mustaqil gapni faqat vergul bilan bog‘lamang. "However", "nevertheless", "consequently" oldidan nuqtali vergul (;), ulardan keyin esa vergul (,) qo‘ying.',
    examples: [
      { sentence: 'Fare-free transit lowers barriers; however, it does not guarantee faster buses.', note: 'Semicolon + however + comma' },
      { sentence: 'Three factors matter most: frequency, safety, and affordability.', note: 'Colon introducing a structured list' },
    ],
    commonMistakes: [
      { wrong: 'Fares were cut, however, ridership barely moved.', right: 'Fares were cut; however, ridership barely moved.', reason: 'Joining two independent clauses with "however" requires a semicolon or period.' },
    ],
    quiz: [
      {
        id: 'gpunc-1',
        question: 'Which sentence is punctuated accurately?',
        options: [
          'Solar costs fell, however, storage remained costly.',
          'Solar costs fell; however, storage remained costly.',
          'Solar costs fell; however storage remained costly.',
          'Solar costs fell however; storage remained costly.',
        ],
        correctAnswer: 'Solar costs fell; however, storage remained costly.',
        explanation: 'Independent clauses linked by "however" take "; however, ".',
      },
    ],
  },
];

export interface Band9Sample {
  id: string;
  skill: 'Writing Task 1' | 'Writing Task 2' | 'Speaking Part 1' | 'Speaking Part 2' | 'Speaking Part 3';
  title: string;
  estimatedBand: number;
  prompt: string;
  answer: string;
  vocabHighlights: string[];
  usefulExpressions: string[];
  grammarStructures: string[];
  whyStrong: string;
}

export const BAND9_SAMPLES: Band9Sample[] = [
  {
    id: 'b9-wt1',
    skill: 'Writing Task 1',
    title: 'Urban Solar, Wind & Hydro Electricity Share (2010–2025)',
    estimatedBand: 9.0,
    prompt: 'Summarize the changing shares of Solar, Wind, and Hydroelectric power from 2010 to 2025.',
    answer:
      'The line graph tracks shifts in the proportion of electricity generated by wind, solar, and hydroelectric power across a European region between 2010 and 2025. Overall, wind and solar underwent dramatic expansion, eclipsing hydroelectricity, which dipped gradually across the fifteen-year span.\n\nIn 2010, hydroelectricity led decisively at 24%, whereas wind stood at 11% and solar trailed at just 4%. Over the subsequent decade, rapid deployment propelled wind to 29%—overtaking hydro (22%)—while solar more than quintupled to match hydroelectricity’s share. By 2025, wind consolidated its lead at 36%, followed closely by solar at 31%, while hydro eased to 21%, leaving the three sources more evenly distributed than at any earlier point.',
    vocabHighlights: ['eclipsing hydroelectricity', 'subsequent decade', 'more than quintupled', 'consolidated its lead'],
    usefulExpressions: ['Overall, ... underwent dramatic expansion', 'followed closely by', 'than at any earlier point'],
    grammarStructures: ['Non-defining relative clause ("which dipped gradually")', 'Participle contrast ("leaving the three sources...")'],
    whyStrong:
      'Clear high-level overview with zero data clutter in paragraph 1, accurate quantitative synthesis without mechanical year-by-year listing, and precise academic verbs.',
  },
  {
    id: 'b9-wt2',
    skill: 'Writing Task 2',
    title: 'Free Urban Public Transit vs. Network Reliability Investment',
    estimatedBand: 9.0,
    prompt: 'Some argue public transport should be completely free in major cities. To what extent do you agree or disagree?',
    answer:
      'Abolishing fares on metropolitan buses and trains is often championed as an instant solution to urban gridlock and carbon emissions. Although universal free transit advances social equity, I largely disagree with eliminating fares outright, since reinvesting modest ticket revenue into network speed and reliability shifts far more commuters out of private cars.\n\nProponents rightly observe that zero-fare systems remove financial friction for low-wage workers and students, broadening access to jobs and civic life. Yet empirical evidence from car-dominated cities indicates that drivers rarely shun public transit over affordability; rather, they are deterred by infrequent schedules, indirect routes, and overcrowded carriages. Stripping transit authorities of farebox revenue without ring-fenced tax replacements risks deferred maintenance and slower service.\n\nA wiser policy pairs universal concessions for seniors, students, and lower-income households with affordable capped fares for regular earners, channeling those funds directly into dedicated bus corridors and frequent metro lines.',
    vocabHighlights: ['abolishing fares', 'financial friction', 'ring-fenced tax replacements', 'deferred maintenance'],
    usefulExpressions: ['Proponents rightly observe that', 'Yet empirical evidence indicates that', 'A wiser policy pairs...'],
    grammarStructures: ['Concessive subordination ("Although...")', 'Participle clause ("channeling those funds...")', 'Semi-colon contrast ("; rather,")'],
    whyStrong:
      'Takes an immediate, nuanced stance, directly addresses the opposing argument before refuting it with causal logic, and maintains effortless cohesion throughout.',
  },
  {
    id: 'b9-sp1',
    skill: 'Speaking Part 1',
    title: 'Neighborhood & Everyday Study Habits',
    estimatedBand: 8.5,
    prompt: 'Examiner: Do you prefer studying at home or in a public space like a library?',
    answer:
      'Honestly, I lean toward a quiet public library, especially when I’m preparing for timed mock exams. At home it’s far too tempting to wander into the kitchen or check my phone, whereas sitting alongside other focused readers creates a subtle sense of accountability. That said, if I’m practicing IELTS Speaking out loud, I obviously stay in my room so I don’t disturb anyone!',
    vocabHighlights: ['lean toward', 'subtle sense of accountability', 'far too tempting'],
    usefulExpressions: ['Honestly, I lean toward...', 'whereas sitting alongside...', 'That said, ...'],
    grammarStructures: ['Contrastive "whereas" clause', 'First Conditional ("if I’m practicing...")'],
    whyStrong:
      'Natural spoken discourse markers ("Honestly", "That said"), concise extension with a personal example, and effortless conversational rhythm.',
  },
  {
    id: 'b9-sp2',
    skill: 'Speaking Part 2',
    title: 'Cue Card: A Practical Skill Learned Outside School',
    estimatedBand: 9.0,
    prompt: 'Describe a useful skill you learned outside a formal classroom.',
    answer:
      'One genuinely practical skill I picked up outside school is basic bicycle maintenance and wheel truing. I started teaching myself about two summers ago after getting stranded ten kilometers from home with a snapped gear cable right before dusk.\n\nAt first, I was completely out of my depth—adjusting a rear derailleur felt like solving a Rubik’s cube blindfolded. However, I watched a series of methodical mechanic workshops online and volunteered on Saturday mornings at a neighborhood repair cafe. An elderly retired machinist there showed me how to listen for subtle chain rubbing and tighten spokes in quarter-turns.\n\nWhat makes the skill so rewarding today isn’t just the money it saves on repair bills; it has fundamentally shifted how I look at everyday objects. Instead of treating broken gear as disposable, I feel confident diagnosing mechanical problems calmly and helping friends keep their bikes roadworthy too.',
    vocabHighlights: ['out of my depth', 'methodical mechanic workshops', 'treat broken gear as disposable', 'roadworthy'],
    usefulExpressions: ['What makes the skill so rewarding today isn’t just...', 'At first, I was completely...'],
    grammarStructures: ['Cleft sentence ("What makes the skill so rewarding...")', 'Present Perfect Continuous / Past Simple narrative balance'],
    whyStrong:
      'Vivid opening anecdote, rich idiomatic phrasing used naturally without forcing clichés, and thoughtful reflection answering all four cue-card bullets seamlessly.',
  },
  {
    id: 'b9-sp3',
    skill: 'Speaking Part 3',
    title: 'AI & The Changing Role of Teachers',
    estimatedBand: 9.0,
    prompt: 'Examiner: Will artificial intelligence eventually replace human teachers in universities?',
    answer:
      'I doubt it will replace them wholesale, though it will almost certainly redefine what lecturers spend their time doing. On the one hand, AI excels at on-demand diagnostics—flagging recurring grammar errors, adapting vocabulary drills, or summarizing dense readings at a student’s exact level. On the other hand, education isn’t merely information transfer; great teachers read subtle hesitation in a seminar room, challenge lazy assumptions in real time, and mentor students through self-doubt. So in the long run, the strongest universities will probably pair AI tools for routine practice with smaller, more human-centered seminars.',
    vocabHighlights: ['replace them wholesale', 'on-demand diagnostics', 'information transfer', 'human-centered seminars'],
    usefulExpressions: ['I doubt it will..., though it will almost certainly...', 'On the one hand... On the other hand...', 'So in the long run...'],
    grammarStructures: ['Speculative hedging ("will almost certainly", "will probably")', 'Balanced multi-clause comparison'],
    whyStrong:
      'Abstract analytical framing directly matching Part 3 expectations, crisp signposting, and natural C2 collocations.',
  },
];

export interface ArticleItem {
  id: string;
  title: string;
  category: 'Reading' | 'Listening' | 'Writing' | 'Speaking' | 'Exam Strategy';
  readTime: string;
  publishedDate: string;
  imageUrl: string;
  summary: string;
  sections: { heading: string; content: string }[];
}

export const ARTICLES_BANK: ArticleItem[] = [
  {
    id: 'art-reading-tfng',
    title: 'How to Stop Confusing FALSE and NOT GIVEN in IELTS Reading',
    category: 'Reading',
    readTime: '5 min read',
    publishedDate: 'November 2026',
    imageUrl: '/src/assets/images/article_reading_strategy_1795414561980.jpg',
    summary:
      'A disciplined three-step verification method for separating direct contradictions from unmentioned claims under 60-minute exam pressure.',
    sections: [
      {
        heading: '1. Rewrite the Statement as a Direct Question',
        content:
          'Before scanning the passage, convert the prompt into a sharp Yes/No check and underline qualifying words like "only", "most", "always", or "first". Over 60% of FALSE answers hinge on an extreme qualifier rather than the main topic noun.',
      },
      {
        heading: '2. Apply the Contradiction Test',
        content:
          'An answer is FALSE only if you can point to a sentence in the text that actively proves the opposite. If the passage discusses the same subject, researcher, or year—yet stays silent on the specific comparison or cause in the question—the answer is NOT GIVEN.',
      },
      {
        heading: '3. Watch the 90-Second Budget Rule',
        content:
          'Never spend four minutes hunting for evidence of a NOT GIVEN item. Because IELTS Reading questions generally follow passage order, check the paragraph between the previous and next located answers; if no evidence sits there, mark NOT GIVEN and move forward.',
      },
    ],
  },
  {
    id: 'art-speaking-fluency',
    title: 'Building Natural Band 8 Fluency Without Memorized Scripts',
    category: 'Speaking',
    readTime: '6 min read',
    publishedDate: 'November 2026',
    imageUrl: '/src/assets/images/article_speaking_fluency_1795414561941.jpg',
    summary:
      'Why examiners immediately spot rehearsed templates—and how structured idea-expansion frameworks create effortless, confident speech.',
    sections: [
      {
        heading: '1. Answer, Reason, Example, Contrast (AREC)',
        content:
          'For Part 1 and Part 3, give a direct one-sentence answer, attach one clear reason, ground it in a brief personal or real-world example, and optionally add a concise contrast ("That said..."). This eliminates awkward silence without sounding robotic.',
      },
      {
        heading: '2. Use Your 60-Second Part 2 Prep Wisely',
        content:
          'Do not write full sentences on your cue-card scratchpad. Jot down 8–10 vivid trigger nouns and verbs arranged chronologically: Setup -> Turning Point -> Outcome -> Reflection. Glance down only when transitioning.',
      },
      {
        heading: '3. Embrace Natural Self-Correction',
        content:
          'Even Band 9 speakers occasionally pause to select a sharper word. A calm filler like "What I mean is..." or "Looking back..." maintains rhythm far better than freezing after a tiny grammar slip.',
      },
    ],
  },
  {
    id: 'art-writing-overview',
    title: 'Mastering the Task 1 Overview and Task 2 Thesis Paragraph',
    category: 'Writing',
    readTime: '5 min read',
    publishedDate: 'October 2026',
    imageUrl: '/src/assets/images/article_writing_structure_1795414564075.jpg',
    summary:
      'How the first six lines of your Academic Task 1 report and Task 2 essay anchor your Task Achievement band score.',
    sections: [
      {
        heading: '1. Task 1: Zero Numbers in the Overview',
        content:
          'Your overview paragraph should step back from the chart and summarize 2–3 overarching trends or stark contrasts in plain language. Save exact percentages and dates for Body Paragraphs 1 and 2.',
      },
      {
        heading: '2. Task 2: Answer Every Part of the Prompt Upfront',
        content:
          'If a prompt asks "To what extent do you agree or disagree?" or contains two questions, state your precise position in the introduction. Waiting until the conclusion to reveal your view caps Task Response.',
      },
      {
        heading: '3. Reserve Five Minutes for Micro-Proofreading',
        content:
          'Stopping at minute 35 lets you catch subject-verb agreement slips, missing articles, and repetitive nouns—frequently turning a borderline Band 6.5 script into a solid Band 7.5.',
      },
    ],
  },
];

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  category: 'Mock' | 'Streak' | 'Vocabulary' | 'Reading' | 'Writing' | 'Speaking';
}

export const ACHIEVEMENTS_LIST: AchievementDef[] = [
  {
    id: 'ach-first-mock',
    title: 'First Mock Completed',
    description: 'Finish your first full or individual IELTS mock examination.',
    xpReward: 250,
    category: 'Mock',
  },
  {
    id: 'ach-streak-7',
    title: '7-Day Study Streak',
    description: 'Maintain consistent daily IELTS practice for 7 consecutive days.',
    xpReward: 300,
    category: 'Streak',
  },
  {
    id: 'ach-vocab-100',
    title: 'Vocabulary Scholar',
    description: 'Master academic words through flashcards and spaced repetition quizzes.',
    xpReward: 200,
    category: 'Vocabulary',
  },
  {
    id: 'ach-reading-10',
    title: 'Reading Specialist',
    description: 'Complete timed Academic or General Training Reading tests with Band 6.5+.',
    xpReward: 350,
    category: 'Reading',
  },
  {
    id: 'ach-writing-improve',
    title: 'Writing Improvement',
    description: 'Submit an essay to the Writing Studio or AI Writing Evaluator.',
    xpReward: 200,
    category: 'Writing',
  },
  {
    id: 'ach-speaking-champ',
    title: 'Speaking Practice Champion',
    description: 'Record and evaluate IELTS Speaking Part 1, 2, or 3 responses.',
    xpReward: 250,
    category: 'Speaking',
  },
];

export const SEEDED_LEADERBOARD: LeaderboardEntry[] = [
  { userId: 'seed-1', displayName: 'Madina Tursunova', xp: 4820, weeklyXp: 740, monthlyXp: 2410, streak: 21, bestBand: 8.5, mocksCompleted: 9 },
  { userId: 'seed-2', displayName: 'Jasur Karimov', xp: 4390, weeklyXp: 680, monthlyXp: 2190, streak: 16, bestBand: 8.0, mocksCompleted: 7 },
  { userId: 'seed-3', displayName: 'Sevara Nurmatova', xp: 3910, weeklyXp: 620, monthlyXp: 1940, streak: 14, bestBand: 7.5, mocksCompleted: 6 },
  { userId: 'seed-4', displayName: 'Bekzod Rakhimov', xp: 3450, weeklyXp: 510, monthlyXp: 1680, streak: 11, bestBand: 7.5, mocksCompleted: 5 },
  { userId: 'seed-5', displayName: 'Nilufar Azimova', xp: 2980, weeklyXp: 460, monthlyXp: 1420, streak: 9, bestBand: 7.0, mocksCompleted: 4 },
  { userId: 'seed-6', displayName: 'Otabek Sultonov', xp: 2640, weeklyXp: 390, monthlyXp: 1210, streak: 7, bestBand: 7.0, mocksCompleted: 3 },
];
