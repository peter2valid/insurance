/**
 * Netlify scheduled function: runs the automations every hour by calling
 * /api/cron on this site. Needs CRON_SECRET set in Netlify's environment
 * variables (the same value the app checks).
 */
async function runAutomations() {
  const site = process.env.URL;
  const secret = process.env.CRON_SECRET;
  if (!site || !secret) return new Response("CRON_SECRET or URL not set", { status: 200 });
  const response = await fetch(`${site}/api/cron`, { headers: { Authorization: `Bearer ${secret}` } });
  return new Response(`automations: ${response.status}`, { status: 200 });
}

export default runAutomations;

export const config = { schedule: "@hourly" };
