/**
 * Quote library — short (under ~25 words), attributed lines from founders,
 * athletes, and statesmen. To add one: append an object with a unique `id`,
 * the `text`, the speaker in `attribution`, and one or more `buckets`
 * ("earlyMorning" | "longNight" | "urgency" | "general", same meaning as
 * in scriptures.ts). Keep additions brief and properly attributed — this
 * file should stay a collection of short, well-documented lines, not
 * substantial excerpts of anyone's larger work.
 */

export interface QuoteEntry {
  id: string;
  text: string;
  attribution: string;
  buckets: Array<"earlyMorning" | "longNight" | "urgency" | "general">;
}

export const quotes: QuoteEntry[] = [
  {
    id: "q01",
    text: "I hated every minute of training, but I said, don't quit. Suffer now and live the rest of your life as a champion.",
    attribution: "Muhammad Ali",
    buckets: ["longNight", "urgency"],
  },
  {
    id: "q02",
    text: "The successful warrior is the average man, with laser-like focus.",
    attribution: "Bruce Lee",
    buckets: ["general"],
  },
  {
    id: "q03",
    text: "It does not matter how slowly you go as long as you do not stop.",
    attribution: "Confucius",
    buckets: ["general", "longNight"],
  },
  {
    id: "q04",
    text: "I've failed over and over and over again in my life. And that is why I succeed.",
    attribution: "Michael Jordan",
    buckets: ["urgency", "general"],
  },
  {
    id: "q05",
    text: "The way to get started is to quit talking and begin doing.",
    attribution: "Walt Disney",
    buckets: ["earlyMorning", "general"],
  },
  {
    id: "q06",
    text: "Whether you think you can, or you think you can't – you're right.",
    attribution: "Henry Ford",
    buckets: ["general"],
  },
  {
    id: "q07",
    text: "Genius is one percent inspiration and ninety-nine percent perspiration.",
    attribution: "Thomas Edison",
    buckets: ["general"],
  },
  {
    id: "q08",
    text: "The best way to predict the future is to create it.",
    attribution: "Peter Drucker",
    buckets: ["general"],
  },
  {
    id: "q09",
    text: "You miss 100% of the shots you don't take.",
    attribution: "Wayne Gretzky",
    buckets: ["urgency"],
  },
  {
    id: "q10",
    text: "It's not whether you get knocked down, it's whether you get up.",
    attribution: "Vince Lombardi",
    buckets: ["longNight", "urgency"],
  },
  {
    id: "q11",
    text: "The only way to do great work is to love what you do.",
    attribution: "Steve Jobs",
    buckets: ["general"],
  },
  {
    id: "q12",
    text: "Believe you can and you're halfway there.",
    attribution: "Theodore Roosevelt",
    buckets: ["earlyMorning"],
  },
  {
    id: "q13",
    text: "A dream doesn't become reality through magic; it takes sweat, determination, and hard work.",
    attribution: "Colin Powell",
    buckets: ["general"],
  },
  {
    id: "q14",
    text: "Great things come from hard work and perseverance. No excuses.",
    attribution: "Kobe Bryant",
    buckets: ["earlyMorning", "general"],
  },
  {
    id: "q15",
    text: "Well done is better than well said.",
    attribution: "Benjamin Franklin",
    buckets: ["general"],
  },
  {
    id: "q16",
    text: "Early to bed and early to rise, makes a man healthy, wealthy, and wise.",
    attribution: "Benjamin Franklin",
    buckets: ["earlyMorning"],
  },
  {
    id: "q17",
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    attribution: "Aristotle",
    buckets: ["general"],
  },
  {
    id: "q18",
    text: "Nothing in the world is worth having or worth doing unless it means effort, pain, difficulty.",
    attribution: "Theodore Roosevelt",
    buckets: ["longNight"],
  },
  {
    id: "q19",
    text: "You don't have to be great to start, but you have to start to be great.",
    attribution: "Zig Ziglar",
    buckets: ["earlyMorning"],
  },
  {
    id: "q20",
    text: "Discipline is the bridge between goals and accomplishment.",
    attribution: "Jim Rohn",
    buckets: ["general"],
  },
  {
    id: "q21",
    text: "When something is important enough, you do it even if the odds are not in your favor.",
    attribution: "Elon Musk",
    buckets: ["general"],
  },
  {
    id: "q22",
    text: "I never dreamed about success. I worked for it.",
    attribution: "Estée Lauder",
    buckets: ["general"],
  },
  {
    id: "q23",
    text: "No man will make a great leader who wants to do it all himself.",
    attribution: "Andrew Carnegie",
    buckets: ["general"],
  },
  {
    id: "q24",
    text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.",
    attribution: "Colin Powell",
    buckets: ["general"],
  },
  {
    id: "q25",
    text: "Do not let what you cannot do interfere with what you can do.",
    attribution: "John Wooden",
    buckets: ["general"],
  },
  {
    id: "q26",
    text: "Failing to prepare is preparing to fail.",
    attribution: "John Wooden",
    buckets: ["earlyMorning"],
  },
  {
    id: "q27",
    text: "Strength does not come from winning. Your struggles develop your strengths.",
    attribution: "Arnold Schwarzenegger",
    buckets: ["longNight"],
  },
  {
    id: "q28",
    text: "Accept the challenges so that you can feel the exhilaration of victory.",
    attribution: "George S. Patton",
    buckets: ["urgency"],
  },
  {
    id: "q29",
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    attribution: "Winston Churchill",
    buckets: ["longNight"],
  },
  {
    id: "q30",
    text: "Never, never, never give up.",
    attribution: "Winston Churchill",
    buckets: ["longNight", "urgency"],
  },
  {
    id: "q31",
    text: "If there is no struggle, there is no progress.",
    attribution: "Frederick Douglass",
    buckets: ["general"],
  },
  {
    id: "q32",
    text: "You may not control all the events that happen to you, but you can decide not to be reduced by them.",
    attribution: "Maya Angelou",
    buckets: ["general"],
  },
  {
    id: "q33",
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    attribution: "Marcus Aurelius",
    buckets: ["longNight"],
  },
  {
    id: "q34",
    text: "Luck is what happens when preparation meets opportunity.",
    attribution: "Seneca",
    buckets: ["general"],
  },
  {
    id: "q35",
    text: "Excellence is to do a common thing in an uncommon way.",
    attribution: "Booker T. Washington",
    buckets: ["general"],
  },
  {
    id: "q36",
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    attribution: "Ralph Waldo Emerson",
    buckets: ["general"],
  },
  {
    id: "q37",
    text: "Opportunities multiply as they are seized.",
    attribution: "Sun Tzu",
    buckets: ["general"],
  },
  {
    id: "q38",
    text: "Whatever the mind can conceive and believe, it can achieve.",
    attribution: "Napoleon Hill",
    buckets: ["earlyMorning"],
  },
  {
    id: "q39",
    text: "Inaction breeds doubt and fear. Action breeds confidence and courage.",
    attribution: "Dale Carnegie",
    buckets: ["urgency"],
  },
  {
    id: "q40",
    text: "The most difficult thing is the decision to act, the rest is merely tenacity.",
    attribution: "Amelia Earhart",
    buckets: ["earlyMorning"],
  },
  {
    id: "q41",
    text: "Champions keep playing until they get it right.",
    attribution: "Billie Jean King",
    buckets: ["longNight"],
  },
  {
    id: "q42",
    text: "Champions aren't made in the gyms. Champions are made from something they have deep inside them – a desire, a dream, a vision.",
    attribution: "Muhammad Ali",
    buckets: ["general"],
  },
];
