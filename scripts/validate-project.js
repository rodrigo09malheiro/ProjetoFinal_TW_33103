const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { generateHtmlReport } = require("./report-html");

const args = process.argv.slice(2);
const argSet = new Set(args);
const rootIndex = args.indexOf("--root");
const providedRoot = rootIndex >= 0 ? args[rootIndex + 1] : null;
const projectRoot = providedRoot
  ? path.resolve(providedRoot)
  : path.resolve(__dirname, "..");
const htmlIndex = args.indexOf("--html");
const htmlOutputPath =
  htmlIndex >= 0 && args[htmlIndex + 1]
    ? path.resolve(args[htmlIndex + 1])
    : path.join(projectRoot, "grade-report.html");

const requiredPaths = [
  "src",
  "src/server.js",
  "src/app.js",
  "src/config",
  "src/config/swagger.js",
  "src/routes",
  "src/controllers",
  "src/models",
  "README.md",
  "PROJECT_INFO.md",
];

const isGradeMode = argSet.has("--grade");

const missingPaths = requiredPaths.filter((relativePath) => {
  const fullPath = path.join(projectRoot, relativePath);
  return !fs.existsSync(fullPath);
});

if (!isGradeMode) {
  if (missingPaths.length > 0) {
    console.error("Project validation failed. Missing required files/folders:");
    missingPaths.forEach((missing) => {
      console.error(`- ${missing}`);
    });
    process.exit(1);
  }
  console.log(
    "Project validation passed. All required files/folders are present.",
  );
  process.exit(0);
}

// ── Weights ────────────────────────────────────────────────────────────────────

const MAX_SCORE = 20;
const weights = { structure: 10, lint: 5, syntax: 5 };

// ── Static analysis ────────────────────────────────────────────────────────────

const walkJs = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkJs(full));
    else if (entry.name.endsWith(".js")) results.push(full);
  }
  return results;
};

const readSafe = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
};

const analyseProject = () => {
  const srcDir = path.join(projectRoot, "src");
  const routesDir = path.join(srcDir, "routes");
  const controllersDir = path.join(srcDir, "controllers");
  const modelsDir = path.join(srcDir, "models");
  const configDir = path.join(srcDir, "config");

  const routeFiles = walkJs(routesDir).filter(
    (f) => path.basename(f) !== "index.js",
  );
  const controllerFiles = walkJs(controllersDir);
  const modelFiles = walkJs(modelsDir);

  const allRouteContent = walkJs(routesDir)
    .map((f) => readSafe(f))
    .join("\n");

  const hasGet = /router\.get\s*\(/.test(allRouteContent);
  const hasPost = /router\.post\s*\(/.test(allRouteContent);
  const hasPut = /router\.(put|patch)\s*\(/.test(allRouteContent);
  const hasDelete = /router\.delete\s*\(/.test(allRouteContent);
  const crudVerbs = [hasGet, hasPost, hasPut, hasDelete].filter(Boolean).length;

  const swaggerConfigPath = path.join(configDir, "swagger.js");
  const swaggerContent = readSafe(swaggerConfigPath);
  const hasSwagger =
    fs.existsSync(swaggerConfigPath) && swaggerContent.length > 100;

  const hasEnvExample = fs.existsSync(path.join(projectRoot, ".env.example"));

  const infoPath = path.join(projectRoot, "PROJECT_INFO.md");
  const infoContent = readSafe(infoPath);
  const defaultFields = [
    "Student 1:",
    "Student 2:",
    "- API name:",
    "- API link:",
    "- Link:",
  ];
  const unfilledFields = defaultFields.filter((f) => infoContent.includes(f));

  const appContent = readSafe(path.join(srcDir, "app.js"));
  const isDefaultApp = appContent.includes(
    "webtech-final-project-backend-template",
  );

  return {
    routeFiles: routeFiles.length,
    controllers: controllerFiles.length,
    models: modelFiles.length,
    crudVerbs,
    hasGet,
    hasPost,
    hasPut,
    hasDelete,
    hasSwagger,
    hasEnvExample,
    infoFilled: unfilledFields.length === 0,
    unfilledFields,
    isDefaultApp,
  };
};

const analysis = analyseProject();

// ── Helpers ───────────────────────────────────────────────────────────────────

const safeOutput = (value) => {
  const text = (value || "").trim();
  return text.length <= 2000 ? text : `${text.slice(0, 2000)}\n... (truncated)`;
};

const escapeRegex = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractSection = (content, title) => {
  const m = content.match(
    new RegExp(`## ${escapeRegex(title)}\\n([\\s\\S]*?)(?=\\n## |$)`),
  );
  return m ? m[1].trim() : "";
};

const parseProjectInfo = () => {
  const infoPath = path.join(projectRoot, "PROJECT_INFO.md");
  if (!fs.existsSync(infoPath))
    return {
      groupMembers: [],
      projectTheme: "",
      apiName: "",
      apiLink: "",
      apiKey: "",
      frontendLink: "",
    };

  const content = fs.readFileSync(infoPath, "utf8");
  const groupText = extractSection(content, "Group Members");
  const themeText = extractSection(content, "Project Theme");
  const apiText = extractSection(content, "External API Used");
  const frontendText = extractSection(content, "Frontend Repository");

  const groupMembers = groupText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-"))
    .map((l) => l.replace(/^[-\s]+/, "").trim())
    .filter(Boolean);

  const apiName =
    apiText
      .split("\n")
      .find((l) => l.toLowerCase().startsWith("- api name:")) || "";
  const apiLink =
    apiText
      .split("\n")
      .find((l) => l.toLowerCase().startsWith("- api link:")) || "";
  const apiKey =
    apiText
      .split("\n")
      .find((l) => l.toLowerCase().startsWith("- requires api key")) || "";
  const frontendLink =
    frontendText
      .split("\n")
      .find((l) => l.toLowerCase().startsWith("- link:")) || "";

  return {
    groupMembers,
    projectTheme: (themeText.split("\n").find((l) => l.trim()) || "").trim(),
    apiName: apiName.replace(/^[-\s]*api name:\s*/i, "").trim(),
    apiLink: apiLink.replace(/^[-\s]*api link:\s*/i, "").trim(),
    apiKey: apiKey.replace(/^[-\s]*requires api key\??\s*/i, "").trim(),
    frontendLink: frontendLink.replace(/^[-\s]*link:\s*/i, "").trim(),
  };
};

const runNpmScript = (scriptName) => {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npm, ["run", scriptName], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  return {
    status: result.status === 0 ? "pass" : "fail",
    exitCode: result.status,
    output: safeOutput(`${result.stdout || ""}${result.stderr || ""}`),
  };
};

// ── Run checks ────────────────────────────────────────────────────────────────

const structureScorePerItem = weights.structure / requiredPaths.length;
const structureScore = Math.max(
  0,
  weights.structure - structureScorePerItem * missingPaths.length,
);
const structureStatus = missingPaths.length === 0 ? "pass" : "fail";

const report = {
  score: 0,
  maxScore: MAX_SCORE,
  percentage: 0,
  checks: {
    structure: {
      status: structureStatus,
      score: Number(structureScore.toFixed(2)),
      maxScore: weights.structure,
      missing: missingPaths,
    },
    lint: { status: "skipped", score: 0, maxScore: weights.lint, output: "" },
    syntax: {
      status: "skipped",
      score: 0,
      maxScore: weights.syntax,
      output: "",
    },
  },
};

if (structureStatus === "pass") {
  const lintResult = runNpmScript("lint");
  report.checks.lint = {
    ...lintResult,
    score: lintResult.status === "pass" ? weights.lint : 0,
    maxScore: weights.lint,
  };

  const syntaxResult = runNpmScript("syntax");
  report.checks.syntax = {
    ...syntaxResult,
    score: syntaxResult.status === "pass" ? weights.syntax : 0,
    maxScore: weights.syntax,
  };
}

const totalScore =
  report.checks.structure.score +
  report.checks.lint.score +
  report.checks.syntax.score;

report.score = Number(totalScore.toFixed(2));
report.percentage = Number(((report.score / MAX_SCORE) * 100).toFixed(2));

const projectInfo = parseProjectInfo();

const reportHtml = generateHtmlReport(report, projectInfo, analysis, {
  groupLabel: "Grupo",
});

fs.writeFileSync(htmlOutputPath, reportHtml, "utf8");

console.log(`\nGrade report (0-20)`);
console.log(`Score: ${report.score}/${MAX_SCORE} (${report.percentage}%)`);
console.log(
  `Structure : ${report.checks.structure.score}/${weights.structure} (${report.checks.structure.status})`,
);
if (missingPaths.length > 0) {
  missingPaths.forEach((m) => console.log(`  - ${m}`));
}
console.log(
  `Lint      : ${report.checks.lint.score}/${weights.lint} (${report.checks.lint.status})`,
);
console.log(
  `Syntax    : ${report.checks.syntax.score}/${weights.syntax} (${report.checks.syntax.status})`,
);
console.log(`\nHTML report: ${htmlOutputPath}`);

process.exit(0);