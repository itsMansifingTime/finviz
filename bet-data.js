// Billions of USD unless noted. Calendar years; 2026 is guidance or run-rate as of Q2 2026 reports.
// Microsoft, Amazon, and Meta include finance leases. Oracle uses the fiscal year ending the
// following May (FY2027 for 2026, gross). xAI is SpaceX's AI spending after the February 2026 merger.

const BET = {
  spenders: [
    { key: "amazon", label: "Amazon", group: "cloud" },
    { key: "alphabet", label: "Alphabet", group: "cloud" },
    { key: "microsoft", label: "Microsoft", group: "cloud" },
    { key: "meta", label: "Meta", group: "platform" },
    { key: "oracle", label: "Oracle", group: "levered" },
    { key: "coreweave", label: "CoreWeave", group: "levered" },
    { key: "xai", label: "SpaceX / xAI", group: "levered" },
  ],
  capex: [
    { year: 2022, amazon: 63.6, alphabet: 31.5, microsoft: 28.5, meta: 31.4, oracle: 4.5, coreweave: 0.1, xai: 0 },
    { year: 2023, amazon: 52.7, alphabet: 32.3, microsoft: 41.3, meta: 28.1, oracle: 6.9, coreweave: 2.9, xai: 0 },
    { year: 2024, amazon: 83.9, alphabet: 52.5, microsoft: 75.6, meta: 39.2, oracle: 21.2, coreweave: 8.7, xai: 4 },
    { year: 2025, amazon: 134.7, alphabet: 91.4, microsoft: 118, meta: 72.2, oracle: 55.7, coreweave: 10.3, xai: 15 },
    { year: 2026, amazon: 220, alphabet: 200, microsoft: 175, meta: 137.5, oracle: 92.5, coreweave: 37, xai: 55, guidance: true },
  ],
  // US nominal GDP, trillions. 2025 and 2026 are estimates.
  gdp: { 2022: 26.0, 2023: 27.7, 2024: 29.2, 2025: 30.3, 2026: 31.6 },
  history: [
    { label: "Manhattan Project (1944)", pct: 0.4 },
    { label: "Apollo program (1965)", pct: 0.7 },
    { label: "Interstate highways (late 1950s)", pct: 1.0 },
    { label: "Telecom and fiber buildout (2000)", pct: 1.2 },
    { label: "Railroads (late 1800s, average)", pct: 2.2 },
  ],
  // Contracted and committed, latest filings (June–August 2026 quarter ends).
  commitments: [
    { label: "Cloud backlog owed to the builders", value: 2467, note: "Remaining performance obligations at Microsoft ($684B), Oracle ($664B), Alphabet ($519.5B), Amazon (about $496B), and CoreWeave ($103.7B)." },
    { label: "Data center leases signed, not yet started", value: 1154, note: "Undiscounted payments disclosed by Microsoft ($329B), Oracle ($288B), Meta ($279B, plus $68B signed in July), Amazon ($137B), Alphabet ($85B), and CoreWeave ($35.5B)." },
    { label: "OpenAI planned compute spending through 2030", value: 600, note: "OpenAI's own target to investors in February 2026, down from the $1.4 trillion of commitments it had cited earlier." },
    { label: "Anthropic infrastructure commitments, next decade", value: 518, note: "From Anthropic's IPO prospectus. About 80% is non-cancelable. At least $111B to Google, $110B to Amazon, $31B to Microsoft, and up to $84.5B to SpaceX." },
    { label: "Debt on the builders' balance sheets", value: 517, note: "Microsoft, Alphabet, Amazon, Meta, Oracle, and CoreWeave combined, up from $255B a year earlier." },
  ],
  // What AI sells today, annualized. These overlap: lab payments to clouds also show up in cloud AI revenue.
  aiRevenue: [
    { label: "OpenAI", value: 70, kind: "lab", note: "Annualized run rate nearing $70B in September 2026. Recognized revenue was $13.1B in 2025." },
    { label: "Anthropic", value: 65, kind: "lab", note: "Annualized run rate above $65B in mid-2026, reported gross. Recognized revenue was about $4.6B in 2025." },
    { label: "Microsoft AI business", value: 37, kind: "cloud", note: "Run rate disclosed in April 2026, up 123%. Includes some OpenAI usage." },
    { label: "AWS AI business", value: 25, kind: "cloud", note: "“More than $25 billion” run rate, Q2 2026. Includes some Anthropic and OpenAI usage." },
  ],
  // Q2 2026 or latest four quarters.
  companies: [
    {
      key: "microsoft",
      label: "Microsoft",
      wants: "Sell AI to businesses through Azure and Copilot, and keep a front-row seat at OpenAI, in which it owns about 27%.",
      payback: "Rents capacity to OpenAI and thousands of other customers, and sells AI features inside Office and GitHub.",
      facts: [
        "Spent 63% of operating cash on capex over the last four quarters, issued no debt, and still raised buybacks.",
        "Debt fell to $40B, but it has $329B of data center leases signed that have not started.",
        "Backlog is $684B. OpenAI was 45% of it in December, about 41% now if unchanged.",
        "Azure grew 43% in Q2 2026. AI business run rate was $37B in April, up 123%.",
      ],
      scores: { funding: 1, proof: 2, concentration: 4, fallback: 1 },
      verdict: "Lowest risk of the builders. It pays cash and can resell capacity. The real exposure is how much of its backlog depends on OpenAI.",
    },
    {
      key: "alphabet",
      label: "Alphabet",
      wants: "Protect Search with Gemini, win cloud customers, and sell its own TPU chips as an alternative to NVIDIA.",
      payback: "Higher-value Search and YouTube ads, Google Cloud rentals, and TPU sales to labs like Anthropic.",
      facts: [
        "Capex was 71% of operating cash over four quarters, but Q2 2026 free cash flow was −$5.9B.",
        "Debt rose from $25B to $100B in a year, including a 100-year sterling bond.",
        "Google Cloud grew 82% to $24.8B in Q2 2026, with a 36% operating margin. Backlog is $519.5B.",
        "Anthropic's commitment of at least $111B (a deal reported at up to $200B) is a large slice of that backlog.",
      ],
      scores: { funding: 2, proof: 2, concentration: 3, fallback: 1 },
      verdict: "Low to moderate. It owns its chips and has the strongest fallback, Search. Watch whether free cash flow stays negative into 2027.",
    },
    {
      key: "amazon",
      label: "Amazon",
      wants: "Make AWS the default place to build AI, and back Anthropic with money and Trainium chips.",
      payback: "AWS rentals to everyone, including OpenAI ($138B committed) and Anthropic ($100B+ expansion).",
      facts: [
        "Capex was 107% of operating cash. Free cash flow was −$7.6B over four quarters.",
        "Debt went from $56B to $132B in a year.",
        "AWS grew 37% in Q2 2026, its fastest in 18 quarters. AI run rate is above $25B.",
        "It funds a customer: up to $20B of financing for Anthropic, drawn as Amazon delivers capacity Anthropic pays for.",
      ],
      scores: { funding: 3, proof: 2, concentration: 3, fallback: 2 },
      verdict: "Moderate. AWS is diversified, but Amazon is now borrowing to build, and part of its demand is a lab it finances.",
    },
    {
      key: "meta",
      label: "Meta",
      wants: "Build “superintelligence” and use AI to make ads and feeds more profitable. It sells no cloud capacity.",
      payback: "Only through its own ad business. Every dollar has to come back as higher ad prices or more engagement.",
      facts: [
        "Capex was 69% of operating cash, but Q2 2026 free cash flow was only $0.8B. Operating margin fell from 43% to 31%.",
        "Debt went from $29B to $84B, plus a $27.3B off-balance-sheet bond for its Hyperion campus.",
        "It has $279B of leases signed but not started, plus $68B more signed in July.",
        "Ad revenue grew 28% in Q2 2026, with prices up 12%, so AI is paying off in ads so far.",
      ],
      scores: { funding: 3, proof: 3, concentration: 1, fallback: 4 },
      verdict: "Moderate to high on the spending itself. The ad business is strong, but there is no outside customer to absorb idle capacity if the superintelligence bet stalls.",
    },
    {
      key: "oracle",
      label: "Oracle",
      wants: "Turn from a database company into a top-tier AI cloud by building data centers for OpenAI and other labs.",
      payback: "Long contracts with a few very large AI customers.",
      facts: [
        "Capex was 161% of operating cash. It sold $24.9B of stock and carries $125B of debt.",
        "It has $288B of leases signed but not started, mostly 15–19 years long.",
        "Backlog is $664B, roughly half from OpenAI by S&P and Bank of America estimates. Only about 13% arrives within a year.",
        "$75B of its large AI contracts is prepaid or customer-supplied hardware, which reduces the cash it needs.",
      ],
      scores: { funding: 5, proof: 3, concentration: 5, fallback: 4 },
      verdict: "High. It is borrowing heavily against a backlog concentrated in one loss-making customer, with no large business of its own to fill the capacity.",
    },
    {
      key: "coreweave",
      label: "CoreWeave",
      wants: "Be the largest independent GPU cloud.",
      payback: "Take-or-pay contracts with OpenAI, Microsoft, Meta (up to $21B), and others, about 98% of revenue.",
      facts: [
        "Capex was nearly three times operating cash over four quarters.",
        "Debt tripled to $35B, much of it secured by GPUs.",
        "Backlog is $104B, 41% due within two years. 2026 capex guidance is $35–39B.",
      ],
      scores: { funding: 5, proof: 3, concentration: 5, fallback: 5 },
      verdict: "Very high. A pure, leveraged bet that its few big customers keep paying, and that GPUs hold their value longer than the loans against them.",
    },
    {
      key: "xai",
      label: "SpaceX / xAI",
      wants: "Train frontier Grok models, and sell spare compute to others.",
      payback: "Its own models, plus compute rentals, mainly to Anthropic at $1.25B a month.",
      facts: [
        "AI took $15.8B of SpaceX's $18.4B of Q2 2026 capex.",
        "Compute sales were $2.56B in Q2, a third of SpaceX revenue.",
        "Anthropic can walk away on 90 days' notice after the first three months.",
      ],
      scores: { funding: 4, proof: 4, concentration: 5, fallback: 3 },
      verdict: "High. Rockets and Starlink help, but the AI revenue is short-dated and depends on one customer that can leave quickly.",
    },
    {
      key: "openai",
      label: "OpenAI",
      wants: "Reach artificial general intelligence first, funded by ChatGPT and enterprise sales.",
      payback: "Its own revenue, which must grow into roughly $600B of planned compute spending by 2030.",
      facts: [
        "Revenue was $13.1B in 2025, with $8B burned. Run rate neared $70B in September 2026.",
        "Targets $280B of revenue in 2030.",
        "Owes compute to Microsoft (up to $250B), Oracle (about half of a $664B backlog), Amazon ($138B), and CoreWeave.",
      ],
      scores: { funding: 5, proof: 3, concentration: 2, fallback: 5 },
      verdict: "The center of gravity. If its growth slows, the backlogs at Oracle, Microsoft, Amazon, and CoreWeave shrink together.",
    },
    {
      key: "anthropic",
      label: "Anthropic",
      wants: "Lead in safe frontier models and enterprise AI, especially coding.",
      payback: "Its own revenue, against $518B of compute commitments over ten years, 80% non-cancelable.",
      facts: [
        "Revenue was about $4.6B in 2025 with an operating loss above $8B. Run rate passed $65B in mid-2026.",
        "Owes at least $111B to Google, $110B to Amazon, $31B to Microsoft, and up to $84.5B to SpaceX.",
        "Amazon and Google are both investors and suppliers.",
      ],
      scores: { funding: 4, proof: 2, concentration: 2, fallback: 5 },
      verdict: "High but improving. The fastest revenue growth in the group, against commitments that are mostly fixed.",
    },
  ],
  // Who owes whom, billions, committed compute contracts.
  flows: [
    { from: "OpenAI", to: "Microsoft", value: 250 },
    { from: "OpenAI", to: "Oracle", value: 300, approx: true },
    { from: "OpenAI", to: "Amazon", value: 138 },
    { from: "OpenAI", to: "CoreWeave", value: 22, approx: true },
    { from: "Anthropic", to: "Alphabet", value: 111 },
    { from: "Anthropic", to: "Amazon", value: 110 },
    { from: "Anthropic", to: "SpaceX / xAI", value: 84.5 },
    { from: "Anthropic", to: "Microsoft", value: 31.4 },
  ],
};
