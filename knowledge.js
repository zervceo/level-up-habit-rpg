/* =========================================================================
   knowledge.js — short, accurate "Learn" cards for every interactive hotspot
   in the 3D sectors. Keyed by the Blender hotspot name (HS_*). Each card is
   { t: title, b: body }. Kept deliberately small and conservative: well
   established facts and rules of thumb only, no statistics that need a source.
   ========================================================================= */
export const KNOWLEDGE = {
  /* ---------------- ENTITY — The Vitruvian Study ---------------- */
  HS_vitruvian: [
    { t: "Leonardo's Vitruvian Man (c. 1490)", b: "A drawing of the human proportions described by the Roman architect Vitruvius: a man with arms outstretched fits a square, and with limbs spread fits a circle centred on the navel." },
    { t: "Why a circle and a square?", b: "Often read as the Renaissance ideal of harmony between the human body and the order of the cosmos: the square for the material world, the circle for the ideal." },
    { t: "A handy proportion", b: "Your arm span is roughly equal to your height. It is the proportion the drawing is built on, and you can check it with a tape measure." },
    { t: "Your four sectors", b: "Entity (body), Entrepreneur (work), Education (mind) and Elixir (craft). Like the figure, the goal is balance: a strong score in one area is built on the others." }
  ],
  HS_deed_sprint_training: [
    { t: "Speed = stride length × stride frequency", b: "Faster sprinting comes from pushing harder into the ground (longer, more powerful strides) and turning over quickly. Drills train both." },
    { t: "Recover fully between max efforts", b: "Sprint reps only train speed if each is near-maximal, so rest several minutes between them. Tired reps train fatigue, not speed." },
    { t: "Warm up dynamically", b: "Leg swings, skips and build-up runs before sprinting prepare the muscles and tendons and lower injury risk more than static stretching alone." }
  ],
  HS_deed_strength_training: [
    { t: "Progressive overload", b: "Strength comes from asking a little more over time: an extra rep, a little more weight, better control. Keep a log so you can see it." },
    { t: "Technique before load", b: "Add weight only when the movement is clean. Good form builds the strength you want and protects joints." },
    { t: "Growth happens at rest", b: "Muscle adapts during recovery: sleep, enough protein and rest days matter as much as the session itself." }
  ],
  HS_deed_surf_session: [
    { t: "Read the wave before paddling out", b: "Watch a few sets from the beach. Note where waves peel, where the channel is, and how long the gaps between sets last." },
    { t: "Rip currents", b: "If caught in one, don't fight it straight back to shore. Float, then swim or paddle parallel to the beach until you're out of the pull." },
    { t: "Right of way", b: "The surfer closest to the peak (where the wave first breaks) has priority. Don't drop in, and always paddle back out around the break, not through it." }
  ],
  HS_deed_reading: [
    { t: "Recall beats rereading", b: "After a chapter, close the book and write what you remember. Pulling it from memory fixes it far better than re-reading the same page." },
    { t: "Read with a question", b: "Decide what you want from the book first. Questions turn passive reading into searching for answers." },
    { t: "Small and daily", b: "Fifteen steady minutes a day adds up to many books a year. The streak matters more than the length of any one session." }
  ],
  HS_deed_journaling: [
    { t: "Write what happened, what you learned, what's next", b: "Three short prompts turn a diary into a decision tool, and you can answer them in five minutes." },
    { t: "Expressive writing", b: "Writing honestly about stressful experiences, studied since the 1980s, is linked to better processing of them. Be honest, not polished." },
    { t: "Gratitude list", b: "Noting three specific good things a day trains attention toward what's working." }
  ],
  HS_sprint: [
    { t: "100 m world record", b: "9.58 seconds, set by Usain Bolt in Berlin in 2009. The 200 m record is 19.19 s, also his." },
    { t: "False starts", b: "In elite sprinting, a reaction time under 0.100 seconds after the gun counts as a false start, because it's faster than a person can react." },
    { t: "Four phases of a sprint", b: "Reaction, drive out of the blocks, acceleration (roughly the first 30 to 60 m), then holding top speed. Most races are won by the best acceleration and the smallest slowdown at the end." },
    { t: "Make the target specific", b: "A goal time, an event and a date turn a wish into a plan. Log every attempt, so you see the trend instead of any single run." }
  ],
  HS_weekly: [
    { t: "If-then plans", b: "Writing \"If it's 7 am Monday, then I'll do X\" (an implementation intention) makes follow-through noticeably more likely than just intending to." },
    { t: "No penalty for skipping", b: "Weekly vows are bonus points and carry no penalty by design. The streak is a mirror, not a threat." },
    { t: "Review on a fixed day", b: "Pick one weekday to look back, set next week's vows and decide what to drop. A fixed ritual is easier to keep than a fixed mood." }
  ],

  /* ---------------- ENTREPRENEUR — the Surf Shack ---------------- */
  HS_shack: [
    { t: "Do the riskiest thing first", b: "List what must be true for the business to work, and test the shakiest assumption with the smallest experiment, before building more." },
    { t: "Eisenhower matrix", b: "Sort tasks into urgent/important. Do important-and-urgent now, schedule important-not-urgent (this is where growth lives), delegate or drop the rest." },
    { t: "Talk to customers", b: "A handful of real conversations with people who have the problem beats weeks of guessing. Ask about their past behaviour, not whether they'd buy." }
  ],
  HS_post_ig: [
    { t: "Consistency beats virality", b: "A steady posting rhythm builds an audience and teaches you what works. Batch a week of content in one sitting to protect the habit." },
    { t: "One idea per post", b: "Each post should carry a single clear point, with a hook in the first line or two seconds." },
    { t: "Make a call to action", b: "Say what you want viewers to do next: follow, reply, click, buy. Without it, attention goes nowhere." }
  ],
  HS_post_tiktok: [
    { t: "Hook in the first seconds", b: "Open with the payoff, a question or a surprising visual. Viewers decide almost immediately whether to keep watching." },
    { t: "Reuse, don't reinvent", b: "Turn one idea into several formats (a short clip, a carousel, a caption). Repurposing is how a daily habit stays sustainable." },
    { t: "Watch your retention", b: "Where viewers drop off tells you what to cut. Improve the first three seconds before anything else." }
  ],
  HS_goal: [
    { t: "OKRs in one line", b: "One Objective (where to go) plus two or three measurable Key Results (how you'll know you got there). If a goal can't be measured, it can't be reviewed." },
    { t: "Lead and lag measures", b: "Revenue is a lagging result. Track the leading actions you control, such as outreach sent, offers made and posts published." },
    { t: "Keep the week small", b: "One business goal per week is enough. A finished small goal builds more momentum than a big one dropped." }
  ],
  HS_journal: [
    { t: "A founder's log", b: "Write down decisions along with your reasoning at the time. Reviewing them later shows which judgement calls to trust and reduces hindsight bias." },
    { t: "Capture numbers, not just feelings", b: "Revenue, signups, conversations held and hours worked. A note with a number can be compared next month." },
    { t: "Write the next step", b: "End each entry with one concrete next action, so tomorrow starts without a warm-up." }
  ],
  HS_rack: [
    { t: "Rank is momentum", b: "Every board is earned by consistent points across all four sectors. Rank doesn't reward one big day; it rewards showing up." },
    { t: "Surfboard sizes", b: "More volume (a longboard) is stable and easy to catch waves with. Less volume (a shortboard) is faster to turn and harder to ride, so skill, not just gear, unlocks the next board." }
  ],
  HS_pipeline: [
    { t: "Pipeline stages", b: "Leads move from new, to contacted, to a booked call, to a won client (or lost). Moving every lead forward, or closing it out, keeps the pipeline honest. Stale leads hide how healthy it really is." },
    { t: "Follow up", b: "Many replies and deals come after more than one touch. A short, polite follow-up a few days later is normal, and it's where many sales are won." },
    { t: "Conversion rate", b: "Won ÷ contacted is your conversion rate. Track it: raising either the rate or the number of contacts raises revenue." },
    { t: "Qualify early", b: "Check quickly whether the person has the problem, the budget and the authority to buy. Time spent on poor fits is the most common leak." },
    { t: "Always ask for the next step", b: "End each conversation with a specific next step and date: a call, a trial, a decision. Open endings turn into silence." },
    { t: "Activity vs outcome", b: "Outreach is a leading measure you control; wins are a lagging result. That's why touches pay a little every day and wins pay a bonus." }
  ],
  HS_revenue: [
    { t: "Revenue − costs = profit", b: "Revenue is what comes in, profit is what's left after costs. A business can have rising revenue and still lose money, so track both." },
    { t: "Profit isn't cash", b: "You can be profitable and still run short of cash (customers pay late, stock is paid up front). Watch the bank balance, not just the P&L." },
    { t: "MRR and gross margin", b: "MRR is monthly recurring revenue. Gross margin = (revenue − cost of goods sold) ÷ revenue, and it shows how much each sale really keeps." },
    { t: "Price on value, not cost", b: "Customers pay for the outcome you create, not your hours. Pricing only by cost is the quickest way to undercharge." },
    { t: "LTV and CAC", b: "Customer lifetime value (LTV) should comfortably exceed the cost to acquire a customer (CAC). A common rule of thumb is at least three to one." }
  ],

  /* ---------------- EDUCATION — Wall Street ---------------- */
  HS_topic_accounting: [
    { t: "The accounting equation", b: "Assets = Liabilities + Equity. Every transaction keeps this balanced; it's the foundation of the whole system." },
    { t: "Double-entry bookkeeping", b: "Every transaction is recorded twice, as a debit and an equal credit, so errors show up as an imbalance." },
    { t: "Accrual vs cash", b: "Accrual accounting records revenue when it's earned and expenses when incurred, not when money moves. It gives a truer picture of performance." }
  ],
  HS_topic_statements: [
    { t: "The three statements", b: "The income statement (performance over a period), the balance sheet (position at a moment) and the cash flow statement (where the cash went). They link together." },
    { t: "How they connect", b: "Net income flows into retained earnings on the balance sheet, and the cash flow statement explains the change in the cash balance." },
    { t: "Two ratios to know", b: "Current ratio = current assets ÷ current liabilities (short-term safety). Return on equity = net income ÷ shareholders' equity (how well equity is used)." }
  ],
  HS_topic_corp_finance: [
    { t: "Time value of money", b: "A dollar today is worth more than a dollar later. Present value PV = FV ÷ (1 + r)^n, where r is the rate and n the number of periods." },
    { t: "NPV rule", b: "Accept projects whose net present value, the discounted future cash flows minus the cost, is positive. They create value above the required return." },
    { t: "WACC", b: "The weighted average cost of capital blends the cost of debt and equity by their weights. It's the usual discount rate for a company's cash flows." }
  ],
  HS_topic_investing: [
    { t: "Rule of 72", b: "Divide 72 by the annual return (in %) to estimate years to double your money. At 8% a year, about 9 years." },
    { t: "Diversify", b: "Spreading money across many assets reduces the damage when any one fails. It's the closest thing to a free lunch in investing." },
    { t: "Costs compound too", b: "Fees reduce returns every year. Low-cost index funds have historically beaten most actively managed funds over long periods." },
    { t: "P/E ratio", b: "Price ÷ earnings per share. A high P/E means investors expect growth; compare it with similar companies, not in isolation." }
  ],
  HS_topic_valuation: [
    { t: "Discounted cash flow", b: "Value = the sum of future free cash flows, each discounted back to today: Σ CFₜ ÷ (1 + r)ᵗ. The result is only as good as the assumptions." },
    { t: "Comparable multiples", b: "Value a company by comparing it with peers, for example EV ÷ EBITDA or P/E. Quick, but it assumes the market prices peers correctly." },
    { t: "Enterprise value", b: "EV = market capitalisation + debt − cash. It's the price of the whole business, independent of how it's financed." }
  ],
  HS_exchange: [
    { t: "Work backwards from the deadline", b: "Break an assignment into steps, put a date on each, and start the first one today. Large tasks only feel overwhelming when they're a single block." },
    { t: "Spaced repetition", b: "Reviewing material at growing intervals (a day, a few days, a week) beats cramming for long-term memory." },
    { t: "Focus blocks", b: "25 minutes of focus with a 5-minute break (the Pomodoro method) is an easy way to start a session you're avoiding." }
  ],
  HS_bull: [
    { t: "The Charging Bull", b: "Sculpted by Arturo Di Modica and placed unannounced near the New York Stock Exchange in December 1989; it now stands in Bowling Green." },
    { t: "Bull and bear markets", b: "A bull market is a sustained rise in prices and a bear market a sustained fall, conventionally a drop of 20% or more from a recent high." },
    { t: "Why the bull is here", b: "It stands for optimism and forward drive, the same energy as your overall rank across all four sectors." }
  ],

  /* ---------------- ELIXIR — the Workshop ---------------- */
  HS_hobby_surfboard_making: [
    { t: "Anatomy of a surfboard", b: "Nose, tail, rails (the edges), rocker (the bottom's curve from nose to tail), concave (the dished bottom) and the stringer (the wooden strip down the middle)." },
    { t: "PU vs EPS foam", b: "Polyurethane (PU) blanks are glassed with polyester resin. Expanded polystyrene (EPS) blanks are lighter and need epoxy resin, since polyester dissolves them." },
    { t: "Fin setups", b: "A single fin is smooth and drawn-out, a thruster (three fins) is the all-round standard, and a quad (four) is fast and loose." },
    { t: "Rocker and volume", b: "More rocker helps in steep waves, less rocker is faster in small ones. More volume floats you more." }
  ],
  HS_hobby_coding: [
    { t: "Make it work, make it right, make it fast", b: "Kent Beck's order of priorities: get it working first, clean it up second, optimise only when you've measured a real problem." },
    { t: "Commit small and often", b: "Small version-control commits with clear messages make bugs easy to find and mistakes easy to undo." },
    { t: "Read more than you write", b: "Most of a developer's time is spent reading code, so write for the next reader: clear names, small functions." },
    { t: "Big-O in one line", b: "It describes how work grows with input size. Doubling the input roughly doubles an O(n) task, but quadruples an O(n²) one." }
  ],
  HS_hobby_electrical: [
    { t: "Ohm's law", b: "V = I × R. Voltage equals current times resistance. Know any two, and you can find the third." },
    { t: "Power", b: "P = V × I. Power in watts is voltage times current, which is why a resistor's size has to match the heat it will shed." },
    { t: "Size an LED resistor", b: "R = (supply voltage − LED voltage) ÷ desired current. For 5 V, a 2 V LED and 10 mA, that's 300 Ω, so use the next standard value up." },
    { t: "Decoupling capacitors", b: "Put a small capacitor close to each chip's power pins to smooth sudden current spikes and keep circuits stable." }
  ],
  HS_hobby_art: [
    { t: "Value before colour", b: "The pattern of light and dark carries a picture. If the values read well in grayscale, the colours will work." },
    { t: "Squint to see values", b: "Squinting blurs detail and shows the big light and dark shapes. It's the fastest way to check a drawing's structure." },
    { t: "The colour wheel", b: "Primaries (red, yellow, blue) mix to secondaries. Opposites on the wheel, the complements, make each other look more vivid." },
    { t: "Rule of thirds", b: "Divide the picture into a 3×3 grid and place the focus near an intersection instead of dead centre for a more dynamic composition." }
  ],
  HS_hub: [
    { t: "Deliberate practice", b: "Improvement comes from working at the edge of your ability on specific weaknesses, with quick feedback. Hours alone aren't enough." },
    { t: "Four crafts, one habit", b: "Shaping, coding, circuits and art all reward the same loop: make something small, check it, fix it, repeat." },
    { t: "Check off honestly", b: "Milestones are self-assessed because only you know when you can do it without looking it up. Honest checkmarks make the ladder worth climbing." }
  ]
};
