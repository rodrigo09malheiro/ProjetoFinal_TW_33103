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
  "src/app",
  "src/app/core",
  "src/app/core/services",
  "src/app/core/models",
  "src/app/features",
  "src/app/shared",
  "src/app/app.routes.ts",
  "src/app/app.config.ts",
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
const weights = { structure: 10, lint: 5, build: 5 };

// ── Static analysis ────────────────────────────────────────────────────────────

const walkTs = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkTs(full));
    else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".spec.ts"))
      results.push(full);
  }
  return results;
};

const walkSpec = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkSpec(full));
    else if (entry.name.endsWith(".spec.ts")) results.push(full);
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
  const appDir = path.join(projectRoot, "src/app");
  const servicesDir = path.join(appDir, "core/services");
  const modelsDir = path.join(appDir, "core/models");
  const featuresDir = path.join(appDir, "features");
  const sharedDir = path.join(appDir, "shared");
  const routesPath = path.join(appDir, "app.routes.ts");
  const infoPath = path.join(projectRoot, "PROJECT_INFO.md");

  const components = walkTs(appDir).filter((f) =>
    path.basename(f).endsWith(".component.ts"),
  );
  const services = walkTs(servicesDir).filter((f) =>
    path.basename(f).endsWith(".service.ts"),
  );
  const routesContent = readSafe(routesPath);
  const routeMatches = routesContent.match(/path\s*:/g) || [];

  const infoContent = readSafe(infoPath);
  const defaultFields = [
    "Student 1:",
    "Student 2:",
    "- API name:",
    "- API link:",
    "- Link:",
  ];
  const unfilledFields = defaultFields.filter((f) => infoContent.includes(f));

  const appContent = readSafe(path.join(appDir, "app.component.ts"));

  return {
    components: components.length,
    services: services.length,
    models: walkTs(modelsDir).length,
    featureFiles: walkTs(featuresDir).length,
    sharedFiles: walkTs(sharedDir).length,
    specFiles: walkSpec(appDir).length,
    hasRealRoutes: routeMatches.length > 1,
    routeCount: routeMatches.length,
    infoFilled: unfilledFields.length === 0,
    unfilledFields,
    isDefaultApp:
      appContent.includes("title = 'webtech") ||
      appContent.includes('title = "webtech'),
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
      backendLink: "",
    };

  const content = fs.readFileSync(infoPath, "utf8");
  const groupText = extractSection(content, "Group Members");
  const themeText = extractSection(content, "Project Theme");
  const apiText = extractSection(content, "External API Used");
  const backendText = extractSection(content, "Backend Repository");

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
  const backendLink =
    backendText
      .split("\n")
      .find((l) => l.toLowerCase().startsWith("- link:")) || "";

  return {
    groupMembers,
    projectTheme: (themeText.split("\n").find((l) => l.trim()) || "").trim(),
    apiName: apiName.replace(/^[-\s]*api name:\s*/i, "").trim(),
    apiLink: apiLink.replace(/^[-\s]*api link:\s*/i, "").trim(),
    apiKey: apiKey.replace(/^[-\s]*requires api key\??\s*/i, "").trim(),
    backendLink: backendLink.replace(/^[-\s]*link:\s*/i, "").trim(),
  };
};

const runNpmScript = (scriptName) => {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npm, ["run", scriptName], {
    cwd: projectRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
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
    build: { status: "skipped", score: 0, maxScore: weights.build, output: "" },
  },
};

if (structureStatus === "pass") {
  const lintResult = runNpmScript("lint");
  report.checks.lint = {
    ...lintResult,
    score: lintResult.status === "pass" ? weights.lint : 0,
    maxScore: weights.lint,
  };

  const buildResult = runNpmScript("build");
  report.checks.build = {
    ...buildResult,
    score: buildResult.status === "pass" ? weights.build : 0,
    maxScore: weights.build,
  };
}

const totalScore =
  report.checks.structure.score +
  report.checks.lint.score +
  report.checks.build.score;

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
  `Build     : ${report.checks.build.score}/${weights.build} (${report.checks.build.status})`,
);
console.log(`\nHTML report: ${htmlOutputPath}`);

process.exit(0);
teste
