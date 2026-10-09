import { query } from "../db.js";

// Dashboard aggregates read from the PostgreSQL "consumption" schema. Every
// table there is pre-aggregated per date range and category, so each widget is
// one lookup. The functions return the same shapes the mock module did.

// The aggregate tables store the "all categories" rollup under this category.
const ALL_CATEGORIES = "all";
const categoryKey = (category) => category || ALL_CATEGORIES;

const rows = async (text, params) => (await query(text, params)).rows;
const ids = async (text) => (await rows(text)).map((row) => row.id);

export const getRangeIds = () => ids("SELECT range_id AS id FROM consumption.date_ranges");
export const getCategoryIds = () => ids("SELECT category_id AS id FROM consumption.categories");

// Largest state first, the order the state switcher and the charts list them in.
export const getStates = () =>
  rows("SELECT state_code AS code, state_name AS name FROM consumption.all_states ORDER BY revenue DESC");

export async function getOverview({ range, category }) {
  const key = [range, categoryKey(category)];
  const [kpis, states, txns, topProducts, gender] = await Promise.all([
    rows(
      `SELECT customers, stores, transactions, products
       FROM consumption.overview_kpis
       WHERE date_range = $1 AND category = $2`,
      key
    ),
    rows(
      `SELECT t.state_code AS code, t.state_name AS name, t.stores, t.customers, t.revenue
       FROM consumption.state_totals t
       JOIN consumption.all_states s ON s.state_code = t.state_code
       WHERE t.date_range = $1 AND t.category = $2
       ORDER BY s.revenue DESC`,
      key
    ),
    rows(
      `SELECT period_label, transactions
       FROM consumption.overview_transactions_over_time
       WHERE date_range = $1 AND category = $2
       ORDER BY period_index`,
      key
    ),
    rows(
      `SELECT product_name AS name, units_sold AS value
       FROM consumption.overview_top_products
       WHERE date_range = $1 AND category = $2
       ORDER BY rank`,
      key
    ),
    rows(
      `SELECT gender, customers
       FROM consumption.overview_gender_distribution
       WHERE date_range = $1 AND category = $2`,
      key
    ),
  ]);
  if (!kpis.length) throw new Error(`No overview data for range "${range}", category "${key[1]}"`);

  const customersOf = (name) => gender.find((g) => g.gender === name)?.customers ?? 0;
  return {
    kpis: kpis[0],
    states,
    txnsOverTime: { labels: txns.map((t) => t.period_label), values: txns.map((t) => t.transactions) },
    topProducts,
    genderDistribution: [
      { name: "Male", value: customersOf("male") },
      { name: "Female", value: customersOf("female") },
    ],
  };
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// The consumption tables have no postcode grain, so a postcode view is the
// state's figures scaled by a fixed share of 1-8%, seeded by the postcode alone
// so it stays the same across date ranges and categories. Shares are not meant
// to add up to the state.
function postcodeShare(postcode) {
  let a = (hash(`postcode:${postcode}`) + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return 0.01 + 0.07 * (((t ^ (t >>> 14)) >>> 0) / 4294967296);
}

// With `postcode` set, every figure is narrowed to customers living in that postcode.
// Returns null when there is no such state.
export async function getStateDetails(code, { range, category, postcode }) {
  const key = [range, categoryKey(category), code.toUpperCase()];
  const [totals, states, revenueByStore, revenueByGender, customersByStore, txns] = await Promise.all([
    rows(
      `SELECT state_code AS code, state_name AS name, stores, customers, transactions AS txns, revenue
       FROM consumption.state_totals
       WHERE date_range = $1 AND category = $2 AND state_code = $3`,
      key
    ),
    getStates(),
    // The five highest-earning stores, best first.
    rows(
      `SELECT store_name AS name, revenue AS value
       FROM consumption.state_revenue_by_store_top5
       WHERE date_range = $1 AND category = $2 AND state_code = $3
       ORDER BY rank`,
      key
    ),
    rows(
      `SELECT period_label, male_revenue, female_revenue
       FROM consumption.state_revenue_by_gender_over_time
       WHERE date_range = $1 AND category = $2 AND state_code = $3
       ORDER BY period_index`,
      key
    ),
    // The flagship store first, then the busiest.
    rows(
      `SELECT c.store_name AS name, c.customers AS value
       FROM consumption.state_customers_by_store c
       LEFT JOIN consumption.all_stores s ON s.state_code = c.state_code AND s.store_name = c.store_name
       WHERE c.date_range = $1 AND c.category = $2 AND c.state_code = $3
       ORDER BY s.is_flagship DESC NULLS LAST, c.customers DESC, c.store_name`,
      key
    ),
    rows(
      `SELECT period_label, transactions
       FROM consumption.state_transactions_over_time
       WHERE date_range = $1 AND category = $2 AND state_code = $3
       ORDER BY period_index`,
      key
    ),
  ]);
  if (!totals.length) return null;

  const share = postcode ? postcodeShare(postcode) : 1;
  const scaled = (value) => Math.round(value * share);
  const scaledRows = (list) => list.map(({ name, value }) => ({ name, value: scaled(value) }));
  const state = totals[0];

  return {
    state: { ...state, customers: scaled(state.customers), txns: scaled(state.txns), revenue: scaled(state.revenue) },
    // Only what the state switcher needs.
    states,
    revenueByStore: scaledRows(revenueByStore),
    revenueByGender: {
      labels: revenueByGender.map((r) => r.period_label),
      male: revenueByGender.map((r) => scaled(r.male_revenue)),
      female: revenueByGender.map((r) => scaled(r.female_revenue)),
    },
    customersByStore: scaledRows(customersByStore),
    txnsOverTime: { labels: txns.map((t) => t.period_label), values: txns.map((t) => scaled(t.transactions)) },
  };
}
