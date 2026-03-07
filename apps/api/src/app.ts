import { Hono } from "hono";
import { cors } from "hono/cors";
import { projectRoutes } from "./routes/projects";
import { skillRoutes } from "./routes/skills";
import { renderRoutes } from "./routes/renders";

export const app = new Hono();

app.use("*", cors());

app.get("/", (c) =>
  c.json({ name: "Virtue API", version: "0.1.0", status: "operational" })
);

app.route("/api/projects", projectRoutes);
app.route("/api/skills", skillRoutes);
app.route("/api/renders", renderRoutes);
