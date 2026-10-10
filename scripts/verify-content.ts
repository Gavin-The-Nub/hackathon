import * as fs from 'fs';
import * as path from 'path';
import { PROBLEMS } from '../src/content/data';
import { runProblemTests } from '../src/core/harness/run-tests';
import { checkConstructs } from '../src/core/genuine/constructs';

function cleanString(str: string): string {
  return str.replace(/\s+/g, '').toLowerCase();
}

function verify() {
  console.log(`Starting content verification for ${PROBLEMS.length} problems...`);

  const assetsDir = path.join(__dirname, '../assets/content/javascript/problems');
  fs.mkdirSync(assetsDir, { recursive: true });

  const stages = [
    { concept: 'variables_types', problemIds: [] as string[] },
    { concept: 'conditionals', problemIds: [] as string[] },
    { concept: 'loops', problemIds: [] as string[] },
    { concept: 'functions', problemIds: [] as string[] },
    { concept: 'arrays_lists', problemIds: [] as string[] },
  ];

  for (const p of PROBLEMS) {
    // 1. Check word limits on conceptNote (<= 150 words)
    const wordCount = p.conceptNote.trim().split(/\s+/).length;
    if (wordCount > 150) {
      throw new Error(`Problem ${p.id} conceptNote exceeds 150 words (${wordCount} words).`);
    }

    // 2. Check hint constraints: no ``` and no 12+ char substring of referenceSolution
    const cleanRef = cleanString(p.referenceSolution);
    for (let i = 0; i < p.prewrittenHints.length; i++) {
      const hint = p.prewrittenHints[i];
      if (hint.includes('```')) {
        throw new Error(`Problem ${p.id} hint ${i + 1} contains fenced code block.`);
      }
      const cleanHint = cleanString(hint);
      for (let j = 0; j <= cleanRef.length - 12; j++) {
        const sub = cleanRef.substring(j, j + 12);
        if (cleanHint.includes(sub)) {
          throw new Error(`Problem ${p.id} hint ${i + 1} leaks substring '${sub}' of reference.`);
        }
      }
    }

    if (p.language === 'javascript') {
      // 3. Check reference solution passes all visible tests and 200 hidden samples
      const evalRef = new Function(`return (${p.referenceSolution})`)();
      const refRun = runProblemTests(
        {
          ...p,
          hiddenTests: {
            ...p.hiddenTests,
            count: 200,
          },
        },
        evalRef,
        evalRef,
        { seed: 12345 }
      );

      if (refRun.status !== 'tests_passed') {
        throw new Error(`Reference solution for ${p.id} failed tests: ${JSON.stringify(refRun.firstFailing)}`);
      }

      // 4. Check construct verification on reference solution
      const constructRes = checkConstructs(p.referenceSolution, p.functionName, p.requiredConstructs);
      if (constructRes.label !== 'GENUINE') {
        throw new Error(`Reference solution for ${p.id} did not satisfy constructs: ${constructRes.reason}`);
      }

      // 5. Check every mistake variant fails at least one test
      for (const cm of p.commonMistakes) {
        const evalVariant = new Function(`return (${cm.variantCode})`)();
        const variantRun = runProblemTests(p, evalVariant, evalRef, { seed: 12345 });
        if (variantRun.status === 'tests_passed') {
          throw new Error(
            `Mistake variant ${cm.tag} for problem ${p.id} unexpectedly passed all tests!`
          );
        }
      }

      // Save JSON to assets/content/javascript/problems/<id>.json
      fs.writeFileSync(path.join(assetsDir, `${p.id}.json`), JSON.stringify(p, null, 2), 'utf-8');

      // Add to stage
      const stage = stages.find((s) => s.concept === p.primaryConcept);
      if (stage) {
        stage.problemIds.push(p.id);
      }
    } else {
      // Python problem: save to python assets
      const pyAssetsDir = path.join(__dirname, '../assets/content/python/problems');
      fs.mkdirSync(pyAssetsDir, { recursive: true });
      fs.writeFileSync(path.join(pyAssetsDir, `${p.id}.json`), JSON.stringify(p, null, 2), 'utf-8');
    }
  }

  // Write roadmap.json
  const roadmap = {
    language: 'javascript',
    title: 'JavaScript Basics',
    stages,
  };
  fs.writeFileSync(
    path.join(__dirname, '../assets/content/javascript/roadmap.json'),
    JSON.stringify(roadmap, null, 2),
    'utf-8'
  );

  console.log(`✅ All ${PROBLEMS.length} problems verified and synced to assets successfully!`);
}

verify();
