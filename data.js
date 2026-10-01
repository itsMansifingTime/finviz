// Revenue in millions of USD, as reported in NVIDIA Form 10-K filings.
// Fiscal years end in late January. FY2026 ended January 25, 2026.
// OEM was reported as "OEM & IP" for FY2016–FY2018 and "OEM and Other" after that.

const NVDA = {
  markets: [
    { key: "dataCenter", label: "Data Center" },
    { key: "gaming", label: "Gaming" },
    { key: "proViz", label: "Professional Visualization" },
    { key: "auto", label: "Automotive" },
    { key: "oem", label: "OEM & other" },
  ],
  years: [
    { fy: 2016, end: "2016-01-31", dataCenter: 339, gaming: 2818, proViz: 750, auto: 320, oem: 783, total: 5010 },
    { fy: 2017, end: "2017-01-29", dataCenter: 830, gaming: 4060, proViz: 835, auto: 487, oem: 698, total: 6910 },
    { fy: 2018, end: "2018-01-28", dataCenter: 1932, gaming: 5513, proViz: 934, auto: 558, oem: 777, total: 9714 },
    { fy: 2019, end: "2019-01-27", dataCenter: 2932, gaming: 6246, proViz: 1130, auto: 641, oem: 767, total: 11716 },
    { fy: 2020, end: "2020-01-26", dataCenter: 2983, gaming: 5518, proViz: 1212, auto: 700, oem: 505, total: 10918 },
    { fy: 2021, end: "2021-01-31", dataCenter: 6696, gaming: 7759, proViz: 1053, auto: 536, oem: 631, total: 16675 },
    { fy: 2022, end: "2022-01-30", dataCenter: 10613, gaming: 12462, proViz: 2111, auto: 566, oem: 1162, total: 26914 },
    { fy: 2023, end: "2023-01-29", dataCenter: 15005, gaming: 9067, proViz: 1544, auto: 903, oem: 455, total: 26974 },
    { fy: 2024, end: "2024-01-28", dataCenter: 47525, gaming: 10447, proViz: 1553, auto: 1091, oem: 306, total: 60922 },
    { fy: 2025, end: "2025-01-26", dataCenter: 115186, gaming: 11350, proViz: 1878, auto: 1694, oem: 389, total: 130497 },
    { fy: 2026, end: "2026-01-25", dataCenter: 193737, gaming: 16042, proViz: 3191, auto: 2349, oem: 619, total: 215938 },
  ],
  // Direct customers disclosed only when they reach about 10% of revenue.
  // Identities are not comparable across years. Percents are as printed (rounded).
  concentration: [
    { fy: 2016, customers: [{ label: "Unnamed customer", pct: 0.11 }] },
    { fy: 2017, customers: [{ label: "Unnamed customer", pct: 0.12 }] },
    { fy: 2018, customers: [] },
    { fy: 2019, customers: [] },
    { fy: 2020, customers: [{ label: "Dell", pct: 0.11, note: "Primarily the Graphics segment" }] },
    { fy: 2021, customers: [] },
    { fy: 2022, customers: [] },
    { fy: 2023, customers: [] },
    { fy: 2024, customers: [{ label: "Unnamed direct customer", pct: 0.13, note: "Called Customer A in the FY2024 10-K. Primarily Compute & Networking." }] },
    {
      fy: 2025,
      customers: [
        { label: "Unnamed direct customer", pct: 0.12, note: "Primarily Compute & Networking" },
        { label: "Unnamed direct customer", pct: 0.11, note: "Primarily Compute & Networking" },
        { label: "Unnamed direct customer", pct: 0.11, note: "Primarily Compute & Networking" },
      ],
    },
    {
      fy: 2026,
      customers: [
        { label: "Unnamed direct customer", pct: 0.22, note: "Primarily Compute & Networking" },
        { label: "Unnamed direct customer", pct: 0.14, note: "Primarily Compute & Networking" },
      ],
    },
  ],
  // Customer headquarters, recast in the FY2026 10-K. Not comparable with older billing-location tables.
  geography: [
    { fy: 2024, us: 31533, taiwan: 14912, china: 12330, other: 2147, total: 60922 },
    { fy: 2025, us: 77482, taiwan: 23600, china: 25048, other: 4367, total: 130497 },
    { fy: 2026, us: 149617, taiwan: 42345, china: 19677, other: 4299, total: 215938 },
  ],
  dataCenterSplit: [
    { fy: 2024, compute: 38950, networking: 8575 },
    { fy: 2025, compute: 102196, networking: 12990 },
    { fy: 2026, compute: 162361, networking: 31376 },
  ],
  // Estimated share of Data Center revenue by end customer: [point, low, high].
  // NVIDIA fiscal years map roughly to calendar years one earlier (FY2026 ≈ CY2025).
  // Shares count purchases made through server makers and distributors.
  endCustomers: {
    customers: [
      { key: "microsoft", label: "Microsoft", kind: "hyperscaler" },
      { key: "meta", label: "Meta", kind: "hyperscaler" },
      { key: "amazon", label: "Amazon", kind: "hyperscaler" },
      { key: "google", label: "Google", kind: "hyperscaler" },
      { key: "oracle", label: "Oracle", kind: "hyperscaler" },
      { key: "coreweave", label: "CoreWeave", kind: "ai" },
      { key: "xai", label: "xAI", kind: "ai" },
      { key: "china", label: "Chinese customers", kind: "china" },
    ],
    years: [
      {
        fy: 2024,
        shares: {
          microsoft: [0.21, 0.15, 0.27],
          meta: [0.11, 0.07, 0.15],
          amazon: [0.08, 0.05, 0.11],
          google: [0.08, 0.05, 0.11],
          oracle: [0.03, 0.015, 0.05],
          coreweave: [0.04, 0.03, 0.06],
          xai: [0, 0, 0.01],
          china: [0.19, 0.15, 0.23],
        },
      },
      {
        fy: 2025,
        shares: {
          microsoft: [0.21, 0.17, 0.25],
          meta: [0.11, 0.09, 0.13],
          amazon: [0.08, 0.06, 0.1],
          google: [0.08, 0.06, 0.1],
          oracle: [0.05, 0.03, 0.07],
          coreweave: [0.048, 0.035, 0.06],
          xai: [0.026, 0.015, 0.04],
          china: [0.16, 0.12, 0.19],
        },
      },
      {
        fy: 2026,
        shares: {
          microsoft: [0.19, 0.15, 0.23],
          meta: [0.13, 0.1, 0.16],
          amazon: [0.09, 0.06, 0.12],
          google: [0.08, 0.05, 0.11],
          oracle: [0.07, 0.05, 0.1],
          coreweave: [0.04, 0.03, 0.06],
          xai: [0.04, 0.025, 0.06],
          china: [0.04, 0.025, 0.07],
        },
      },
    ],
    // Split of the remainder, in millions: [point, low, high].
    // Enterprises and research is whatever is left after these.
    restSplit: {
      groups: [
        { key: "sovereign", label: "Government AI", kind: "sovereign" },
        { key: "otherClouds", label: "Other GPU clouds", kind: "ai" },
        { key: "tesla", label: "Tesla", kind: "ai" },
      ],
      residual: { key: "enterprise", label: "Enterprise & other", kind: "rest" },
      years: [
        { fy: 2024, sovereign: [2000, 1000, 4000], otherClouds: [1500, 1000, 3000], tesla: [1000, 500, 1500] },
        { fy: 2025, sovereign: [9000, 7000, 10000], otherClouds: [4000, 2000, 6000], tesla: [3500, 3000, 4000] },
        { fy: 2026, sovereign: [30000, 30000, 33000], otherClouds: [8000, 5000, 12000], tesla: [3000, 2000, 4000] },
      ],
    },
  },
};
