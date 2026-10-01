const colors = () => {
  const s = getComputedStyle(document.documentElement);
  const v = (name) => s.getPropertyValue(name).trim();
  return {
    dataCenter: v("--dc"),
    gaming: v("--gaming"),
    proViz: v("--proviz"),
    auto: v("--auto"),
    oem: v("--oem"),
    ink: v("--ink"),
    muted: v("--muted"),
    line: v("--line"),
    disclosed: v("--disclosed"),
    otherDisclosed: v("--other-disclosed"),
    rest: v("--rest"),
    paper: v("--paper"),
    sovereign: v("--sovereign"),
    us: v("--us"),
    taiwan: v("--taiwan"),
    china: v("--china"),
    geoOther: v("--geo-other"),
  };
};

const billions = (millions) => millions / 1000;

function money(millions, digits = 1) {
  const value = billions(millions);
  const body = Math.abs(value).toFixed(digits);
  return (value < 0 ? "−" : "") + "$" + body + " billion";
}

function moneyShort(millions) {
  const value = billions(millions);
  return (value < 0 ? "−$" : "$") + Math.abs(value).toFixed(1) + "B";
}

function pct(part, whole) {
  return (100 * part) / whole;
}

function yearByFy(fy) {
  return NVDA.years.find((y) => y.fy === fy);
}

function assertBooks() {
  for (const year of NVDA.years) {
    const sum = NVDA.markets.reduce((acc, m) => acc + year[m.key], 0);
    if (sum !== year.total) throw new Error(`FY${year.fy} markets ${sum} != ${year.total}`);
  }
  for (const year of NVDA.geography) {
    const sum = year.us + year.taiwan + year.china + year.other;
    if (sum !== year.total) throw new Error(`FY${year.fy} geography ${sum} != ${year.total}`);
  }
  for (const year of NVDA.dataCenterSplit) {
    const row = yearByFy(year.fy);
    if (year.compute + year.networking !== row.dataCenter) {
      throw new Error(`FY${year.fy} data center split`);
    }
  }
}

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

function hideTip() {
  tip.hidden = true;
}

function svgEl(name, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function legend(items) {
  const row = document.createElement("div");
  row.className = "legend";
  for (const item of items) {
    const span = document.createElement("span");
    const sw = document.createElement("i");
    sw.className = "swatch";
    sw.style.background = item.color;
    span.append(sw, document.createTextNode(item.label));
    row.append(span);
  }
  return row;
}

function renderLede() {
  const first = NVDA.years[0];
  const last = NVDA.years[NVDA.years.length - 1];
  const gain = last.total - first.total;
  const dcGain = last.dataCenter - first.dataCenter;
  const gamingThen = pct(first.gaming, first.total);
  const gamingNow = pct(last.gaming, last.total);
  document.getElementById("lede").textContent =
    `Revenue rose from ${money(first.total)} in FY${first.fy} to ${money(last.total)} in FY${last.fy}. ` +
    `Of that ${money(gain)} gain, Data Center contributed ${money(dcGain)}. ` +
    `Gaming was ${gamingThen.toFixed(0)}% of revenue in FY${first.fy} and ${gamingNow.toFixed(0)}% in FY${last.fy}.`;

  const disclosed = last.total * (0.22 + 0.14);
  const stats = document.getElementById("stats");
  const cards = [
    [money(gain, 1), `Gain from FY${first.fy} to FY${last.fy}`, false],
    [pct(dcGain, gain).toFixed(1) + "%", "of that gain came from Data Center", true],
    [money(disclosed, 1), "FY2026 revenue from two direct customers, 22% and 14%", false],
  ];
  stats.replaceChildren();
  for (const [value, label, accent] of cards) {
    const card = document.createElement("div");
    card.className = "stat";
    const v = document.createElement("div");
    v.className = "value" + (accent ? " accent" : "");
    v.textContent = value;
    const l = document.createElement("div");
    l.className = "label";
    l.textContent = label;
    card.append(v, l);
    stats.append(card);
  }
}

function marketChart(baselineFy) {
  const host = document.getElementById("market-chart");
  const c = colors();
  const w = 720;
  const h = 390;
  const m = { t: 12, r: 8, b: 32, l: 48 };
  const plotW = w - m.l - m.r;
  const plotH = h - m.t - m.b;
  const yMax = 240000;
  const y = (v) => m.t + plotH - (v / yMax) * plotH;
  const slot = plotW / NVDA.years.length;
  const barW = slot * 0.62;

  const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img" });
  svg.setAttribute("aria-label", "Stacked bar chart of NVIDIA annual revenue by end market, fiscal 2016 through 2026, in billions of dollars.");

  for (const tick of [0, 60000, 120000, 180000, 240000]) {
    svg.append(svgEl("line", { x1: m.l, x2: w - m.r, y1: y(tick), y2: y(tick), stroke: c.line }));
    const label = svgEl("text", { x: m.l - 8, y: y(tick) + 4, "text-anchor": "end", fill: c.muted, "font-size": 11 });
    label.textContent = tick === 0 ? "0" : String(tick / 1000);
    svg.append(label);
  }
  const unit = svgEl("text", { x: 4, y: 12, fill: c.muted, "font-size": 11 });
  unit.textContent = "$B";
  svg.append(unit);

  NVDA.years.forEach((year, i) => {
    const x = m.l + slot * i + (slot - barW) / 2;
    let cursor = 0;
    for (const market of NVDA.markets) {
      const value = year[market.key];
      const y0 = y(cursor);
      const y1 = y(cursor + value);
      svg.append(svgEl("rect", {
        x, y: y1, width: barW, height: Math.max(0, y0 - y1), fill: c[market.key],
      }));
      cursor += value;
    }
    const hit = svgEl("rect", { x, y: m.t, width: barW, height: plotH, fill: "transparent" });
    hit.addEventListener("mousemove", (event) => {
      const lines = NVDA.markets.map((mk) => `${mk.label}: ${money(year[mk.key])}`).join("<br>");
      showTip(event, `<strong>FY${year.fy}</strong><br>${lines}<br>Total: ${money(year.total)}`);
    });
    hit.addEventListener("mouseleave", hideTip);
    svg.append(hit);
    const tick = svgEl("text", {
      x: x + barW / 2,
      y: h - 10,
      "text-anchor": "middle",
      fill: year.fy === baselineFy ? c.ink : c.muted,
      "font-size": 11,
      "font-weight": year.fy === baselineFy ? 700 : 400,
    });
    tick.textContent = "'" + String(year.fy).slice(2);
    svg.append(tick);
  });

  host.replaceChildren(svg, legend(NVDA.markets.map((mk) => ({ label: mk.label, color: c[mk.key] }))));
}

const BASELINES = [2016, 2020, 2023, 2024];
let baseline = 2023;

function renderGain() {
  const c = colors();
  const base = yearByFy(baseline);
  const last = NVDA.years[NVDA.years.length - 1];
  const net = last.total - base.total;
  const rows = NVDA.markets.map((mk) => ({
    label: mk.label,
    color: c[mk.key],
    delta: last[mk.key] - base[mk.key],
  }));

  document.getElementById("gain-summary").textContent =
    `From FY${base.fy} to FY${last.fy}, revenue increased ${money(net)}. ` +
    `Data Center was ${money(rows[0].delta)} of it (${pct(rows[0].delta, net).toFixed(1)}%).`;

  const buttons = document.getElementById("baselines");
  buttons.replaceChildren();
  for (const fy of BASELINES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = `Since FY${fy}`;
    btn.setAttribute("aria-pressed", fy === baseline ? "true" : "false");
    btn.addEventListener("click", () => {
      baseline = fy;
      marketChart(baseline);
      renderGain();
    });
    buttons.append(btn);
  }

  const max = Math.max(...rows.map((r) => Math.abs(r.delta)));
  const host = document.getElementById("gain-chart");
  host.replaceChildren();
  host.setAttribute("aria-label", `Change in NVIDIA revenue by end market from fiscal ${base.fy} to fiscal ${last.fy}.`);
  for (const row of rows) {
    const line = document.createElement("div");
    line.className = "gain-row";
    const name = document.createElement("span");
    name.textContent = row.label === "Professional Visualization" ? "Pro visualization" : row.label;
    const track = document.createElement("span");
    track.className = "gain-track";
    const bar = document.createElement("span");
    bar.className = "gain-bar";
    bar.style.width = `${(Math.abs(row.delta) / max) * 100}%`;
    bar.style.background = row.delta < 0 ? c.oem : row.color;
    track.append(bar);
    const value = document.createElement("span");
    value.className = "gain-val";
    const share = pct(row.delta, net);
    value.textContent = `${moneyShort(row.delta)} · ${share < 0 ? "−" : ""}${Math.abs(share).toFixed(1)}%`;
    line.append(name, track, value);
    host.append(line);
  }
}

function customerChart() {
  const host = document.getElementById("customer-chart");
  const c = colors();
  const w = 720;
  const h = 360;
  const m = { t: 12, r: 8, b: 32, l: 48 };
  const plotW = w - m.l - m.r;
  const plotH = h - m.t - m.b;
  const yMax = 240000;
  const y = (v) => m.t + plotH - (v / yMax) * plotH;
  const slot = plotW / NVDA.years.length;
  const barW = slot * 0.62;
  const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img" });
  svg.setAttribute("aria-label", "NVIDIA revenue split between direct customers disclosed at 10 percent or more and everyone else, fiscal 2016 through 2026.");

  for (const tick of [0, 60000, 120000, 180000, 240000]) {
    svg.append(svgEl("line", { x1: m.l, x2: w - m.r, y1: y(tick), y2: y(tick), stroke: c.line }));
    const label = svgEl("text", { x: m.l - 8, y: y(tick) + 4, "text-anchor": "end", fill: c.muted, "font-size": 11 });
    label.textContent = tick === 0 ? "0" : String(tick / 1000);
    svg.append(label);
  }
  const unit = svgEl("text", { x: 4, y: 12, fill: c.muted, "font-size": 11 });
  unit.textContent = "$B";
  svg.append(unit);

  NVDA.years.forEach((year, i) => {
    const disclosed = NVDA.concentration.find((row) => row.fy === year.fy).customers;
    const x = m.l + slot * i + (slot - barW) / 2;
    let cursor = 0;
    disclosed.forEach((customer, idx) => {
      const value = year.total * customer.pct;
      const y0 = y(cursor);
      const y1 = y(cursor + value);
      const rect = svgEl("rect", {
        x, y: y1, width: barW, height: Math.max(0, y0 - y1),
        fill: idx === 0 ? c.disclosed : c.otherDisclosed,
      });
      rect.addEventListener("mousemove", (event) => {
        showTip(event, `<strong>FY${year.fy}</strong><br>${customer.label}<br>${Math.round(customer.pct * 100)}% · about ${money(value)}${customer.note ? "<br>" + customer.note : ""}`);
      });
      rect.addEventListener("mouseleave", hideTip);
      svg.append(rect);
      const sliceH = y0 - y1;
      if (sliceH >= 16) {
        const tag = svgEl("text", {
          x: x + barW / 2,
          y: y1 + sliceH / 2 + 4,
          "text-anchor": "middle",
          fill: c.paper,
          "font-size": 10,
        });
        tag.textContent = Math.round(customer.pct * 100) + "%";
        tag.setAttribute("pointer-events", "none");
        svg.append(tag);
      }
      cursor += value;
    });
    const rest = year.total - cursor;
    const y0 = y(cursor);
    const y1 = y(year.total);
    const restRect = svgEl("rect", { x, y: y1, width: barW, height: Math.max(0, y0 - y1), fill: c.rest });
    restRect.addEventListener("mousemove", (event) => {
      const who = disclosed.length
        ? `Under 10% or not disclosed: ${money(rest)}`
        : "No customer disclosed at 10% or more";
      showTip(event, `<strong>FY${year.fy}</strong><br>${who}<br>Total: ${money(year.total)}`);
    });
    restRect.addEventListener("mouseleave", hideTip);
    svg.append(restRect);
    const tick = svgEl("text", { x: x + barW / 2, y: h - 10, "text-anchor": "middle", fill: c.muted, "font-size": 11 });
    tick.textContent = "'" + String(year.fy).slice(2);
    svg.append(tick);
  });

  host.replaceChildren(svg, legend([
    { label: "Largest disclosed customer that year", color: c.disclosed },
    { label: "Other disclosed customers", color: c.otherDisclosed },
    { label: "Under 10% or not disclosed", color: c.rest },
  ]));
}

function geoChart() {
  const c = colors();
  const parts = [
    { key: "us", label: "United States", color: c.us },
    { key: "taiwan", label: "Taiwan", color: c.taiwan },
    { key: "china", label: "China, incl. Hong Kong", color: c.china },
    { key: "other", label: "Other", color: c.geoOther },
  ];
  const w = 420;
  const h = 280;
  const m = { t: 12, r: 8, b: 28, l: 44 };
  const plotW = w - m.l - m.r;
  const plotH = h - m.t - m.b;
  const yMax = 240000;
  const y = (v) => m.t + plotH - (v / yMax) * plotH;
  const slot = plotW / NVDA.geography.length;
  const barW = 48;
  const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img" });
  svg.setAttribute("aria-label", "NVIDIA revenue by direct customer headquarters, fiscal 2024 through 2026.");

  for (const tick of [0, 80000, 160000, 240000]) {
    svg.append(svgEl("line", { x1: m.l, x2: w - m.r, y1: y(tick), y2: y(tick), stroke: c.line }));
    const label = svgEl("text", { x: m.l - 8, y: y(tick) + 4, "text-anchor": "end", fill: c.muted, "font-size": 11 });
    label.textContent = tick === 0 ? "0" : String(tick / 1000);
    svg.append(label);
  }
  const unit = svgEl("text", { x: 4, y: 12, fill: c.muted, "font-size": 11 });
  unit.textContent = "$B";
  svg.append(unit);

  NVDA.geography.forEach((year, i) => {
    const x = m.l + slot * i + (slot - barW) / 2;
    let cursor = 0;
    for (const part of parts) {
      const value = year[part.key];
      const y0 = y(cursor);
      const y1 = y(cursor + value);
      const rect = svgEl("rect", { x, y: y1, width: barW, height: Math.max(0, y0 - y1), fill: part.color });
      rect.addEventListener("mousemove", (event) => {
        showTip(event, `<strong>FY${year.fy} · ${part.label}</strong><br>${money(value)} · ${pct(value, year.total).toFixed(1)}% of revenue`);
      });
      rect.addEventListener("mouseleave", hideTip);
      svg.append(rect);
      cursor += value;
    }
    const tick = svgEl("text", { x: x + barW / 2, y: h - 8, "text-anchor": "middle", fill: c.muted, "font-size": 12 });
    tick.textContent = "FY" + String(year.fy).slice(2);
    svg.append(tick);
  });

  const host = document.getElementById("geo-chart");
  host.replaceChildren(svg, legend(parts.map((p) => ({ label: p.label, color: p.color }))));
}

function renderTable() {
  const table = document.getElementById("table");
  const head = document.createElement("tr");
  for (const label of ["Fiscal year", ...NVDA.markets.map((m) => m.label), "Total"]) {
    const th = document.createElement("th");
    th.textContent = label;
    head.append(th);
  }
  const thead = document.createElement("thead");
  thead.append(head);
  const body = document.createElement("tbody");
  for (const year of NVDA.years) {
    const tr = document.createElement("tr");
    const cells = [String(year.fy), ...NVDA.markets.map((m) => year[m.key].toLocaleString("en-US")), year.total.toLocaleString("en-US")];
    cells.forEach((text, i) => {
      const td = document.createElement("td");
      td.textContent = i === 0 ? "FY" + text : text;
      tr.append(td);
    });
    body.append(tr);
  }
  table.replaceChildren(thead, body);
}

function estimateRows() {
  const est = NVDA.endCustomers;
  const rows = est.customers.map((cu) => ({ ...cu, years: [] }));
  const rest = { key: "rest", label: "Everyone else", kind: "rest", years: [] };
  for (const year of est.years) {
    const dc = yearByFy(year.fy).dataCenter;
    let pointSum = 0;
    let lowSum = 0;
    let highSum = 0;
    rows.forEach((row) => {
      const [p, lo, hi] = year.shares[row.key];
      pointSum += p;
      lowSum += lo;
      highSum += hi;
      row.years.push({ fy: year.fy, value: dc * p, low: dc * lo, high: dc * hi, share: p });
    });
    rest.years.push({
      fy: year.fy,
      value: dc * (1 - pointSum),
      low: dc * Math.max(0, 1 - highSum),
      high: dc * (1 - lowSum),
      share: 1 - pointSum,
    });
  }

  const split = est.restSplit;
  const groups = split.groups.map((g) => ({ ...g, years: [] }));
  const residual = { ...split.residual, years: [] };
  est.years.forEach((year, i) => {
    const dc = yearByFy(year.fy).dataCenter;
    const parts = split.years.find((y) => y.fy === year.fy);
    const whole = rest.years[i];
    let point = 0;
    let low = 0;
    let high = 0;
    for (const g of groups) {
      const [p, lo, hi] = parts[g.key];
      point += p;
      low += lo;
      high += hi;
      g.years.push({ fy: year.fy, value: p, low: lo, high: hi, share: p / dc });
    }
    const left = whole.value - point;
    if (left < 0) throw new Error(`FY${year.fy} remainder split exceeds remainder`);
    residual.years.push({
      fy: year.fy,
      value: left,
      low: Math.max(0, whole.low - high),
      high: Math.max(0, whole.high - low),
      share: left / dc,
    });
  });
  return [...rows, ...groups, residual];
}

function renderEstimates() {
  const c = colors();
  const rows = estimateRows();
  const years = NVDA.endCustomers.years.map((y) => y.fy);
  const shade = [c.oem, c.otherDisclosed, c.dataCenter];
  const kindColor = (kind, i) => {
    if (kind === "china") return [c.rest, c.oem, c.gaming][i];
    if (kind === "sovereign") return [c.rest, c.oem, c.sovereign][i];
    if (kind === "rest") return [c.rest, c.oem, c.proViz][i];
    if (kind === "ai") return [c.rest, c.oem, c.auto][i];
    return shade[i];
  };

  const w = 580;
  const labelW = 128;
  const valueW = 92;
  const barH = 9;
  const gap = 3;
  const rowH = years.length * (barH + gap) + 16;
  const top = 22;
  const h = top + rows.length * rowH + 4;
  const maxVal = 70000;
  const plotW = w - labelW - valueW;
  const x = (v) => labelW + (Math.min(v, maxVal) / maxVal) * plotW;
  const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img" });
  svg.setAttribute("aria-label", "Estimated NVIDIA Data Center revenue by end customer for fiscal 2024, 2025, and 2026, in billions of dollars, with ranges.");

  for (const tick of [0, 20000, 40000, 60000]) {
    svg.append(svgEl("line", { x1: x(tick), x2: x(tick), y1: top - 6, y2: h, stroke: c.line }));
    const t = svgEl("text", { x: x(tick), y: 11, "text-anchor": "middle", fill: c.muted, "font-size": 11 });
    t.textContent = tick === 0 ? "$0" : `$${tick / 1000}B`;
    svg.append(t);
  }

  rows.forEach((row, r) => {
    const y0 = top + r * rowH;
    const name = svgEl("text", { x: 0, y: y0 + rowH / 2 + 2, fill: c.ink, "font-size": 13, "font-weight": row.kind === "rest" ? 400 : 600 });
    name.textContent = row.label;
    svg.append(name);
    row.years.forEach((yr, i) => {
      const by = y0 + 4 + i * (barH + gap);
      const bar = svgEl("rect", {
        x: labelW, y: by, width: Math.max(x(yr.value) - labelW, yr.value > 0 ? 1.5 : 0), height: barH,
        fill: kindColor(row.kind, i),
      });
      svg.append(bar);
      if (yr.high > yr.low) {
        svg.append(svgEl("line", { x1: x(yr.low), x2: x(yr.high), y1: by + barH / 2, y2: by + barH / 2, stroke: c.ink, "stroke-width": 1 }));
        svg.append(svgEl("line", { x1: x(yr.low), x2: x(yr.low), y1: by + 1, y2: by + barH - 1, stroke: c.ink }));
        svg.append(svgEl("line", { x1: x(yr.high), x2: x(yr.high), y1: by + 1, y2: by + barH - 1, stroke: c.ink }));
      }
      const val = svgEl("text", { x: w, y: by + barH - 1, "text-anchor": "end", fill: i === 2 ? c.ink : c.muted, "font-size": 11 });
      val.textContent = `FY${String(yr.fy).slice(2)} ${moneyShort(yr.value)}`;
      svg.append(val);
      const hit = svgEl("rect", { x: 0, y: by - 1, width: w, height: barH + gap, fill: "transparent" });
      hit.addEventListener("mousemove", (event) => {
        showTip(event, `<strong>${row.label} · FY${yr.fy}</strong><br>Estimate: ${money(yr.value)} (${(yr.share * 100).toFixed(1)}% of Data Center)<br>Range: ${moneyShort(yr.low)} to ${moneyShort(yr.high)}`);
      });
      hit.addEventListener("mouseleave", hideTip);
      svg.append(hit);
    });
  });

  document.getElementById("est-chart").replaceChildren(svg, legend([
    { label: "FY2024 (about calendar 2023)", color: c.oem },
    { label: "FY2025 (about 2024)", color: c.otherDisclosed },
    { label: "FY2026 (about 2025): big cloud and platform companies", color: c.dataCenter },
    { label: "AI clouds, labs, and Tesla", color: c.auto },
    { label: "Government AI", color: c.sovereign },
    { label: "China", color: c.gaming },
    { label: "Enterprise & other", color: c.proViz },
  ]));

  const first = years[0];
  const last = years[years.length - 1];
  const dcGain = yearByFy(last).dataCenter - yearByFy(first).dataCenter;
  const gains = rows
    .map((row) => ({ row, delta: row.years[row.years.length - 1].value - row.years[0].value }))
    .sort((a, b) => b.delta - a.delta);
  const named = gains.filter((g) => g.row.kind === "hyperscaler").reduce((acc, g) => acc + g.delta, 0);
  document.getElementById("est-summary").textContent =
    `Data Center revenue grew ${money(dcGain)} from FY${first} to FY${last}. ` +
    `On these estimates, the five big cloud and platform companies account for about ${money(named, 0)} of it (${pct(named, dcGain).toFixed(0)}%). ` +
    `Government AI projects are the largest group outside them. China shrank.`;

  const max = Math.max(...gains.map((g) => Math.abs(g.delta)));
  const host = document.getElementById("est-gain");
  host.replaceChildren();
  for (const g of gains) {
    const line = document.createElement("div");
    line.className = "gain-row";
    const name = document.createElement("span");
    name.textContent = g.row.label;
    const track = document.createElement("span");
    track.className = "gain-track";
    const bar = document.createElement("span");
    bar.className = "gain-bar";
    bar.style.width = `${(Math.abs(g.delta) / max) * 100}%`;
    bar.style.background = g.delta < 0 ? c.gaming : kindColor(g.row.kind, 2);
    track.append(bar);
    const value = document.createElement("span");
    value.className = "gain-val";
    const share = pct(g.delta, dcGain);
    value.textContent = `${moneyShort(g.delta)} · ${share < 0 ? "−" : ""}${Math.abs(share).toFixed(0)}%`;
    line.append(name, track, value);
    host.append(line);
  }
}

assertBooks();
renderLede();
marketChart(baseline);
renderGain();
renderEstimates();
customerChart();
geoChart();
renderTable();
