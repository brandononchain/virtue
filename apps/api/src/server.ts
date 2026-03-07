import { serve } from "@hono/node-server";
import { app } from "./app";
import { seedMockData } from "./services/seed";

seedMockData();

const port = parseInt(process.env.API_PORT || "4000", 10);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Virtue API running on http://localhost:${info.port}`);
  console.log(`  Mock data seeded: 3 projects, 5 render jobs`);
});
