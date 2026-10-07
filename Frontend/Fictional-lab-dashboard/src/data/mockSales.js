// Mock aggregates for the dashboard. Numbers are generated deterministically
// (seeded by state / category / range) so the same filters always show the
// same figures. The "last 30 days, all categories" totals match the wireframes.

const STATES = [
  { code: "NSW", name: "New South Wales", customers: 3980, txns: 15640, stores: 10, revenue: 2800000, newShare: 0.34 },
  { code: "VIC", name: "Victoria", customers: 3410, txns: 11920, stores: 9, revenue: 2100000, newShare: 0.38 },
  { code: "QLD", name: "Queensland", customers: 2390, txns: 9480, stores: 7, revenue: 1600000, newShare: 0.41 },
  { code: "WA", name: "Western Australia", customers: 1210, txns: 4930, stores: 4, revenue: 830000, newShare: 0.36 },
  { code: "SA", name: "South Australia", customers: 820, txns: 3370, stores: 3, revenue: 560000, newShare: 0.31 },
  { code: "TAS", name: "Tasmania", customers: 270, txns: 1150, stores: 1, revenue: 190000, newShare: 0.29 },
  { code: "ACT", name: "Australian Capital Territory", customers: 250, txns: 1060, stores: 1, revenue: 180000, newShare: 0.44 },
  { code: "NT", name: "Northern Territory", customers: 150, txns: 660, stores: 1, revenue: 110000, newShare: 0.33 },
];

const STORES = {
  NSW: ["Sydney CBD", "Parramatta", "Bondi Junction", "Chatswood", "Newcastle", "Wollongong", "Penrith", "Liverpool", "Albury", "Coffs Harbour"],
  VIC: ["Melbourne CBD", "Chadstone", "Geelong", "Ballarat", "Bendigo", "Doncaster", "Frankston", "Werribee", "Shepparton"],
  QLD: ["Brisbane CBD", "Gold Coast", "Sunshine Coast", "Cairns", "Townsville", "Toowoomba", "Chermside"],
  WA: ["Perth CBD", "Fremantle", "Joondalup", "Bunbury"],
  SA: ["Adelaide CBD", "Glenelg", "Mount Gambier"],
  TAS: ["Hobart"],
  ACT: ["Canberra"],
  NT: ["Darwin"],
};

const RANGE_MODEL = {
  "7d": { scale: 0.24, points: 7, unit: "day" },
  "30d": { scale: 1, points: 30, unit: "day" },
  "90d": { scale: 2.9, points: 13, unit: "week" },
  "12m": { scale: 11.4, points: 12, unit: "month" },
};

const CATEGORY_MODEL = {
  electronics: { share: 0.24, products: 268 },
  apparel: { share: 0.27, products: 342 },
  home: { share: 0.19, products: 251 },
  grocery: { share: 0.18, products: 204 },
  sports: { share: 0.12, products: 139 },
};

// [name, category, share of all units sold]
const PRODUCTS = [
  ["Wireless Earbuds", "electronics", 0.074],
  ["USB-C Charger", "electronics", 0.058],
  ["Bluetooth Speaker", "electronics", 0.041],
  ["Smart Watch", "electronics", 0.036],
  ["Phone Case", "electronics", 0.031],
  ["Cotton T-Shirt", "apparel", 0.081],
  ["Slim Jeans", "apparel", 0.062],
  ["Running Socks", "apparel", 0.049],
  ["Rain Jacket", "apparel", 0.04],
  ["Wool Beanie", "apparel", 0.038],
  ["Scented Candle", "home", 0.052],
  ["Ceramic Planter", "home", 0.043],
  ["Throw Cushion", "home", 0.037],
  ["Garden Hose", "home", 0.03],
  ["LED Desk Lamp", "home", 0.028],
  ["Ground Coffee 1kg", "grocery", 0.055],
  ["Olive Oil 750ml", "grocery", 0.041],
  ["Muesli Bars", "grocery", 0.034],
  ["Sparkling Water", "grocery", 0.027],
  ["Dark Chocolate", "grocery", 0.023],
  ["Yoga Mat", "sports", 0.034],
  ["Drink Bottle", "sports", 0.029],
  ["Resistance Bands", "sports", 0.022],
  ["Tennis Balls", "sports", 0.019],
  ["Camping Chair", "sports", 0.016],
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32: tiny seeded PRNG, returns a function yielding floats in [0, 1).
function rng(key) {
  let a = hash(key);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = (key) => rng(key)();
const sum = (values) => values.reduce((a, b) => a + b, 0);

function stateTotals(base, range, category) {
  const { scale } = RANGE_MODEL[range];
  const share = category
    ? CATEGORY_MODEL[category].share * (0.85 + 0.3 * rand(`${base.code}:${category}`))
    : 1;
  return {
    code: base.code,
    name: base.name,
    stores: base.stores,
    // Customers repeat-purchase, so they grow slower than transactions as the window widens.
    customers: Math.round(base.customers * Math.pow(scale, 0.75) * share),
    txns: Math.round(base.txns * scale * share),
    revenue: Math.round(base.revenue * scale * share),
  };
}

// Splits `total` across `n` periods. `growth` tilts the series up (positive)
// or down (negative), `wave`/`phase` add a seasonal swing, plus a little noise.
function spread(total, n, key, { growth = 0.5, wave = 0, phase = 0 } = {}) {
  const next = rng(key);
  const weights = Array.from({ length: n }, (_, i) => {
    const t = n > 1 ? i / (n - 1) : 0;
    return (1 + growth * t) * (1 + wave * Math.sin(phase + t * Math.PI * 3)) * (0.92 + 0.16 * next());
  });
  const totalWeight = sum(weights);
  return weights.map((w) => Math.round((total * w) / totalWeight));
}

function periodLabels(range) {
  const { points, unit } = RANGE_MODEL[range];
  const today = new Date();
  return Array.from({ length: points }, (_, i) => {
    const back = points - 1 - i;
    if (unit === "month") {
      return new Date(today.getFullYear(), today.getMonth() - back, 1).toLocaleDateString("en-AU", {
        month: "short",
        year: "2-digit",
      });
    }
    const d = new Date(today);
    d.setDate(d.getDate() - back * (unit === "week" ? 7 : 1));
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  });
}

function txnSeries(state, range, category) {
  return spread(state.txns, RANGE_MODEL[range].points, `txns:${state.code}:${range}:${category}`);
}

function newShare(base, category) {
  const shift = category ? (rand(`mix:${base.code}:${category}`) - 0.5) * 0.08 : 0;
  return base.newShare + shift;
}

export function getOverview({ range, category }) {
  const states = STATES.map((base) => stateTotals(base, range, category));
  const customers = sum(states.map((s) => s.customers));
  const transactions = sum(states.map((s) => s.txns));

  const perState = states.map((s) => txnSeries(s, range, category));
  const txnValues = perState[0].map((_, i) => sum(perState.map((series) => series[i])));

  const allTxns = sum(STATES.map((s) => s.txns)) * RANGE_MODEL[range].scale;
  const topProducts = PRODUCTS.filter(([, cat]) => !category || cat === category)
    .map(([name, , share]) => ({
      name,
      value: Math.round(allTxns * 1.6 * share * (0.9 + 0.2 * rand(`product:${range}:${name}`))),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const maleCustomers = sum(
    states.map((s) => Math.round(s.customers * (0.44 + 0.12 * rand(`gender:${s.code}:${category}`))))
  );

  return {
    kpis: {
      customers,
      stores: sum(states.map((s) => s.stores)),
      transactions,
      products: category
        ? CATEGORY_MODEL[category].products
        : sum(Object.values(CATEGORY_MODEL).map((c) => c.products)),
    },
    states,
    txnsOverTime: { labels: periodLabels(range), values: txnValues },
    topProducts,
    genderDistribution: [
      { name: "Male", value: maleCustomers },
      { name: "Female", value: customers - maleCustomers },
    ],
  };
}

// Each postcode gets its own character, seeded by the postcode alone so it
// stays the same across date ranges and categories: its size, how many of its
// customers are new, which store they favour, and whether it is growing or
// shrinking. Sizes are deliberately generous (1-8% of the state) so the charts
// have enough volume to show a shape; they are not meant to add up to the state.
function postcodeProfile(postcode) {
  const next = rng(`postcode:${postcode}`);
  return {
    share: 0.01 + 0.07 * next(),
    newShare: 0.15 + 0.6 * next(),
    homeStore: next(),
    txns: { growth: -0.6 + 1.8 * next(), wave: 0.1 + 0.3 * next(), phase: next() * Math.PI * 2 },
    customers: { growth: -0.5 + 1.5 * next(), wave: 0.05 + 0.2 * next(), phase: next() * Math.PI * 2 },
  };
}

// With `postcode` set, every figure is narrowed to customers living in that postcode.
export function getStateDetails(code, { range, category, postcode }) {
  const base = STATES.find((s) => s.code === code.toUpperCase());
  if (!base) throw new Error(`Unknown state "${code}"`);

  const state = stateTotals(base, range, category);
  const profile = postcode ? postcodeProfile(postcode) : null;
  if (profile) {
    state.customers = Math.round(state.customers * profile.share);
    state.txns = Math.round(state.txns * profile.share);
    state.revenue = Math.round(state.revenue * profile.share);
  }
  const { points } = RANGE_MODEL[range];
  const key = `${base.code}:${range}:${category}:${postcode ?? ""}`;
  const newCustomers = Math.round(state.customers * (profile?.newShare ?? newShare(base, category)));

  // State view: the first (CBD) store leads. Postcode view: its nearest store dominates.
  const stores = STORES[base.code];
  const homeStore = profile ? Math.floor(profile.homeStore * stores.length) : -1;
  const storeNext = rng(`stores:${key}`);
  const storeWeights = stores.map((_, i) =>
    profile
      ? (i === homeStore ? 4 : 1) * (0.3 + 0.9 * storeNext())
      : (i === 0 ? 1.6 : 1) * (0.7 + 0.6 * storeNext())
  );
  const storeWeightTotal = sum(storeWeights);

  const txns = spread(state.txns, points, `txns:${key}`, profile?.txns);

  return {
    state,
    postcode: postcode || null,
    states: STATES.map((s) => stateTotals(s, range, category)),
    newVsReturning: [
      { name: "new", value: newCustomers },
      { name: "returning", value: state.customers - newCustomers },
    ],
    customersVsTxns: {
      labels: periodLabels(range),
      customers: spread(state.customers, points, `customers:${key}`, { growth: 0.25, ...profile?.customers }),
      txns,
    },
    customersByStore: stores.map((name, i) => ({
      name,
      value: Math.round((state.customers * storeWeights[i]) / storeWeightTotal),
    })),
    txnsOverTime: { labels: periodLabels(range), values: txns },
  };
}
