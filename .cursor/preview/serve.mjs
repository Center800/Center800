// Live preview server for the profile README.
// Serves a GitHub-styled render of README.md and auto-reloads on change.
import { createServer } from "node:http";
import { watch } from "node:fs";
import { resolve } from "node:path";
import { renderMarkdown } from "./render.mjs";

const PORT = Number(process.env.PREVIEW_PORT || 4321);
const README = resolve(process.env.PREVIEW_FILE || "README.md");

const RELOAD_SNIPPET = `
<script>
  const es = new EventSource("/events");
  es.onmessage = () => location.reload();
</script>`;

const clients = new Set();

const server = createServer((req, res) => {
  if (req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
    return;
  }

  try {
    const html = renderMarkdown(README).replace("</body>", `${RELOAD_SNIPPET}\n</body>`);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Render error: " + err.message);
  }
});

watch(README, () => {
  for (const client of clients) client.write("data: reload\n\n");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`README preview server listening on http://localhost:${PORT} (watching ${README})`);
});
