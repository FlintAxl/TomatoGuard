/**
 * Patch @expo/ngrok to use system ngrok v3 instead of bundled v2.x
 * 
 * WHY: Expo bundles ngrok v2.3.41 which was blocked by ngrok servers on 2/17/2026.
 * This script patches the @expo/ngrok package to use the system-installed ngrok v3.
 * 
 * Run automatically after `npm install` via the postinstall script in package.json.
 * Can also be run manually: node scripts/patch-ngrok.js
 */

const fs = require("fs");
const path = require("path");

const nodeModules = path.join(__dirname, "..", "node_modules");

function patchFile(relativePath, description, patchFn) {
  const filePath = path.join(nodeModules, relativePath);
  if (!fs.existsSync(filePath)) {
    console.log(`  [SKIP] ${relativePath} (file not found)`);
    return false;
  }
  const original = fs.readFileSync(filePath, "utf8");
  const patched = patchFn(original);
  if (original === patched) {
    console.log(`  [OK]   ${relativePath} (already patched)`);
    return true;
  }
  fs.writeFileSync(filePath, patched, "utf8");
  console.log(`  [DONE] ${relativePath} - ${description}`);
  return true;
}

console.log("\n=== Patching @expo/ngrok for ngrok v3 compatibility ===\n");

// 1. Patch @expo/ngrok-bin/index.js - Use system ngrok instead of bundled v2
patchFile("@expo/ngrok-bin/index.js", "Use system ngrok v3", (content) => {
  // Check if already patched
  if (content.includes("node_modules")) return content;
  return `// Patched: Use system ngrok (v3.36+) instead of bundled v2.x (blocked by ngrok servers after 2/17/2026)
var execSync = require("child_process").execSync;
try {
  var results = execSync("where ngrok", { encoding: "utf8" }).trim().split("\\n");
  // Skip node_modules/.bin shims and find the real system ngrok
  var systemNgrok = null;
  for (var i = 0; i < results.length; i++) {
    var p = results[i].trim();
    if (p && p.indexOf("node_modules") === -1) {
      systemNgrok = p;
      break;
    }
  }
  if (systemNgrok) {
    module.exports = systemNgrok;
  } else {
    throw new Error("System ngrok not found (only found node_modules shims)");
  }
} catch (e) {
  // Fallback to bundled binary
  try {
    module.exports = require.resolve(
      "@expo/ngrok-bin-" +
        process.platform +
        "-" +
        process.arch +
        (process.platform === "win32" ? "/ngrok.exe" : "/ngrok")
    );
  } catch (e2) {
    module.exports = null;
  }
}
`;
});

// 2. Patch @expo/ngrok/src/process.js - Add shell:true for Windows MSIX + fix authtoken command for v3
patchFile("@expo/ngrok/src/process.js", "Fix spawn for Windows + ngrok v3 authtoken", (content) => {
  // Check if already patched
  if (content.includes("shell: process.platform")) return content;

  // Fix spawn in startProcess - add shell: true
  content = content.replace(
    /const ngrok = spawn\(bin, start, \{ windowsHide: true \}\);/,
    "const ngrok = spawn(bin, start, { windowsHide: true, shell: process.platform === 'win32' });"
  );

  // Fix authtoken command for ngrok v3 (authtoken -> config add-authtoken)
  content = content.replace(
    /const authtoken = \["authtoken", token\];/,
    'const authtoken = ["config", "add-authtoken", token];'
  );

  // Fix spawn in setAuthtoken - add shell: true
  content = content.replace(
    /const ngrok = spawn\(bin, authtoken, \{ windowsHide: true \}\);/,
    "const ngrok = spawn(bin, authtoken, { windowsHide: true, shell: process.platform === 'win32' });"
  );

  // Fix setAuthtoken promise handling for ngrok v3 (v3 outputs differently)
  content = content.replace(
    /const killed = new Promise\(\(resolve, reject\) => \{\s*ngrok\.stdout\.once\("data", \(\) => resolve\(\)\);\s*ngrok\.stderr\.once\("data", \(\) => reject\(new Error\("cant set authtoken"\)\)\);\s*ngrok\.on\("error", \(err\) => reject\(err\)\);\s*\}\);/,
    `const killed = new Promise((resolve, reject) => {
    let stdoutData = "";
    let stderrData = "";
    ngrok.stdout.on("data", (data) => { stdoutData += data.toString(); });
    ngrok.stderr.on("data", (data) => { stderrData += data.toString(); });
    ngrok.on("close", (code) => {
      if (code === 0 || stdoutData.includes("Authtoken saved")) {
        resolve();
      } else {
        reject(new Error("cant set authtoken: " + stderrData));
      }
    });
    ngrok.on("error", (err) => reject(err));
  });`
  );

  return content;
});

// 3. Patch @expo/ngrok/index.js - Filter tunnel options for ngrok v3 API
patchFile("@expo/ngrok/index.js", "Filter tunnel options for ngrok v3", (content) => {
  // Check if already patched
  if (content.includes("allowedFields")) return content;

  content = content.replace(
    /opts\.name = String\(opts\.name \|\| uuid\.v4\(\)\);\s*try \{\s*const response = await ngrokClient\.startTunnel\(opts\);/,
    `opts.name = String(opts.name || uuid.v4());
  // For ngrok v3: strip fields not accepted by the tunnel API
  const tunnelOpts = {};
  const allowedFields = ['name', 'proto', 'addr', 'hostname', 'subdomain', 'host_header', 'bind_tls', 'inspect', 'auth', 'region'];
  for (const key of Object.keys(opts)) {
    if (allowedFields.includes(key)) {
      tunnelOpts[key] = opts[key];
    }
  }
  try {
    const response = await ngrokClient.startTunnel(tunnelOpts);`
  );

  return content;
});

// 4. Patch AsyncNgrok.js - Increase tunnel timeout from 10s to 60s
patchFile(
  "expo/node_modules/@expo/cli/build/src/start/server/AsyncNgrok.js",
  "Increase tunnel timeout to 60s",
  (content) => {
    return content.replace(
      /const TUNNEL_TIMEOUT = 10 \* 1000;/,
      "const TUNNEL_TIMEOUT = 60 * 1000;"
    );
  }
);

console.log("\n=== Patching complete! ===\n");
