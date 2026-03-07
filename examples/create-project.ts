/**
 * Example: Create a project, add scenes and shots, attach skills, submit renders.
 *
 * Run with: npx tsx examples/create-project.ts
 * (Requires the API to be running on localhost:4000)
 */

const API = "http://localhost:4000";

async function main() {
  // 1. Create project
  const project = await post("/api/projects", {
    name: "Neon City",
    description: "A cyberpunk short film about a rogue android",
  });
  console.log("Created project:", project.id);

  // 2. Add scene
  const withScene = await post(`/api/projects/${project.id}/scenes`, {
    title: "Opening — City Reveal",
    description: "Drone establishing shot over neon-lit cityscape",
    location: "Neo Tokyo",
    timeOfDay: "night",
    mood: "awe",
  });
  const scene = withScene.scenes[0];
  console.log("Added scene:", scene.title);

  // 3. Add shots
  const withShot = await post(
    `/api/projects/${project.id}/scenes/${scene.id}/shots`,
    {
      shotType: "aerial",
      description: "Slow drone rise revealing the full skyline",
      prompt:
        "Cinematic drone shot rising over a neon-lit cyberpunk city at night, volumetric fog, rain-soaked streets below",
      durationSec: 6,
      cameraMove: "crane-up",
      lens: "24mm",
      lighting: "neon + volumetric",
    }
  );
  const shot = withShot.scenes[0].shots[0];
  console.log("Added shot:", shot.description);

  // 4. Submit render
  const job = await post("/api/renders", {
    projectId: project.id,
    sceneId: scene.id,
    shotId: shot.id,
  });
  console.log("Render job submitted:", job.id, "status:", job.status);

  // 5. Poll until complete
  let current = job;
  while (current.status !== "completed" && current.status !== "failed") {
    current = await post(`/api/renders/${current.id}/poll`, {});
    console.log(`  → ${current.status} (${current.progress}%)`);
  }

  console.log("\nDone!", current.output?.url || "No output");
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

main().catch(console.error);
