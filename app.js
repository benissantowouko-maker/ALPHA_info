/* =========================================================
   AlphaTrader — JavaScript Logic
   ========================================================= */

"use strict";

// =========================================================
// CONFIG & STATE
// =========================================================
const state = {
  prices: {
    btc: 67420.5,
    eth: 3891.2,
    spy: 524.8,
    gold: 2341.6,
    eur: 1.0842,
    nvda: 875.4,
  },
  charts: {},
  signalCount: 0,
  animationFrames: {},
};

const COLORS = {
  cyan: "#00d4ff",
  green: "#00ff9d",
  red: "#ff4757",
  yellow: "#ffd700",
  purple: "#a855f7",
  orange: "#f59e0b",
  bg: "#0d1929",
  bgDark: "#050b14",
  text: "#8ba8cc",
};

// =========================================================
// UTILITY
// =========================================================
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max));
}

function formatPrice(val, decimals = 2) {
  if (val >= 1000) return "$" + val.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  if (val < 10) return val.toFixed(4);
  return "$" + val.toFixed(decimals);
}

function generatePriceSeries(base, length, volatility = 0.005) {
  const series = [base];
  for (let i = 1; i < length; i++) {
    const change = series[i - 1] * volatility * (Math.random() - 0.49);
    series.push(Math.max(0, series[i - 1] + change));
  }
  return series;
}

// =========================================================
// NAVIGATION
// =========================================================
function initNavigation() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const connectBtn = document.getElementById("connectBtn");

  // Scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Active nav link
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((s) => observer.observe(s));

  // Hamburger
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("mobile-open");
  });

  // Connect modal
  connectBtn.addEventListener("click", () => openModal());
}

// =========================================================
// TICKER TAPE
// =========================================================
const tickerData = [
  { sym: "BTC/USD", price: "$67,420", change: "+3.24%", up: true },
  { sym: "ETH/USD", price: "$3,891", change: "-1.07%", up: false },
  { sym: "NVDA", price: "$875.40", change: "+5.73%", up: true },
  { sym: "SPY", price: "$524.80", change: "+0.82%", up: true },
  { sym: "AAPL", price: "$195.30", change: "+0.54%", up: true },
  { sym: "TSLA", price: "$248.70", change: "-2.31%", up: false },
  { sym: "XAU/USD", price: "$2,341", change: "+0.15%", up: true },
  { sym: "EUR/USD", price: "1.0842", change: "-0.23%", up: false },
  { sym: "GBP/USD", price: "1.2714", change: "+0.08%", up: true },
  { sym: "BNB/USD", price: "$425.80", change: "+1.92%", up: true },
  { sym: "SOL/USD", price: "$185.40", change: "+4.17%", up: true },
  { sym: "MSFT", price: "$423.15", change: "+1.21%", up: true },
  { sym: "AMZN", price: "$196.80", change: "+0.67%", up: true },
  { sym: "META", price: "$521.40", change: "-0.89%", up: false },
  { sym: "WTI", price: "$79.42", change: "+1.44%", up: true },
  { sym: "DXY", price: "104.82", change: "-0.12%", up: false },
  { sym: "US10Y", price: "4.28%", change: "+0.03", up: true },
  { sym: "XRP/USD", price: "$0.6182", change: "+2.85%", up: true },
];

function initTickerTape() {
  const tape = document.getElementById("tickerTape");
  const html = [...tickerData, ...tickerData] // duplicate for infinite scroll
    .map(
      (item) => `
    <div class="ticker-item">
      <span class="ti-symbol">${item.sym}</span>
      <span class="ti-price">${item.price}</span>
      <span class="ti-change ${item.up ? "up" : "down"}">${item.change}</span>
    </div>
  `
    )
    .join("");
  tape.innerHTML = html;
}

// =========================================================
// HERO PARTICLES
// =========================================================
function initParticles() {
  const container = document.getElementById("heroParticles");
  const count = 60;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = rand(2, 5);
    const x = rand(0, 100);
    const duration = rand(12, 30);
    const delay = rand(0, 15);
    const dx = rand(-100, 100);
    const colors = [COLORS.cyan, COLORS.green, COLORS.purple];
    const color = colors[randInt(0, colors.length)];

    p.style.cssText = `
      left: ${x}%;
      bottom: -10px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 3}px ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --dx: ${dx}px;
    `;
    fragment.appendChild(p);
  }
  container.appendChild(fragment);
}

// =========================================================
// HERO CHART
// =========================================================
function initHeroChart() {
  const ctx = document.getElementById("heroChart");
  if (!ctx) return;

  const labels = [];
  const data = generatePriceSeries(67000, 60, 0.003);

  for (let i = 0; i < 60; i++) {
    const h = Math.floor((i * 24) / 60);
    labels.push(`${h}:00`);
  }

  const grad = ctx.getContext("2d").createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, "rgba(0,212,255,0.25)");
  grad.addColorStop(1, "rgba(0,212,255,0)");

  state.charts.hero = new Chart(ctx.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data,
          borderColor: COLORS.cyan,
          backgroundColor: grad,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      animation: { duration: 2000, easing: "easeInOutQuart" },
    },
  });
}

// =========================================================
// STAT COUNTERS
// =========================================================
function initCounters() {
  const counters = document.querySelectorAll(".counter");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = "true";
        animateCounter(entry.target);
      }
    });
  });

  counters.forEach((c) => observer.observe(c));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = eased * target;
    el.textContent = target % 1 !== 0 ? current.toFixed(1) : Math.floor(current).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target % 1 !== 0 ? target : target.toLocaleString();
  }

  requestAnimationFrame(update);
}

// =========================================================
// MARKET SPARKLINES
// =========================================================
function drawSparkline(canvasId, data, color, negative = false) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.offsetWidth || 200;
  const h = 50;
  canvas.width = w;
  canvas.height = h;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + "40");
  grad.addColorStop(1, color + "00");

  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((val - min) / range) * (h - 8) - 4;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  const firstX = 0;
  const lastX = w;
  const firstY = h - ((data[0] - min) / range) * (h - 8) - 4;
  const lastY = h - ((data[data.length - 1] - min) / range) * (h - 8) - 4;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.lineTo(lastX, h);
  ctx.lineTo(firstX, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
}

function initSparklines() {
  const assets = [
    { id: "spark-btc", base: state.prices.btc, color: COLORS.cyan },
    { id: "spark-eth", base: state.prices.eth, color: COLORS.red },
    { id: "spark-spy", base: state.prices.spy, color: COLORS.green },
    { id: "spark-gold", base: 2341, color: COLORS.yellow },
    { id: "spark-eur", base: 1.084, color: COLORS.red },
    { id: "spark-nvda", base: state.prices.nvda, color: COLORS.green },
  ];

  assets.forEach((a) => {
    const data = generatePriceSeries(a.base, 40, 0.004);
    drawSparkline(a.id, data, a.color);
  });
}

// =========================================================
// MAIN CHART
// =========================================================
function initMainChart() {
  const ctx = document.getElementById("mainChart");
  if (!ctx) return;

  const length = 80;
  const labels = [];
  const data = generatePriceSeries(62000, length, 0.006);

  for (let i = 0; i < length; i++) {
    const h = i % 24;
    labels.push(`${h}:00`);
  }

  // Moving average
  const ma20 = data.map((_, i) => {
    if (i < 20) return null;
    return data.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20;
  });

  const gradMain = ctx.getContext("2d").createLinearGradient(0, 0, 0, 320);
  gradMain.addColorStop(0, "rgba(0,212,255,0.2)");
  gradMain.addColorStop(1, "rgba(0,212,255,0)");

  state.charts.main = new Chart(ctx.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Prix",
          data,
          borderColor: COLORS.cyan,
          backgroundColor: gradMain,
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: COLORS.cyan,
        },
        {
          label: "MA(20)",
          data: ma20,
          borderColor: COLORS.yellow,
          backgroundColor: "transparent",
          borderWidth: 1.5,
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          borderDash: [4, 4],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: COLORS.text,
            font: { family: "JetBrains Mono", size: 11 },
            usePointStyle: true,
            pointStyle: "line",
          },
        },
        tooltip: {
          backgroundColor: "rgba(13,25,41,0.95)",
          borderColor: "rgba(0,212,255,0.3)",
          borderWidth: 1,
          titleColor: COLORS.cyan,
          bodyColor: "#e8f4ff",
          padding: 12,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y ? "$" + ctx.parsed.y.toFixed(2) : "N/A"}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)", lineWidth: 1 },
          ticks: {
            color: COLORS.text,
            font: { family: "JetBrains Mono", size: 10 },
            maxTicksLimit: 12,
          },
        },
        y: {
          position: "right",
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: COLORS.text,
            font: { family: "JetBrains Mono", size: 10 },
            callback: (v) => "$" + v.toLocaleString(),
          },
        },
      },
      animation: { duration: 1200, easing: "easeInOutQuart" },
    },
  });
}

// =========================================================
// PRICE UPDATES (Simulated live feed)
// =========================================================
function updatePrices() {
  const assets = [
    {
      key: "btc",
      priceId: "btc-price",
      changeId: "btc-change",
      sparkId: "spark-btc",
      vol: 0.0008,
      fmt: (v) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      key: "eth",
      priceId: "eth-price",
      changeId: "eth-change",
      sparkId: "spark-eth",
      vol: 0.001,
      fmt: (v) => "$" + v.toFixed(2),
    },
    {
      key: "spy",
      priceId: "spy-price",
      changeId: "spy-change",
      sparkId: "spark-spy",
      vol: 0.0003,
      fmt: (v) => "$" + v.toFixed(2),
    },
    {
      key: "gold",
      priceId: "gold-price",
      changeId: "gold-change",
      sparkId: "spark-gold",
      vol: 0.0003,
      fmt: (v) => "$" + v.toFixed(2),
    },
    {
      key: "eur",
      priceId: "eur-price",
      changeId: "eur-change",
      sparkId: "spark-eur",
      vol: 0.0002,
      fmt: (v) => v.toFixed(4),
    },
    {
      key: "nvda",
      priceId: "nvda-price",
      changeId: "nvda-change",
      sparkId: "spark-nvda",
      vol: 0.001,
      fmt: (v) => "$" + v.toFixed(2),
    },
  ];

  const baseRefs = { btc: 65000, eth: 3850, spy: 520, gold: 2330, eur: 1.082, nvda: 830 };

  assets.forEach((asset) => {
    const change = state.prices[asset.key] * asset.vol * (Math.random() - 0.49);
    state.prices[asset.key] = Math.max(0.001, state.prices[asset.key] + change);

    const priceEl = document.getElementById(asset.priceId);
    const changeEl = document.getElementById(asset.changeId);

    if (priceEl) {
      priceEl.textContent = asset.fmt(state.prices[asset.key]);
      priceEl.style.transition = "color 0.3s";
      priceEl.style.color = change > 0 ? COLORS.green : COLORS.red;
      setTimeout(() => (priceEl.style.color = ""), 500);
    }

    if (changeEl) {
      const pctChange = ((state.prices[asset.key] - baseRefs[asset.key]) / baseRefs[asset.key]) * 100;
      const absChange = state.prices[asset.key] - baseRefs[asset.key];
      changeEl.className = "mc-change " + (pctChange >= 0 ? "positive" : "negative");
      const arrow = pctChange >= 0 ? "▲" : "▼";
      changeEl.textContent = `${arrow} ${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}% (${absChange >= 0 ? "+" : ""}${absChange.toFixed(2)})`;
    }
  });

  // Update chart price
  const chartPrice = document.getElementById("chartMainPrice");
  const chartChange = document.getElementById("chartMainChange");
  if (chartPrice) {
    chartPrice.textContent = "$" + state.prices.btc.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

// =========================================================
// SIGNALS
// =========================================================
const signalTemplates = [
  { type: "buy", pair: "BTC/USD", desc: "Cassure haussière MA50/MA200 · Golden Cross", strength: 92 },
  { type: "sell", pair: "EUR/USD", desc: "Divergence baissière RSI + résistance majeure", strength: 78 },
  { type: "buy", pair: "NVDA", desc: "Momentum fort · Volume 3x · Breakout de range", strength: 88 },
  { type: "alert", pair: "SPY", desc: "Zone de support critique atteinte · Attention!", strength: 65 },
  { type: "buy", pair: "SOL/USD", desc: "Retest du support · EMA200 · Signal Stoch", strength: 83 },
  { type: "sell", pair: "GBP/JPY", desc: "Double top formé · Confirmation baissière MACD", strength: 76 },
  { type: "buy", pair: "ETH/USD", desc: "Pattern bullish engulfing · Accumulation baleines", strength: 71 },
  { type: "buy", pair: "AAPL", desc: "Pullback sur MA20 · Tendance long terme intacte", strength: 80 },
  { type: "sell", pair: "XAU/USD", desc: "RSI surachat 79 · Divergence + résistance $2380", strength: 69 },
  { type: "buy", pair: "BNB/USD", desc: "Zone d'accumulation · Volume croissant · RR: 1:4", strength: 85 },
  { type: "alert", pair: "US10Y", desc: "Rendements en hausse rapide · Impact sur equity!", strength: 90 },
  { type: "buy", pair: "TSMC", desc: "Breakout trimestriel · Semi-conducteurs en force", strength: 87 },
];

function generateSignal() {
  const tpl = signalTemplates[randInt(0, signalTemplates.length)];
  const now = new Date();
  const time = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const prices = { btc: state.prices.btc, eth: state.prices.eth, nvda: state.prices.nvda };
  const price = tpl.pair.includes("BTC") ? "$" + state.prices.btc.toFixed(0) : tpl.pair.includes("ETH") ? "$" + state.prices.eth.toFixed(0) : "";

  const strengthColors = { buy: COLORS.green, sell: COLORS.red, alert: COLORS.yellow };
  const color = strengthColors[tpl.type];

  return `
    <div class="signal-item">
      <div class="sig-type ${tpl.type}">${tpl.type === "buy" ? "ACHAT" : tpl.type === "sell" ? "VENTE" : "ALERTE"}</div>
      <div class="sig-info">
        <div class="sig-pair">${tpl.pair}</div>
        <div class="sig-desc">${tpl.desc}</div>
      </div>
      <div class="sig-meta">
        <div class="sig-price">${price || "—"}</div>
        <div class="sig-time">${time}</div>
      </div>
      <div class="sig-strength">
        <span class="sig-strength-label">Force</span>
        <div class="sig-bar"><div class="sig-bar-fill" style="width:${tpl.strength}%;background:${color}"></div></div>
        <span class="sig-strength-label">${tpl.strength}%</span>
      </div>
    </div>
  `;
}

function initSignals() {
  const list = document.getElementById("signalsList");
  const countEl = document.getElementById("signalCount");
  if (!list) return;

  // Initial signals
  for (let i = 0; i < 8; i++) {
    list.insertAdjacentHTML("beforeend", generateSignal());
    state.signalCount++;
  }
  if (countEl) countEl.textContent = state.signalCount;

  // Live signal injection
  setInterval(() => {
    const signal = generateSignal();
    list.insertAdjacentHTML("afterbegin", signal);
    state.signalCount++;
    if (countEl) countEl.textContent = state.signalCount;

    // Remove old signals
    const items = list.querySelectorAll(".signal-item");
    if (items.length > 20) items[items.length - 1].remove();

    // Toast for important signals
    if (Math.random() < 0.4) {
      const tpl = signalTemplates[randInt(0, signalTemplates.length)];
      showToast(tpl.type === "buy" ? "buy" : tpl.type === "sell" ? "sell" : "alert", tpl.pair, tpl.desc);
    }
  }, 5000);
}

// =========================================================
// PERFORMANCE CHART
// =========================================================
function initPerfChart() {
  const ctx = document.getElementById("perfChart");
  if (!ctx) return;

  const days = 30;
  const labels = [];
  const profits = [];
  let cum = 0;

  for (let i = 0; i < days; i++) {
    labels.push(`J${i + 1}`);
    const daily = rand(-0.5, 3.5);
    cum += daily;
    profits.push(parseFloat(cum.toFixed(2)));
  }

  const grad = ctx.getContext("2d").createLinearGradient(0, 0, 0, 220);
  grad.addColorStop(0, "rgba(0,255,157,0.3)");
  grad.addColorStop(1, "rgba(0,255,157,0)");

  state.charts.perf = new Chart(ctx.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data: profits,
          borderColor: COLORS.green,
          backgroundColor: grad,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(13,25,41,0.95)",
          borderColor: "rgba(0,255,157,0.3)",
          borderWidth: 1,
          callbacks: { label: (ctx) => `  +${ctx.parsed.y.toFixed(2)}%` },
        },
      },
      scales: {
        x: { display: false },
        y: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: COLORS.text, font: { size: 9 }, callback: (v) => `${v}%` },
        },
      },
    },
  });
}

// =========================================================
// HEATMAP
// =========================================================
const heatmapAssets = [
  { sym: "BTC", pct: 3.24 },
  { sym: "ETH", pct: -1.07 },
  { sym: "SOL", pct: 4.17 },
  { sym: "BNB", pct: 1.92 },
  { sym: "NVDA", pct: 5.73 },
  { sym: "AAPL", pct: 0.54 },
  { sym: "TSLA", pct: -2.31 },
  { sym: "MSFT", pct: 1.21 },
  { sym: "SPY", pct: 0.82 },
  { sym: "QQQ", pct: 1.04 },
  { sym: "XAU", pct: 0.15 },
  { sym: "OIL", pct: 1.44 },
  { sym: "EUR", pct: -0.23 },
  { sym: "GBP", pct: 0.08 },
  { sym: "XRP", pct: 2.85 },
  { sym: "ADA", pct: -0.74 },
];

function getHeatColor(pct) {
  if (pct > 4) return { bg: "rgba(0,255,157,0.35)", text: "#00ff9d" };
  if (pct > 2) return { bg: "rgba(0,255,157,0.22)", text: "#00ff9d" };
  if (pct > 0.5) return { bg: "rgba(0,255,157,0.12)", text: "#00ff9d" };
  if (pct > -0.5) return { bg: "rgba(255,215,0,0.12)", text: "#ffd700" };
  if (pct > -2) return { bg: "rgba(255,71,87,0.12)", text: "#ff4757" };
  return { bg: "rgba(255,71,87,0.3)", text: "#ff4757" };
}

function initHeatmap() {
  const grid = document.getElementById("heatmapGrid");
  if (!grid) return;

  grid.innerHTML = heatmapAssets
    .map((a) => {
      const c = getHeatColor(a.pct);
      return `
      <div class="hm-cell" style="background:${c.bg}; border: 1px solid ${c.text}22;" title="${a.sym}: ${a.pct > 0 ? "+" : ""}${a.pct}%">
        <span class="hm-sym" style="color:${c.text}">${a.sym}</span>
        <span class="hm-pct" style="color:${c.text}">${a.pct > 0 ? "+" : ""}${a.pct}%</span>
      </div>
    `;
    })
    .join("");
}

// =========================================================
// PORTFOLIO CHART
// =========================================================
const allocData = [
  { label: "Bitcoin", pct: 35, color: "#f7931a" },
  { label: "Actions US", pct: 25, color: "#4776e6" },
  { label: "Ethereum", pct: 18, color: "#627eea" },
  { label: "Or", pct: 12, color: "#ffd700" },
  { label: "Cash", pct: 6, color: "#8ba8cc" },
  { label: "Autres", pct: 4, color: "#a855f7" },
];

function initAllocationChart() {
  const ctx = document.getElementById("allocationChart");
  if (!ctx) return;

  state.charts.allocation = new Chart(ctx.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: allocData.map((d) => d.label),
      datasets: [
        {
          data: allocData.map((d) => d.pct),
          backgroundColor: allocData.map((d) => d.color + "cc"),
          borderColor: allocData.map((d) => d.color),
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: false,
      cutout: "68%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(13,25,41,0.95)",
          borderColor: "rgba(0,212,255,0.3)",
          borderWidth: 1,
          callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` },
        },
      },
    },
  });

  // Legend
  const legend = document.getElementById("allocLegend");
  if (legend) {
    legend.innerHTML = allocData
      .map(
        (d) => `
      <div class="al-item">
        <div class="al-dot" style="background:${d.color}"></div>
        <span class="al-label">${d.label}</span>
        <span class="al-pct" style="color:${d.color}">${d.pct}%</span>
      </div>
    `
      )
      .join("");
  }
}

// =========================================================
// POSITIONS TABLE
// =========================================================
const positions = [
  {
    asset: "Bitcoin",
    ticker: "BTC",
    icon: "₿",
    iconBg: "linear-gradient(135deg,#f7931a,#ffb740)",
    entry: 58200,
    current: 67420,
    pnl: 15.85,
    pnlAbs: 9220,
    risk: 35,
    riskClass: "med",
  },
  {
    asset: "NVIDIA",
    ticker: "NVDA",
    icon: "NV",
    iconBg: "linear-gradient(135deg,#76b900,#00ff88)",
    entry: 620,
    current: 875.4,
    pnl: 41.19,
    pnlAbs: 25540,
    risk: 50,
    riskClass: "med",
  },
  {
    asset: "S&P 500 ETF",
    ticker: "SPY",
    icon: "📈",
    iconBg: "linear-gradient(135deg,#4776e6,#8e54e9)",
    entry: 490,
    current: 524.8,
    pnl: 7.1,
    pnlAbs: 3480,
    risk: 25,
    riskClass: "low",
  },
  {
    asset: "Ethereum",
    ticker: "ETH",
    icon: "Ξ",
    iconBg: "linear-gradient(135deg,#627eea,#a29bfe)",
    entry: 4120,
    current: 3891.2,
    pnl: -5.55,
    pnlAbs: -2288,
    risk: 40,
    riskClass: "med",
  },
  {
    asset: "Or",
    ticker: "XAU",
    icon: "Au",
    iconBg: "linear-gradient(135deg,#b8860b,#ffd700)",
    entry: 2280,
    current: 2341.6,
    pnl: 2.7,
    pnlAbs: 618,
    risk: 15,
    riskClass: "low",
  },
];

function initPositions() {
  const list = document.getElementById("positionsList");
  if (!list) return;

  list.innerHTML = positions
    .map(
      (p) => `
    <div class="pos-row">
      <div class="pos-asset">
        <div class="pos-asset-icon" style="background:${p.iconBg}">${p.icon}</div>
        <div>
          <div class="pos-asset-name">${p.asset}</div>
          <div class="pos-asset-ticker">${p.ticker}</div>
        </div>
      </div>
      <div class="pos-val">$${p.entry.toLocaleString()}</div>
      <div class="pos-val">$${p.current.toLocaleString()}</div>
      <div class="pos-pnl ${p.pnl >= 0 ? "pos" : "neg"}">
        ${p.pnl >= 0 ? "+" : ""}${p.pnl}%<br>
        <span style="font-size:0.78rem">${p.pnlAbs >= 0 ? "+" : ""}$${Math.abs(p.pnlAbs).toLocaleString()}</span>
      </div>
      <div>
        <div class="risk-bar"><div class="risk-fill ${p.riskClass}" style="width:${p.risk}%"></div></div>
      </div>
    </div>
  `
    )
    .join("");
}

// =========================================================
// RISK GAUGE
// =========================================================
function initRiskGauge() {
  const canvas = document.getElementById("riskGauge");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = 200;
  const h = 120;
  canvas.width = w;
  canvas.height = h;

  const cx = w / 2;
  const cy = h - 15;
  const r = 80;
  const risk = 0.55; // 55% risk level

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.lineWidth = 14;
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.stroke();

  // Gradient arc
  const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  grad.addColorStop(0, COLORS.green);
  grad.addColorStop(0.5, COLORS.yellow);
  grad.addColorStop(1, COLORS.red);

  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * risk);
  ctx.lineWidth = 14;
  ctx.strokeStyle = grad;
  ctx.lineCap = "round";
  ctx.stroke();

  // Needle
  const angle = Math.PI + Math.PI * risk;
  const nx = cx + Math.cos(angle) * (r - 5);
  const ny = cy + Math.sin(angle) * (r - 5);

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(nx, ny);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // Labels
  ctx.fillStyle = COLORS.text;
  ctx.font = "10px JetBrains Mono";
  ctx.textAlign = "left";
  ctx.fillText("Faible", cx - r + 5, cy + 18);
  ctx.textAlign = "right";
  ctx.fillText("Élevé", cx + r - 5, cy + 18);
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.yellow;
  ctx.font = "bold 16px JetBrains Mono";
  ctx.fillText("55%", cx, cy - 25);
}

// =========================================================
// CHART CONTROLS
// =========================================================
function initChartControls() {
  document.querySelectorAll(".tf-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tf-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      // Simulate chart refresh
      if (state.charts.main) {
        const newData = generatePriceSeries(60000 + rand(-5000, 5000), 80, 0.006);
        state.charts.main.data.datasets[0].data = newData;
        state.charts.main.update("active");
      }
    });
  });

  document.querySelectorAll(".ind-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  // Market card clicks
  document.querySelectorAll(".market-card").forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.querySelector(".mc-name")?.textContent;
      const price = card.querySelector(".mc-price")?.textContent;
      const change = card.querySelector(".mc-change")?.textContent;
      const chartTitle = document.getElementById("chartTitle");
      const chartPrice = document.getElementById("chartMainPrice");
      const chartChange = document.getElementById("chartMainChange");
      if (chartTitle) chartTitle.textContent = `${title} — Analyse Technique`;
      if (chartPrice) chartPrice.textContent = price;
      if (chartChange) {
        chartChange.textContent = change.replace("▲ ", "▲ ").replace("▼ ", "▼ ");
        chartChange.className = "chart-change " + (change.includes("▲") ? "positive" : "negative");
      }
      // Reload chart with different data
      if (state.charts.main) {
        const base = parseFloat(price.replace(/[$,]/g, "")) || 50000;
        const newData = generatePriceSeries(base * 0.9, 80, 0.006);
        state.charts.main.data.datasets[0].data = newData;
        state.charts.main.data.datasets[1].data = newData.map((_, i) => i < 20 ? null : newData.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20);
        state.charts.main.update("active");
      }
    });
  });
}

// =========================================================
// MODAL
// =========================================================
function openModal() {
  const modal = document.getElementById("loginModal");
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("loginModal");
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function initModal() {
  const modal = document.getElementById("loginModal");
  const closeBtn = document.getElementById("modalClose");
  const submitBtn = document.getElementById("loginSubmit");
  const startBtn = document.getElementById("startBtn");
  const demoBtn = document.getElementById("demoBtn");
  const connectBtn = document.getElementById("connectBtn");

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  if (startBtn) startBtn.addEventListener("click", openModal);
  if (demoBtn) demoBtn.addEventListener("click", () => {
    showToast("info", "Démo lancée", "Mode démonstration activé — toutes les fonctionnalités sont accessibles");
  });

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const email = document.getElementById("emailInput")?.value;
      if (email) {
        closeModal();
        showToast("buy", "Connexion réussie ✓", `Bienvenue sur AlphaTrader, ${email.split("@")[0]}!`);
      } else {
        document.getElementById("emailInput")?.focus();
      }
    });
  }

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// =========================================================
// TOAST NOTIFICATIONS
// =========================================================
function showToast(type, title, msg) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = { buy: "📈", sell: "📉", info: "💡", alert: "⚠️" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || "🔔"}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
  `;

  container.appendChild(toast);

  // Auto-dismiss
  setTimeout(() => {
    toast.style.animation = "none";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

// =========================================================
// SCROLL ANIMATIONS
// =========================================================
function initScrollAnimations() {
  const elements = document.querySelectorAll(".market-card, .algo-card, .academy-card, .signal-item, .perf-card, .heatmap-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, i * 60);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(25px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

  // Trigger visible
  document.querySelectorAll(".visible").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });
}

function handleScrollAnimation(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}

// =========================================================
// REALTIME INDICATOR UPDATES
// =========================================================
function updateIndicators() {
  const rsi = 55 + rand(-8, 15);
  const macd = rand(100, 400);
  const el_rsi = document.getElementById("rsiVal");
  const el_macd = document.getElementById("macdVal");

  if (el_rsi) el_rsi.textContent = rsi.toFixed(1);
  if (el_macd) el_macd.textContent = "+" + macd.toFixed(1);

  // RSI bar color
  const rsiFill = document.querySelector(".indicator-card .ind-fill");
  if (rsiFill) rsiFill.style.width = rsi + "%";
}

// =========================================================
// LIVE MARKET CHART UPDATE
// =========================================================
let mainChartInterval;

function startLiveChartUpdate() {
  mainChartInterval = setInterval(() => {
    if (!state.charts.main) return;
    const last = state.charts.main.data.datasets[0].data.slice(-1)[0];
    const next = last * (1 + rand(-0.001, 0.0015));
    state.charts.main.data.datasets[0].data.push(next);
    state.charts.main.data.datasets[0].data.shift();

    const data = state.charts.main.data.datasets[0].data;
    const ma = data.map((_, i) => {
      if (i < 20) return null;
      return data.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20;
    });
    state.charts.main.data.datasets[1].data = ma;

    state.charts.main.update("none");
  }, 2000);
}

// =========================================================
// WELCOME SEQUENCE
// =========================================================
function showWelcomeSequence() {
  setTimeout(() => showToast("info", "AlphaTrader chargé ✓", "Données de marché synchronisées. Bonne session!"), 1500);
  setTimeout(() => showToast("buy", "Signal fort détecté", "BTC/USD — Breakout haussier · Force: 92%"), 4000);
  setTimeout(() => showToast("alert", "Actualité marchés", "Fed: Pause des hausses de taux confirmée pour Q3 2026"), 7500);
}

// =========================================================
// INIT ALL
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  // Core UI
  initNavigation();
  initTickerTape();
  initParticles();
  initCounters();

  // Charts & visuals
  initHeroChart();
  initMainChart();
  initSparklines();
  initPerfChart();
  initAllocationChart();
  initRiskGauge();

  // Data
  initHeatmap();
  initPositions();
  initSignals();

  // Interactions
  initChartControls();
  initModal();

  // Animations
  initScrollAnimations();

  // Live updates
  setInterval(updatePrices, 1500);
  setInterval(updateIndicators, 3000);
  startLiveChartUpdate();

  // Welcome
  showWelcomeSequence();

  console.log("%c🚀 AlphaTrader Platform Loaded", "color: #00d4ff; font-size: 18px; font-weight: bold;");
  console.log("%c💡 Signals active · Live prices · Algo bots running", "color: #00ff9d; font-size: 12px;");
});
