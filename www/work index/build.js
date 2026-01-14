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
    <main class="container">
      ${content}
    </main>
  </body>
</html>
`;

fs.writeFileSync(outputPath, html);

console.log(`Generated ${path.relative(baseDir, outputPath)}`);
