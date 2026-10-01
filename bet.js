const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const SPENDER_COLOR = {
  amazon: "--amazon",
  alphabet: "--alphabet",
  microsoft: "--microsoft",
  meta: "--meta",
  oracle: "--oracle",
  coreweave: "--coreweave",
  xai: "--xai",
};
const colorOf = (key) => css(SPENDER_COLOR[key]);

const fmtB = (b, digits = 0) => (b < 0 ? "−" : "") + "$" + Math.abs(b).toFixed(digits) + "B";
const fmtT = (b, digits = 2) => "$" + (b / 1000).toFixed(digits) + " trillion";

const tip = document.getElementById("tip");
function showTip(event, html) {
  tip.innerHTML = html;
  tip.hidden = false;
  const pad = 14;
  const rect = tip.getBoundingClientRect();
  let x = event.clientX + pad;
  let y = event.clientY + pad;
  if (x + rect.width > window.innerWidth - 8) x = event.clientX - rect.width - pad;
  if (y + rect.height > window.innerHeight - 8) y = event.clientY - rect.height - pad;
  tip.style.left = x + "px";
  tip.style.top = y + "px";
}
const hideTip = () => { tip.hidden = true; };

function svgEl(name, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(parent, x, y, text, attrs = {}) {
  const t = svgEl("text", { x, y, "font-size": 12, fill: css("--ink"), ...attrs });
  t.textContent = text;
  parent.appendChild(t);
  return t;
}

function legend(items) {
  const row = document.createElement("div");
  row.className = "legend";
  for (const { label, color } of items) {
    const item = document.createElement("span");
    item.innerHTML = `<span class="swatch" style="background:${color}"></span>${label}`;
    row.appendChild(item);
  }
  return row;
}

const yearTotal = (row) => BET.spenders.reduce((acc, s) => acc + row[s.key], 0);
const capexYear = (year) => BET.capex.find((r) => r.year === year);
const total2026 = yearTotal(capexYear(2026));
const total2025 = yearTotal(capexYear(2025));
const cumulative = (from, to) =>
  BET.capex.filter((r) => r.year >= from && r.year <= to).reduce((acc, r) => acc + yearTotal(r), 0);

function renderLede() {
  const growth = total2026 / yearTotal(capexYear(2023));
  document.getElementById("lede").textContent =
    `Seven companies plan to spend about ${fmtB(total2026)} on AI data centers in 2026, ` +
    `${growth.toFixed(1)} times what they spent in 2023. They have signed far more in leases and contracts. ` +
    `Whether that is reckless depends on who is spending, how they pay, and who pays them back.`;

  const pctGdp = (100 * total2026) / (BET.gdp[2026] * 1000);
  const leases = BET.commitments.find((c) => c.label.startsWith("Data center leases")).value;
  const stats = [
    { value: fmtB(total2026), label: "2026 capital spending, seven builders", accent: true },
    { value: pctGdp.toFixed(1) + "%", label: "of US GDP, above the telecom bubble's 1.2%" },
    { value: fmtT(leases, 2), label: "of data center leases signed but not yet started" },
  ];
  document.getElementById("stats").innerHTML = stats
    .map((s) => `<div class="stat"><div class="value${s.accent ? " accent" : ""}">${s.value}</div><div class="label">${s.label}</div></div>`)
    .join("");
}

function capexChart() {
  const host = document.getElementById("capex-chart");
  const W = 640, H = 340, m = { t: 26, r: 12, b: 30, l: 46 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const max = 1000;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Stacked capital spending by company, 2022 to 2026" });
  const y = (v) => m.t + ih - (v / max) * ih;

  for (let v = 0; v <= max; v += 200) {
    svg.appendChild(svgEl("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: css("--line") }));
    svgText(svg, m.l - 8, y(v) + 4, v === 0 ? "$0" : `$${v}B`, { "text-anchor": "end", fill: css("--muted"), "font-size": 11 });
  }

  const n = BET.capex.length;
  const slot = iw / n;
  const bw = slot * 0.58;
  BET.capex.forEach((row, i) => {
    const x = m.l + slot * i + (slot - bw) / 2;
    let acc = 0;
    for (const s of BET.spenders) {
      const v = row[s.key];
      if (!v) continue;
      const rect = svgEl("rect", {
        x, y: y(acc + v), width: bw, height: Math.max(0, y(acc) - y(acc + v)),
        fill: colorOf(s.key), opacity: row.guidance ? 0.78 : 1,
        stroke: css("--paper"), "stroke-width": 0.75,
      });
      rect.addEventListener("mousemove", (e) =>
        showTip(e, `<strong>${s.label}, ${row.year}${row.guidance ? " guidance" : ""}</strong><br>${fmtB(v, 1)}`));
      rect.addEventListener("mouseleave", hideTip);
      svg.appendChild(rect);
      acc += v;
    }
    svgText(svg, x + bw / 2, y(acc) - 7, fmtB(acc), { "text-anchor": "middle", "font-weight": 650 });
    svgText(svg, x + bw / 2, H - m.b + 18, row.guidance ? `${row.year} plan` : String(row.year),
      { "text-anchor": "middle", fill: css("--muted") });
  });

  host.appendChild(svg);
  host.appendChild(legend(BET.spenders.map((s) => ({ label: s.label, color: colorOf(s.key) }))));
}

function gdpChart() {
  const host = document.getElementById("gdp-chart");
  const ai = (year) => ({
    label: `AI builders, ${year}${year === 2026 ? " plan" : ""}`,
    pct: (100 * yearTotal(capexYear(year))) / (BET.gdp[year] * 1000),
    ai: true,
  });
  const rows = [...BET.history, ai(2025), ai(2026)];
  const max = 3.5;
  host.innerHTML = rows
    .map((r) => `
      <div class="hbar-row">
        <span class="hbar-label">${r.label}</span>
        <span class="hbar-track"><span class="hbar" style="width:${(100 * r.pct) / max}%;background:${r.ai ? css("--dc") : css("--oem")}"></span></span>
        <span class="hbar-val${r.ai ? " strong" : ""}">${r.pct.toFixed(1)}%</span>
      </div>`)
    .join("");
}

function commitChart() {
  const host = document.getElementById("commit-chart");
  const rows = [
    { label: "2026 capital spending, for scale", value: total2026, note: "The seven builders' plans for this year.", scale: true },
    ...BET.commitments,
  ];
  const max = Math.max(...rows.map((r) => r.value));
  host.innerHTML = rows
    .map((r) => `
      <div class="commit-row">
        <div class="commit-head">
          <span class="commit-label">${r.label}</span>
          <span class="commit-val">${r.value >= 1000 ? fmtT(r.value, 2) : fmtB(r.value)}</span>
        </div>
        <span class="commit-track"><span class="commit-bar${r.scale ? " scale" : ""}" style="width:${(100 * r.value) / max}%"></span></span>
        <p class="commit-note">${r.note}</p>
      </div>`)
    .join("");
}

const MODEL = [
  { key: "aiShare", label: "Share of spending that is AI", min: 50, max: 100, step: 5, value: 80, unit: "%" },
  { key: "chipShare", label: "Chips and servers, share of spending", min: 40, max: 80, step: 5, value: 60, unit: "%" },
  { key: "chipLife", label: "Useful life of chips", min: 3, max: 8, step: 1, value: 5, unit: " years" },
  { key: "ret", label: "Return investors expect", min: 0, max: 15, step: 1, value: 9, unit: "%" },
  { key: "opex", label: "Power, staff, other costs, share of revenue", min: 15, max: 50, step: 5, value: 30, unit: "%" },
];

function requiredRevenue(p) {
  const invested = cumulative(2023, 2026) * (p.aiShare / 100);
  const chips = invested * (p.chipShare / 100);
  const buildings = invested - chips;
  const wear = chips / p.chipLife + buildings / 20;
  const ret = invested * (p.ret / 100);
  return { invested, wear, ret, revenue: (wear + ret) / (1 - p.opex / 100) };
}

function renderModel() {
  const controls = document.getElementById("controls");
  const state = Object.fromEntries(MODEL.map((c) => [c.key, c.value]));
  controls.innerHTML = MODEL.map((c) => `
    <label class="control">
      <span class="control-head"><span>${c.label}</span><output id="out-${c.key}">${c.value}${c.unit}</output></span>
      <input type="range" id="in-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}" />
    </label>`).join("") +
    `<button type="button" class="reset" id="reset">Reset to defaults</button>`;

  for (const c of MODEL) {
    document.getElementById(`in-${c.key}`).addEventListener("input", (e) => {
      state[c.key] = Number(e.target.value);
      document.getElementById(`out-${c.key}`).textContent = state[c.key] + c.unit;
      drawGap(state);
    });
  }
  document.getElementById("reset").addEventListener("click", () => {
    for (const c of MODEL) {
      state[c.key] = c.value;
      document.getElementById(`in-${c.key}`).value = c.value;
      document.getElementById(`out-${c.key}`).textContent = c.value + c.unit;
    }
    drawGap(state);
  });
  drawGap(state);
}

function drawGap(p) {
  const host = document.getElementById("gap-chart");
  host.innerHTML = "";
  const need = requiredRevenue(p);
  const today = BET.aiRevenue.reduce((acc, r) => acc + r.value, 0);

  const W = 560, H = 190, labelW = 150, valueW = 70;
  const iw = W - labelW - valueW;
  const max = Math.max(need.revenue, today) * 1.08;
  const sx = (v) => (v / max) * iw;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Required revenue versus AI revenue today" });

  const bar = (yy, label, segments, totalLabel) => {
    svgText(svg, 0, yy + 17, label, { "font-weight": 600 });
    let x = labelW;
    for (const s of segments) {
      const w = sx(s.value);
      const rect = svgEl("rect", { x, y: yy, width: Math.max(0, w), height: 26, fill: s.color, stroke: css("--paper"), "stroke-width": 1 });
      rect.addEventListener("mousemove", (e) => showTip(e, s.tip));
      rect.addEventListener("mouseleave", hideTip);
      svg.appendChild(rect);
      x += w;
    }
    svgText(svg, x + 8, yy + 17, totalLabel, { "font-weight": 650 });
  };

  const opexAmt = need.revenue - need.wear - need.ret;
  bar(20, "Needed every year", [
    { value: need.wear, color: css("--oracle"), tip: `<strong>Wear-out</strong><br>${fmtB(need.wear)} a year` },
    { value: need.ret, color: css("--gaming"), tip: `<strong>Return on ${fmtT(need.invested, 2)}</strong><br>${fmtB(need.ret)} a year` },
    { value: opexAmt, color: css("--oem"), tip: `<strong>Power, staff, other</strong><br>${fmtB(opexAmt)} a year` },
  ], fmtB(need.revenue));

  bar(76, "AI sells today", BET.aiRevenue.map((r, i) => ({
    value: r.value,
    color: i % 2 ? css("--other-disclosed") : css("--dc"),
    tip: `<strong>${r.label}</strong><br>${fmtB(r.value)} run rate<br>${r.note}`,
  })), `≤ ${fmtB(today)}`);

  const keys = [
    ["--oracle", "Wear-out"], ["--gaming", "Return"], ["--oem", "Power, staff, other"],
    ["--dc", "AI revenue"],
  ];
  let lx = labelW;
  for (const [c, l] of keys) {
    svg.appendChild(svgEl("rect", { x: lx, y: 128, width: 10, height: 10, fill: css(c) }));
    svgText(svg, lx + 14, 137, l, { fill: css("--muted"), "font-size": 11 });
    lx += 14 + l.length * 6.2 + 14;
  }

  const ratio = need.revenue / today;
  svgText(svg, labelW, 172, `Gap: ${fmtB(need.revenue - today)} a year, ${ratio.toFixed(1)}× today's AI revenue`,
    { "font-weight": 650, fill: css("--oracle") });
  host.appendChild(svg);

  const labPlan = 280;
  document.getElementById("gap-summary").innerHTML =
    `With these assumptions, the ${fmtT(need.invested, 2)} of AI spending from 2023 to 2026 needs about ` +
    `<strong>${fmtB(need.revenue)} of revenue every year</strong>. AI sells at most ${fmtB(today)} a year today, ` +
    `and less once double counting is removed. ` +
    (ratio > 1
      ? `Closing the gap requires growth like OpenAI's own plan of ${fmtB(labPlan)} in 2030, repeated across the industry, or large gains in Google and Meta advertising that are not counted here. Shorter chip lives widen the gap quickly.`
      : `Under these assumptions, current AI revenue already covers the build.`);
}

function flowChart() {
  const host = document.getElementById("flow-chart");
  const W = 520, H = 330, nodeW = 12, gap = 14;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Compute commitments from OpenAI and Anthropic to builders" });
  const total = BET.flows.reduce((acc, f) => acc + f.value, 0);

  const sources = [...new Set(BET.flows.map((f) => f.from))];
  const targets = [...new Set(BET.flows.map((f) => f.to))]
    .map((t) => ({ t, v: BET.flows.filter((f) => f.to === t).reduce((a, f) => a + f.value, 0) }))
    .sort((a, b) => b.v - a.v)
    .map((o) => o.t);

  const usable = (n) => H - 20 - gap * (n - 1);
  const scaleL = usable(sources.length) / total;
  const scaleR = usable(targets.length) / total;
  const scale = Math.min(scaleL, scaleR);

  const place = (names, side) => {
    const pos = {};
    let yy = 10;
    for (const name of names) {
      const v = BET.flows.filter((f) => f[side] === name).reduce((a, f) => a + f.value, 0);
      pos[name] = { y: yy, h: v * scale, cursor: yy, v };
      yy += v * scale + gap;
    }
    return pos;
  };
  const L = place(sources, "from");
  const R = place(targets, "to");
  const xL = 92, xR = W - 150;
  const srcColor = { OpenAI: css("--dc"), Anthropic: css("--oracle") };

  for (const f of BET.flows) {
    const h = f.value * scale;
    const y0 = L[f.from].cursor + h / 2;
    const y1 = R[f.to].cursor + h / 2;
    L[f.from].cursor += h;
    R[f.to].cursor += h;
    const mid = (xL + nodeW + xR) / 2;
    const path = svgEl("path", {
      d: `M${xL + nodeW},${y0} C${mid},${y0} ${mid},${y1} ${xR},${y1}`,
      stroke: srcColor[f.from], "stroke-width": Math.max(1, h), fill: "none", opacity: 0.45,
    });
    path.addEventListener("mousemove", (e) =>
      showTip(e, `<strong>${f.from} → ${f.to}</strong><br>${f.approx ? "About " : ""}${fmtB(f.value, f.value % 1 ? 1 : 0)} committed`));
    path.addEventListener("mouseleave", hideTip);
    svg.appendChild(path);
  }

  for (const [name, p] of Object.entries(L)) {
    svg.appendChild(svgEl("rect", { x: xL, y: p.y, width: nodeW, height: p.h, fill: srcColor[name] }));
    svgText(svg, xL - 8, p.y + p.h / 2, name, { "text-anchor": "end", "font-weight": 650 });
    svgText(svg, xL - 8, p.y + p.h / 2 + 15, `~${fmtB(p.v)}`, { "text-anchor": "end", fill: css("--muted"), "font-size": 11 });
  }
  for (const [name, p] of Object.entries(R)) {
    svg.appendChild(svgEl("rect", { x: xR, y: p.y, width: nodeW, height: p.h, fill: css("--ink") }));
    svgText(svg, xR + nodeW + 8, p.y + p.h / 2 + 4, `${name}  ${fmtB(p.v)}`);
  }
  host.appendChild(svg);
}

const SCORE_COLS = [
  { key: "funding", label: "Funding strain" },
  { key: "proof", label: "Unproven revenue" },
  { key: "concentration", label: "Customer concentration" },
  { key: "fallback", label: "Weak fallback" },
];

function scoreColor(s) {
  return ["", "#d9e6dc", "#e9e3c9", "#ecd3b8", "#dfae94", "#c98468"][s];
}

function riskMatrix() {
  const rows = BET.companies
    .map((c) => ({ ...c, total: SCORE_COLS.reduce((a, k) => a + c.scores[k.key], 0) }))
    .sort((a, b) => a.total - b.total);
  const head = `<tr><th>Company</th>${SCORE_COLS.map((k) => `<th>${k.label}</th>`).join("")}<th>Total of 20</th></tr>`;
  const body = rows
    .map((c) => `<tr>
      <td><a href="#card-${c.key}">${c.label}</a></td>
      ${SCORE_COLS.map((k) => `<td class="score" style="background:${scoreColor(c.scores[k.key])}">${c.scores[k.key]}</td>`).join("")}
      <td class="score total">${c.total}</td>
    </tr>`)
    .join("");
  document.getElementById("risk-matrix").innerHTML = `<table class="risk">${head}${body}</table>`;

  document.getElementById("risk-cards").innerHTML = rows
    .map((c) => `
      <article class="card" id="card-${c.key}">
        <header class="card-head"><h3>${c.label}</h3><span class="card-score" style="background:${scoreColor(Math.round(c.total / 4))}">${c.total} / 20</span></header>
        <p><span class="card-k">Wants</span>${c.wants}</p>
        <p><span class="card-k">Gets paid back by</span>${c.payback}</p>
        <ul>${c.facts.map((f) => `<li>${f}</li>`).join("")}</ul>
        <p class="verdict">${c.verdict}</p>
      </article>`)
    .join("");
}

function renderScenarios() {
  const scenarios = [
    {
      title: "Labs hit their plans",
      body: "OpenAI and Anthropic grow toward several hundred billion dollars of revenue by 2030. Backlogs convert to revenue, leases are covered, and the debt looks cheap in hindsight.",
      hit: "Little damage. Winners are the clouds that own their chips (Alphabet, Amazon) and NVIDIA.",
      tone: "--dc",
    },
    {
      title: "Growth slows, builders absorb it",
      body: "AI keeps growing, but more slowly than the build. Prices for renting GPUs fall, chips age before they pay back, and depreciation squeezes margins.",
      hit: "Meta and Alphabet take lower margins but survive on ads. Microsoft and Amazon re-rent capacity at lower prices. Oracle and CoreWeave strain against fixed debt and leases.",
      tone: "--gaming",
    },
    {
      title: "A lab cannot pay",
      body: "One leading lab misses its targets and renegotiates or walks away from commitments. About half of the $2.5 trillion of backlog is owed by OpenAI and Anthropic.",
      hit: "Oracle, CoreWeave, and SpaceX / xAI are hit hardest, then Microsoft and Amazon's backlogs. Lenders and NVIDIA orders follow.",
      tone: "--oracle",
    },
  ];
  document.getElementById("scenarios").innerHTML = scenarios
    .map((s) => `
      <article class="scenario" style="border-top-color:${css(s.tone)}">
        <h3>${s.title}</h3>
        <p>${s.body}</p>
        <p class="hit"><span class="card-k">Who gets hurt</span>${s.hit}</p>
      </article>`)
    .join("");
}

renderLede();
capexChart();
gdpChart();
commitChart();
renderModel();
flowChart();
riskMatrix();
renderScenarios();
