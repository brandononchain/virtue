import { Hono } from "hono";
import { cors } from "hono/cors";
import { projectRoutes } from "./routes/projects";
import { skillRoutes } from "./routes/skills";
import { renderRoutes } from "./routes/renders";
import { sceneRoutes } from "./routes/scenes";
import { store } from "./services/store";

export const app = new Hono();

app.use("*", cors());

app.get("/", (c) =>
  c.json({ name: "Virtue API", version: "0.1.0", status: "operational" })
);

app.get("/api/stats", (c) => {
  const projects = store.listProjects();
  const jobs = store.listRenderJobs();
  return c.json({
    projects: projects.length,
    scenes: projects.reduce((n, p) => n + p.scenes.length, 0),
    shots: projects.reduce(
      (n, p) => n + p.scenes.reduce((m, s) => m + s.shots.length, 0),
      0
    ),
    renders: {
      total: jobs.length,
      completed: jobs.filter((j) => j.status === "completed").length,
      active: jobs.filter(
        (j) =>
          j.status === "generating" ||
          j.status === "preparing" ||
          j.status === "post-processing"
      ).length,
      queued: jobs.filter((j) => j.status === "queued").length,
      failed: jobs.filter((j) => j.status === "failed").length,
    },
    skills: store.skills.length,
  });
});

app.route("/api/projects", projectRoutes);
app.route("/api/skills", skillRoutes);
app.route("/api/renders", renderRoutes);
app.route("/api/scenes", sceneRoutes);
