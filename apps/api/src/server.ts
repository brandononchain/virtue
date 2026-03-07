import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { registry } from "./services/orchestrator.js";
import { seedMockData } from "./services/seed.js";

seedMockData();

const port = parseInt(process.env.API_PORT || "4000", 10);
const providerNames = registry.list().map((p) => p.name).join(", ");

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Virtue API running on http://localhost:${info.port}`);
  console.log(`  Providers: ${providerNames}`);
  console.log(`  Mock data seeded: 3 projects, 5 render jobs`);
});
