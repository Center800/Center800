// Renders a Markdown file to a self-contained, GitHub-styled HTML page.
// `marked` is resolved from the global npm prefix (installed in `install`).
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

function loadMarked() {
  // Resolve `marked` from this directory's node_modules (installed in `install`).
  const require = createRequire(import.meta.url);
  return require("marked");
}

const GITHUB_CSS = `
:root { color-scheme: light dark; }
body { margin: 0; background: #f6f8fa; }
.markdown-body {
  box-sizing: border-box;
  max-width: 830px;
  margin: 32px auto;
  padding: 32px;
  background: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  color: #1f2328;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
}
.markdown-body h1, .markdown-body h2 {
  padding-bottom: .3em;
  border-bottom: 1px solid #d8dee4;
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}
.markdown-body h1 { font-size: 2em; }
.markdown-body h2 { font-size: 1.5em; }
.markdown-body ul { padding-left: 2em; }
.markdown-body li { margin-top: .25em; }
.markdown-body a { color: #0969da; text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body code {
  padding: .2em .4em;
  background: rgba(175,184,193,.2);
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace;
  font-size: 85%;
}
.markdown-body img { max-width: 100%; }
`;

export function renderMarkdown(markdownPath) {
  const { marked } = loadMarked();
  const md = readFileSync(markdownPath, "utf8");
  const body = marked.parse(md, { gfm: true, breaks: false });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>README preview</title>
<style>${GITHUB_CSS}</style>
</head>
<body>
<article class="markdown-body">
${body}
</article>
</body>
</html>`;
}

// Allow use as a CLI: `node render.mjs README.md > out.html`
if (import.meta.url === `file://${process.argv[1]}`) {
  const target = process.argv[2] || "README.md";
  process.stdout.write(renderMarkdown(target));
}
