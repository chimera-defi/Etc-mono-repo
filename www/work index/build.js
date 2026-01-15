const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const baseDir = __dirname;
const sourcePath = path.join(baseDir, "projects.md");
const outputPath = path.join(baseDir, "index.html");

const markdown = fs.readFileSync(sourcePath, "utf8");
const content = marked.parse(markdown);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Work Index</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="page">
      <header class="topbar">
        <div class="brand">
          <span class="brand-mark"></span>
          <span class="brand-text">Work Index</span>
        </div>
        <p class="brand-subtitle">Markdown-sourced portfolio</p>
      </header>
      <main class="container">
        <article class="content">
          ${content}
        </article>
      </main>
    </div>
  </body>
</html>
`;

fs.writeFileSync(outputPath, html);

console.log(`Generated ${path.relative(baseDir, outputPath)}`);
