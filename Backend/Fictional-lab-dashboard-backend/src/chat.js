import { getOverview, getStateDetails, getStates } from "./data/sales.js";

// Mock assistant: there is no language model behind the chat yet. The question
// is matched against keywords to pick a state, date range, category and topic,
// and the reply is built from the same aggregates the pages show.
// Replace answer() with a real model call when one is available; the reply
// shape ({ text, chart }) is all the frontend depends on.

const RANGE_WORDS = [
  ["7d", /\b(7|seven) days?\b|\b(this|last|past) week\b|\bweekly\b/],
  ["90d", /\b(90|ninety) days?\b|\b(3|three) months?\b|\bquarter(ly)?\b/],
  ["12m", /\b(12|twelve) months?\b|\byear(ly)?\b|\bannual(ly)?\b/],
  ["30d", /\b(30|thirty) days?\b|\b(this|last|past) month\b|\bmonthly\b/],
];
const RANGE_NAMES = { "7d": "the last 7 days", "30d": "the last 30 days", "90d": "the last 90 days", "12m": "the last 12 months" };

const CATEGORY_WORDS = [
  ["electronics", /\belectronics?\b|\bgadgets?\b/],
  ["apparel", /\bapparel\b|\bcloth(es|ing)\b|\bfashion\b/],
  ["home", /\bhome\b|\bgarden\b/],
  ["grocery", /\bgrocer(y|ies)\b|\bfood\b/],
  ["sports", /\bsports?\b|\boutdoors?\b/],
];
const CATEGORY_NAMES = { electronics: "Electronics", apparel: "Apparel", home: "Home & Garden", grocery: "Grocery", sports: "Sports & Outdoors" };

const TOPICS = [
  ["gender", /\bgenders?\b|\b(fe)?males?\b|\b(wo)?men\b/],
  ["products", /\bproducts?\b|\bitems?\b|\bbest.?sell/],
  ["stores", /\bstores?\b|\bshops?\b|\boutlets?\b/],
  ["transactions", /\btransactions?\b|\borders?\b|\btrend|\bover time\b/],
  ["customers", /\bcustomers?\b|\bshoppers?\b|\bbuyers?\b/],
  ["revenue", /\brevenue\b|\bsales\b|\bearn|\bincome\b|\bmoney\b/],
  ["states", /\bstates?\b|\bterritor(y|ies)\b|\bcountry\b|\baustralia\b/],
];

const HELP =
  "I can answer questions about revenue, customers, transactions, stores, top products and gender, " +
  "for Australia or one state. Try “revenue by state”, “top products in apparel” or “transactions in VIC over the last 12 months”.";

const number = (n) => Math.round(n).toLocaleString("en-AU");
const dollars = (n) => `$${number(n)}`;
const stores = (n) => `${n} ${n === 1 ? "store" : "stores"}`;
const sum = (values) => values.reduce((a, b) => a + b, 0);
const top = (rows) => rows.reduce((best, row) => (row.value > best.value ? row : best));
const firstMatch = (table, text) => table.find(([, pattern]) => pattern.test(text))?.[0];

// Full names match in any case. Codes that could be ordinary words ("act",
// "sa", "wa", "nt") only count in capitals or straight after "in"/"for".
function findState(question, states) {
  const lower = question.toLowerCase();
  return states.find(
    ({ code, name }) =>
      lower.includes(name.toLowerCase()) ||
      new RegExp(`\\b${code}\\b`).test(question) ||
      new RegExp(`\\b(in|for) ${code}\\b`, "i").test(question) ||
      (["NSW", "VIC", "QLD", "TAS"].includes(code) && new RegExp(`\\b${code}\\b`, "i").test(question))
  );
}

// `context` is what the page is currently showing; the question overrides it.
export async function answer(question, context = {}) {
  const lower = question.toLowerCase();
  const states = await getStates();
  const state = findState(question, states) ?? states.find((s) => s.code === context.state?.toUpperCase());
  const range = firstMatch(RANGE_WORDS, lower) ?? context.range ?? "30d";
  const category = firstMatch(CATEGORY_WORDS, lower) ?? context.category ?? "";
  const topic = firstMatch(TOPICS, lower);
  if (!topic) return { text: HELP, chart: null };

  const scope = `${category ? `${CATEGORY_NAMES[category]}, ` : ""}${RANGE_NAMES[range]}`;
  const where = state ? state.name : "Australia";
  const filters = { range, category, postcode: "" };
  const overview = await getOverview(filters);
  const details = state && (await getStateDetails(state.code, filters));

  switch (topic) {
    case "gender": {
      if (details) {
        const { labels, male, female } = details.revenueByGender;
        return {
          text: `In ${where}, male customers spent ${dollars(sum(male))} and female customers ${dollars(sum(female))} (${scope}).`,
          chart: {
            type: "line",
            title: `Revenue by gender, ${state.code}`,
            format: "revenue",
            labels,
            series: [
              { name: "Male", values: male },
              { name: "Female", values: female },
            ],
          },
        };
      }
      const [male, female] = overview.genderDistribution;
      return {
        text: `Across Australia there were ${number(male.value)} male and ${number(female.value)} female customers (${scope}).`,
        chart: { type: "pie", title: "Customers by gender", data: overview.genderDistribution },
      };
    }

    case "products": {
      const best = overview.topProducts[0];
      return {
        text:
          `The best seller was ${best.name} with ${number(best.value)} units (${scope}).` +
          (state ? " Product figures are only available for the whole country." : ""),
        chart: { type: "bar", title: "Top products by units sold", format: "number", data: overview.topProducts },
      };
    }

    case "stores": {
      if (details) {
        const byCustomers = /\bcustomers?\b|\bshoppers?\b|\bbuyers?\b/.test(lower);
        const data = byCustomers ? details.customersByStore : details.revenueByStore;
        const best = top(data);
        return {
          text: byCustomers
            ? `${where} has ${stores(details.state.stores)}. ${best.name} had the most customers, ${number(best.value)} (${scope}).`
            : `${where} has ${stores(details.state.stores)}. ${best.name} earned the most, ${dollars(best.value)} (${scope}).`,
          chart: {
            type: "bar",
            title: byCustomers ? `Customers by store, ${state.code}` : `Top stores by revenue, ${state.code}`,
            format: byCustomers ? "number" : "revenue",
            data,
          },
        };
      }
      const data = overview.states.map((s) => ({ name: s.code, value: s.stores }));
      return {
        text: `There are ${overview.kpis.stores} stores across Australia. ${top(data).name} has the most, ${top(data).value}.`,
        chart: { type: "bar", title: "Stores by state", format: "number", data },
      };
    }

    case "transactions": {
      const series = details ? details.txnsOverTime : overview.txnsOverTime;
      const total = details ? details.state.txns : overview.kpis.transactions;
      return {
        text: `${where} had ${number(total)} transactions (${scope}).`,
        chart: {
          type: "line",
          title: `Transactions over time, ${state ? state.code : "Australia"}`,
          format: "number",
          labels: series.labels,
          series: [{ name: "Transactions", values: series.values }],
        },
      };
    }

    case "customers": {
      if (details) {
        const best = top(details.customersByStore);
        return {
          text: `${where} had ${number(details.state.customers)} customers (${scope}). ${best.name} served the most, ${number(best.value)}.`,
          chart: { type: "bar", title: `Customers by store, ${state.code}`, format: "number", data: details.customersByStore },
        };
      }
      const data = overview.states.map((s) => ({ name: s.code, value: s.customers }));
      return {
        text: `Australia had ${number(overview.kpis.customers)} customers (${scope}). ${top(data).name} had the most, ${number(top(data).value)}.`,
        chart: { type: "bar", title: "Customers by state", format: "number", data },
      };
    }

    case "revenue": {
      if (details) {
        const best = details.revenueByStore[0];
        return {
          text: `${where} earned ${dollars(details.state.revenue)} (${scope}). Its top store was ${best.name} with ${dollars(best.value)}.`,
          chart: { type: "bar", title: `Top stores by revenue, ${state.code}`, format: "revenue", data: details.revenueByStore },
        };
      }
      // Falls through to the country view by state.
    }
    // eslint-disable-next-line no-fallthrough
    default: {
      const data = overview.states.map((s) => ({ name: s.code, value: s.revenue }));
      return {
        text: `Australia earned ${dollars(sum(data.map((d) => d.value)))} (${scope}). ${top(data).name} led with ${dollars(top(data).value)}.`,
        chart: { type: "bar", title: "Revenue by state", format: "revenue", data },
      };
    }
  }
}
