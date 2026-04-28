import type { Dataset } from "@/types";

// ---------------------------------------------------------------------------
// Deterministic PRNG so that the mock data is stable across reloads. This is
// important for the prototype: it keeps demos reproducible and lets us snapshot
// dashboards without fighting non-determinism.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const randIn = (min: number, max: number) => min + rand() * (max - min);
const randInt = (min: number, max: number) => Math.floor(randIn(min, max + 1));
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

// ---------------------------------------------------------------------------
// 1. Sales — a wide fact table you can slice by region/category/segment.
// ---------------------------------------------------------------------------
const regions = ["North America", "Europe", "Asia Pacific", "LATAM", "MEA"];
const categories = ["Software", "Hardware", "Services", "Subscriptions"];
const segments = ["Enterprise", "Mid-Market", "SMB"];
const channels = ["Direct", "Partner", "Online"];

function buildSalesData() {
  const rows: Record<string, any>[] = [];
  const start = new Date("2024-01-01").getTime();
  for (let i = 0; i < 720; i++) {
    const date = new Date(start + i * 24 * 3600 * 1000);
    // Multiple records per day across regions to make slicing meaningful.
    for (const region of regions) {
      const seasonality =
        1 + 0.3 * Math.sin((i / 365) * 2 * Math.PI) + (region === "Asia Pacific" ? 0.15 : 0);
      const baseRev = randIn(8000, 26000) * seasonality;
      rows.push({
        date: date.toISOString().slice(0, 10),
        region,
        category: pick(categories),
        segment: pick(segments),
        channel: pick(channels),
        revenue: Math.round(baseRev),
        cost: Math.round(baseRev * randIn(0.45, 0.7)),
        units: randInt(20, 350),
        deals: randInt(2, 18),
        discount: Math.round(randIn(0, 0.18) * 100) / 100,
      });
    }
  }
  return rows;
}

const salesDataset: Dataset = {
  id: "sales",
  name: "Sales Performance",
  description: "Daily sales transactions by region, category, segment, and channel.",
  category: "Revenue",
  icon: "TrendingUp",
  fields: [
    { key: "date", label: "Date", type: "date", role: "dimension", format: "shortDate" },
    { key: "region", label: "Region", type: "string", role: "dimension" },
    { key: "category", label: "Category", type: "string", role: "dimension" },
    { key: "segment", label: "Segment", type: "string", role: "dimension" },
    { key: "channel", label: "Channel", type: "string", role: "dimension" },
    { key: "revenue", label: "Revenue", type: "number", role: "measure", format: "currency" },
    { key: "cost", label: "Cost", type: "number", role: "measure", format: "currency" },
    { key: "units", label: "Units", type: "number", role: "measure", format: "number" },
    { key: "deals", label: "Deals", type: "number", role: "measure", format: "number" },
    { key: "discount", label: "Discount", type: "number", role: "measure", format: "percent" },
  ],
  rows: buildSalesData(),
};

// ---------------------------------------------------------------------------
// 2. Marketing — multi-channel performance for funnels and conversion charts.
// ---------------------------------------------------------------------------
const marketingChannels = [
  "Paid Search",
  "Organic Search",
  "Display",
  "Email",
  "Social",
  "Affiliate",
  "Direct",
];
const campaignTypes = ["Awareness", "Consideration", "Conversion", "Retention"];

function buildMarketingData() {
  const rows: Record<string, any>[] = [];
  const start = new Date("2024-06-01").getTime();
  for (let i = 0; i < 180; i++) {
    const date = new Date(start + i * 24 * 3600 * 1000);
    for (const channel of marketingChannels) {
      const impressions = randInt(20000, 220000);
      const ctr = randIn(0.008, 0.075);
      const clicks = Math.round(impressions * ctr);
      const cvr = randIn(0.012, 0.09);
      const conversions = Math.round(clicks * cvr);
      const cpc = randIn(0.4, 4.5);
      const spend = Math.round(clicks * cpc);
      rows.push({
        date: date.toISOString().slice(0, 10),
        channel,
        campaignType: pick(campaignTypes),
        impressions,
        clicks,
        conversions,
        spend,
        revenue: Math.round(conversions * randIn(60, 240)),
        ctr: Math.round(ctr * 10000) / 100,
        cvr: Math.round(cvr * 10000) / 100,
      });
    }
  }
  return rows;
}

const marketingDataset: Dataset = {
  id: "marketing",
  name: "Marketing Performance",
  description: "Daily marketing channel KPIs: impressions, clicks, conversions, spend.",
  category: "Marketing",
  icon: "Megaphone",
  fields: [
    { key: "date", label: "Date", type: "date", role: "dimension", format: "shortDate" },
    { key: "channel", label: "Channel", type: "string", role: "dimension" },
    { key: "campaignType", label: "Campaign Type", type: "string", role: "dimension" },
    { key: "impressions", label: "Impressions", type: "number", role: "measure", format: "number" },
    { key: "clicks", label: "Clicks", type: "number", role: "measure", format: "number" },
    { key: "conversions", label: "Conversions", type: "number", role: "measure", format: "number" },
    { key: "spend", label: "Spend", type: "number", role: "measure", format: "currency" },
    { key: "revenue", label: "Revenue", type: "number", role: "measure", format: "currency" },
    { key: "ctr", label: "CTR", type: "number", role: "measure", format: "percent" },
    { key: "cvr", label: "CVR", type: "number", role: "measure", format: "percent" },
  ],
  rows: buildMarketingData(),
};

// ---------------------------------------------------------------------------
// 3. User Growth — DAU / MAU / signups for product analytics.
// ---------------------------------------------------------------------------
const plans = ["Free", "Pro", "Team", "Enterprise"];
const platforms = ["iOS", "Android", "Web"];

function buildUserGrowth() {
  const rows: Record<string, any>[] = [];
  const start = new Date("2023-01-01").getTime();
  let baseDau = 12000;
  for (let i = 0; i < 850; i++) {
    const date = new Date(start + i * 24 * 3600 * 1000);
    baseDau *= 1 + randIn(-0.005, 0.012);
    for (const platform of platforms) {
      const platformShare = platform === "Web" ? 0.55 : platform === "iOS" ? 0.27 : 0.18;
      const dau = Math.round(baseDau * platformShare * randIn(0.9, 1.1));
      const newUsers = Math.round(dau * randIn(0.02, 0.06));
      const churn = Math.round(dau * randIn(0.005, 0.02));
      rows.push({
        date: date.toISOString().slice(0, 10),
        platform,
        plan: pick(plans),
        dau,
        mau: Math.round(dau * randIn(2.4, 3.4)),
        newUsers,
        churnedUsers: churn,
        sessions: Math.round(dau * randIn(1.4, 2.2)),
        avgSessionMin: Math.round(randIn(4, 17) * 10) / 10,
      });
    }
  }
  return rows;
}

const userGrowthDataset: Dataset = {
  id: "userGrowth",
  name: "User Growth",
  description: "Daily active users, signups, churn segmented by plan and platform.",
  category: "Product",
  icon: "Users",
  fields: [
    { key: "date", label: "Date", type: "date", role: "dimension", format: "shortDate" },
    { key: "platform", label: "Platform", type: "string", role: "dimension" },
    { key: "plan", label: "Plan", type: "string", role: "dimension" },
    { key: "dau", label: "DAU", type: "number", role: "measure", format: "number" },
    { key: "mau", label: "MAU", type: "number", role: "measure", format: "number" },
    { key: "newUsers", label: "New Users", type: "number", role: "measure", format: "number" },
    { key: "churnedUsers", label: "Churned Users", type: "number", role: "measure", format: "number" },
    { key: "sessions", label: "Sessions", type: "number", role: "measure", format: "number" },
    { key: "avgSessionMin", label: "Avg Session (min)", type: "number", role: "measure", format: "number" },
  ],
  rows: buildUserGrowth(),
};

// ---------------------------------------------------------------------------
// 4. Financial KPIs — monthly P&L style data for forecasts and KPI cards.
// ---------------------------------------------------------------------------
function buildFinancials() {
  const rows: Record<string, any>[] = [];
  const start = new Date("2022-01-01").getTime();
  let mrr = 480000;
  for (let i = 0; i < 48; i++) {
    const date = new Date(new Date(start).setMonth(new Date(start).getMonth() + i));
    mrr *= 1 + randIn(0.005, 0.045);
    const newMrr = Math.round(mrr * randIn(0.05, 0.12));
    const expansionMrr = Math.round(mrr * randIn(0.02, 0.06));
    const churnedMrr = Math.round(mrr * randIn(0.01, 0.04));
    const opex = Math.round(mrr * randIn(0.55, 0.78));
    rows.push({
      month: date.toISOString().slice(0, 7) + "-01",
      mrr: Math.round(mrr),
      newMrr,
      expansionMrr,
      churnedMrr,
      grossMargin: Math.round(randIn(62, 81) * 10) / 10,
      opex,
      ebitda: Math.round(mrr - opex),
      cashBalance: Math.round(randIn(8_000_000, 22_000_000)),
      headcount: Math.round(80 + i * randIn(1.2, 2.4)),
    });
  }
  return rows;
}

const financialsDataset: Dataset = {
  id: "financials",
  name: "Financial KPIs",
  description: "Monthly revenue, MRR motion, opex, and headcount.",
  category: "Finance",
  icon: "Wallet",
  fields: [
    { key: "month", label: "Month", type: "date", role: "dimension", format: "shortDate" },
    { key: "mrr", label: "MRR", type: "number", role: "measure", format: "currency" },
    { key: "newMrr", label: "New MRR", type: "number", role: "measure", format: "currency" },
    { key: "expansionMrr", label: "Expansion MRR", type: "number", role: "measure", format: "currency" },
    { key: "churnedMrr", label: "Churned MRR", type: "number", role: "measure", format: "currency" },
    { key: "grossMargin", label: "Gross Margin", type: "number", role: "measure", format: "percent" },
    { key: "opex", label: "Opex", type: "number", role: "measure", format: "currency" },
    { key: "ebitda", label: "EBITDA", type: "number", role: "measure", format: "currency" },
    { key: "cashBalance", label: "Cash Balance", type: "number", role: "measure", format: "currency" },
    { key: "headcount", label: "Headcount", type: "number", role: "measure", format: "number" },
  ],
  rows: buildFinancials(),
};

// ---------------------------------------------------------------------------
// 5. Product Analytics — funnel + cohort + feature usage.
// ---------------------------------------------------------------------------
const features = [
  "Dashboards",
  "Reports",
  "Alerts",
  "AI Copilot",
  "API",
  "Mobile App",
  "Embedded Analytics",
  "SSO",
];
const funnelSteps = [
  "Visited",
  "Signed Up",
  "Activated",
  "First Insight",
  "Invited Team",
  "Subscribed",
];

function buildProductAnalytics() {
  const rows: Record<string, any>[] = [];
  const start = new Date("2025-01-01").getTime();
  for (let i = 0; i < 90; i++) {
    const date = new Date(start + i * 24 * 3600 * 1000);
    for (const feature of features) {
      rows.push({
        date: date.toISOString().slice(0, 10),
        feature,
        users: randInt(800, 9500),
        events: randInt(2000, 60000),
        adoptionRate: Math.round(randIn(8, 78) * 10) / 10,
        satisfaction: Math.round(randIn(3.4, 4.9) * 10) / 10,
      });
    }
    let visitors = randInt(8000, 15000);
    for (const step of funnelSteps) {
      rows.push({
        date: date.toISOString().slice(0, 10),
        funnelStep: step,
        users: visitors,
        events: visitors,
        adoptionRate: 0,
        satisfaction: 0,
        feature: "Funnel",
      });
      visitors = Math.round(visitors * randIn(0.55, 0.82));
    }
  }
  return rows;
}

const productAnalyticsDataset: Dataset = {
  id: "productAnalytics",
  name: "Product Analytics",
  description: "Feature usage, funnel steps, satisfaction by day.",
  category: "Product",
  icon: "Boxes",
  fields: [
    { key: "date", label: "Date", type: "date", role: "dimension", format: "shortDate" },
    { key: "feature", label: "Feature", type: "string", role: "dimension" },
    { key: "funnelStep", label: "Funnel Step", type: "string", role: "dimension" },
    { key: "users", label: "Users", type: "number", role: "measure", format: "number" },
    { key: "events", label: "Events", type: "number", role: "measure", format: "number" },
    { key: "adoptionRate", label: "Adoption Rate", type: "number", role: "measure", format: "percent" },
    { key: "satisfaction", label: "Satisfaction", type: "number", role: "measure", format: "number" },
  ],
  rows: buildProductAnalytics(),
};

export const MOCK_DATASETS: Dataset[] = [
  salesDataset,
  marketingDataset,
  userGrowthDataset,
  financialsDataset,
  productAnalyticsDataset,
];
