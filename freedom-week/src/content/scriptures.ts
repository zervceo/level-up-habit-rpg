/**
 * Scripture library — King James Version, public domain.
 *
 * To add a verse: append an object with a unique `id`, the verse `text`,
 * its `reference`, and one or more `buckets` describing when it should
 * surface:
 *   - "earlyMorning": shown before 7am — rising, first fruits, discipline
 *   - "longNight":    shown after 9pm — endurance, finishing, faithfulness
 *   - "urgency":      shown when overdue tasks exist
 *   - "general":      the default rotation
 * A verse can carry more than one bucket. Text must be quoted exactly and
 * only from a public-domain translation (KJV or WEB) — never a modern
 * copyrighted paraphrase.
 */

export interface ScriptureEntry {
  id: string;
  text: string;
  reference: string;
  buckets: Array<"earlyMorning" | "longNight" | "urgency" | "general">;
}

export const scriptures: ScriptureEntry[] = [
  {
    id: "s01",
    text: "How long wilt thou sleep, O sluggard? when wilt thou arise out of thy sleep? Yet a little sleep, a little slumber, a little folding of the hands to sleep: so shall thy poverty come as one that travelleth, and thy want as an armed man.",
    reference: "Proverbs 6:9–11",
    buckets: ["earlyMorning", "urgency"],
  },
  {
    id: "s02",
    text: "The soul of the sluggard desireth, and hath nothing: but the soul of the diligent shall be made fat.",
    reference: "Proverbs 13:4",
    buckets: ["general"],
  },
  {
    id: "s03",
    text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    reference: "Isaiah 40:31",
    buckets: ["longNight", "general"],
  },
  {
    id: "s04",
    text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
    reference: "Galatians 6:9",
    buckets: ["longNight", "urgency"],
  },
  {
    id: "s05",
    text: "I can do all things through Christ which strengtheneth me.",
    reference: "Philippians 4:13",
    buckets: ["general"],
  },
  {
    id: "s06",
    text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
    reference: "Joshua 1:9",
    buckets: ["general", "urgency"],
  },
  {
    id: "s07",
    text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
    reference: "2 Timothy 1:7",
    buckets: ["general"],
  },
  {
    id: "s08",
    text: "My voice shalt thou hear in the morning, O LORD; in the morning will I direct my prayer unto thee, and will look up.",
    reference: "Psalm 5:3",
    buckets: ["earlyMorning"],
  },
  {
    id: "s09",
    text: "Whatsoever thy hand findeth to do, do it with thy might; for there is no work, nor device, nor knowledge, nor wisdom, in the grave, whither thou goest.",
    reference: "Ecclesiastes 9:10",
    buckets: ["urgency", "general"],
  },
  {
    id: "s10",
    text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men.",
    reference: "Colossians 3:23",
    buckets: ["general"],
  },
  {
    id: "s11",
    text: "She riseth also while it is yet night, and giveth meat to her household, and a portion to her maidens.",
    reference: "Proverbs 31:15",
    buckets: ["earlyMorning"],
  },
  {
    id: "s12",
    text: "She girdeth her loins with strength, and strengtheneth her arms.",
    reference: "Proverbs 31:17",
    buckets: ["general"],
  },
  {
    id: "s13",
    text: "Love not sleep, lest thou come to poverty; open thine eyes, and thou shalt be satisfied with bread.",
    reference: "Proverbs 20:13",
    buckets: ["earlyMorning"],
  },
  {
    id: "s14",
    text: "He becometh poor that dealeth with a slack hand: but the hand of the diligent maketh rich.",
    reference: "Proverbs 10:4",
    buckets: ["general"],
  },
  {
    id: "s15",
    text: "The hand of the diligent shall bear rule: but the slothful shall be under tribute.",
    reference: "Proverbs 12:24",
    buckets: ["general"],
  },
  {
    id: "s16",
    text: "The thoughts of the diligent tend only to plenteousness; but of every one that is hasty only to want.",
    reference: "Proverbs 21:5",
    buckets: ["general"],
  },
  {
    id: "s17",
    text: "In all labour there is profit: but the talk of the lips tendeth only to penury.",
    reference: "Proverbs 14:23",
    buckets: ["general"],
  },
  {
    id: "s18",
    text: "And not only so, but we glory in tribulations also: knowing that tribulation worketh patience; and patience, experience; and experience, hope.",
    reference: "Romans 5:3–4",
    buckets: ["longNight"],
  },
  {
    id: "s19",
    text: "Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of life, which the Lord hath promised to them that love him.",
    reference: "James 1:12",
    buckets: ["longNight"],
  },
  {
    id: "s20",
    text: "Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us.",
    reference: "Hebrews 12:1",
    buckets: ["longNight", "general"],
  },
  {
    id: "s21",
    text: "Know ye not that they which run in a race run all, but one receiveth the prize? So run, that ye may obtain.",
    reference: "1 Corinthians 9:24",
    buckets: ["general", "urgency"],
  },
  {
    id: "s22",
    text: "For his anger endureth but a moment; in his favour is life: weeping may endure for a night, but joy cometh in the morning.",
    reference: "Psalm 30:5",
    buckets: ["longNight"],
  },
  {
    id: "s23",
    text: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
    reference: "Lamentations 3:22–23",
    buckets: ["earlyMorning"],
  },
  {
    id: "s24",
    text: "Commit thy works unto the LORD, and thy thoughts shall be established.",
    reference: "Proverbs 16:3",
    buckets: ["general"],
  },
  {
    id: "s25",
    text: "A man's heart deviseth his way: but the LORD directeth his steps.",
    reference: "Proverbs 16:9",
    buckets: ["general"],
  },
  {
    id: "s26",
    text: "So built we the wall; and all the wall was joined together unto the half thereof: for the people had a mind to work.",
    reference: "Nehemiah 4:6",
    buckets: ["general"],
  },
  {
    id: "s27",
    text: "Cause me to hear thy lovingkindness in the morning; for in thee do I trust: cause me to know the way wherein I should walk; for I lift up my soul unto thee.",
    reference: "Psalm 143:8",
    buckets: ["earlyMorning"],
  },
  {
    id: "s28",
    text: "Be thou diligent to know the state of thy flocks, and look well to thy herds.",
    reference: "Proverbs 27:23",
    buckets: ["general"],
  },
  {
    id: "s29",
    text: "Therefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord, forasmuch as ye know that your labour is not in vain in the Lord.",
    reference: "1 Corinthians 15:58",
    buckets: ["longNight", "general"],
  },
  {
    id: "s30",
    text: "Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.",
    reference: "Deuteronomy 31:6",
    buckets: ["urgency", "general"],
  },
  {
    id: "s31",
    text: "Wait on the LORD: be of good courage, and he shall strengthen thine heart: wait, I say, on the LORD.",
    reference: "Psalm 27:14",
    buckets: ["longNight"],
  },
  {
    id: "s32",
    text: "For the vision is yet for an appointed time, but at the end it shall speak, and not lie: though it tarry, wait for it; because it will surely come, it will not tarry.",
    reference: "Habakkuk 2:3",
    buckets: ["longNight"],
  },
  {
    id: "s33",
    text: "Seest thou a man diligent in his business? he shall stand before kings; he shall not stand before mean men.",
    reference: "Proverbs 22:29",
    buckets: ["general"],
  },
  {
    id: "s34",
    text: "Watch and pray, that ye enter not into temptation: the spirit indeed is willing, but the flesh is weak.",
    reference: "Matthew 26:41",
    buckets: ["longNight"],
  },
  {
    id: "s35",
    text: "O God, thou art my God; early will I seek thee: my soul thirsteth for thee, my flesh longeth for thee in a dry and thirsty land, where no water is.",
    reference: "Psalm 63:1",
    buckets: ["earlyMorning"],
  },
  {
    id: "s36",
    text: "And in the morning, rising up a great while before day, he went out, and departed into a solitary place, and there prayed.",
    reference: "Mark 1:35",
    buckets: ["earlyMorning"],
  },
  {
    id: "s37",
    text: "For the joy of the LORD is your strength.",
    reference: "Nehemiah 8:10",
    buckets: ["general", "longNight"],
  },
  {
    id: "s38",
    text: "And let the beauty of the LORD our God be upon us: and establish thou the work of our hands upon us; yea, the work of our hands establish thou it.",
    reference: "Psalm 90:17",
    buckets: ["general"],
  },
  {
    id: "s39",
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    reference: "Proverbs 3:5–6",
    buckets: ["general"],
  },
  {
    id: "s40",
    text: "Not by might, nor by power, but by my spirit, saith the LORD of hosts.",
    reference: "Zechariah 4:6",
    buckets: ["general", "urgency"],
  },
  {
    id: "s41",
    text: "Not slothful in business; fervent in spirit; serving the Lord.",
    reference: "Romans 12:11",
    buckets: ["general"],
  },
  {
    id: "s42",
    text: "But let every man prove his own work, and then shall he have rejoicing in himself alone, and not in another.",
    reference: "Galatians 6:4",
    buckets: ["general"],
  },
];
