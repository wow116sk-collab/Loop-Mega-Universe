// Build the single-file runnable HTML from the source .jsx
// usage: node build.mjs   ->  thaicolor-app-peak-v1.6.2.html
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "fs";

const r = await build({
  entryPoints: ["entry.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  loader: { ".jsx": "jsx", ".txt": "text" },
  define: { "process.env.NODE_ENV": '"production"' },
  write: false,
  logLevel: "warning",
});
const js = r.outputFiles[0].text;

const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>Thai Color — บัญชี/สต๊อก</title>
<style>
  html,body{margin:0;padding:0;background:#f6f7f9;-webkit-text-size-adjust:100%;}
  #root{min-height:100vh;}
  #boot{font-family:-apple-system,system-ui,sans-serif;padding:40px;text-align:center;color:#667;}
</style>
</head>
<body>
<div id="root"><div id="boot">กำลังเปิดโปรแกรม… / Loading…</div></div>
<script>${js.replace(/<\/script>/gi, "<\\/script>")}</script>
</body>
</html>
`;
writeFileSync("thaicolor-app-peak-v1.6.2.html", html);
console.log("built thaicolor-app-peak-v1.6.2.html", (html.length / 1048576).toFixed(2), "MB");
