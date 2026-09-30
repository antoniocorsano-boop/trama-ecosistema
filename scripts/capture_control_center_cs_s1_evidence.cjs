const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { promises: fs } = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve('.');
const outDir = path.resolve(process.env.TRAMA_CS_S1_EVIDENCE_DIR || 'artifacts/control-center-cs-s1');
const port = Number(process.env.TRAMA_CS_S1_PORT || 6011);
const exactHead = process.env.TRAMA_EXACT_HEAD || null;
const runId = process.env.TRAMA_RUN_ID || null;

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
]);

function resolveRequest(requestUrl) {
  const url = new URL(requestUrl || '/', `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(url.pathname === '/' ? '/experiments/control-center-cs-s1/native-popover.html' : url.pathname);
  const candidate = path.resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(root + path.sep)) return null;
  return candidate;
}

const server = createServer(async (req, res) => {
  try {
    const candidate = resolveRequest(req.url);
    if (!candidate) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const stat = await fs.stat(candidate);
    const file = stat.isDirectory() ? path.join(candidate, 'index.html') : candidate;
    const body = await fs.readFile(file);
    res.writeHead(200, {
      'Content-Type': types.get(path.extname(file)) || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

async function popoverOpen(locator) {
  return locator.evaluate((node) => node.matches(':popover-open'));
}

async function measure(page, selector) {
  return page.locator(selector).evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
    };
  });
}

await fs.mkdir(outDir, { recursive: true });
await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

const browser = await chromium.launch({ headless: true });
const evidence = {
  schemaVersion: 'trama.control-center.cs-s1-evidence/v1',
  exactHead,
  runId,
  generatedAt: new Date().toISOString(),
  runtimeChanged: false,
  dependencyAdoptionAuthorized: false,
  candidates: [],
};

try {
  for (const viewport of [
    { width: 390, height: 844, label: '390x844' },
    { width: 1024, height: 768, label: '1024x768' },
  ]) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    await page.goto(
      `http://127.0.0.1:${port}/experiments/control-center-cs-s1/native-popover.html`,
      { waitUntil: 'load' }
    );

    const support = await page.evaluate(() => ({
      popover: 'popover' in HTMLElement.prototype,
      popoverTarget: 'popoverTargetElement' in HTMLButtonElement.prototype,
      positionArea: CSS.supports('position-area', 'block-end'),
    }));
    assert.equal(support.popover, true, 'Chromium evidence browser must support the Popover API');
    assert.equal(support.popoverTarget, true, 'Chromium evidence browser must support declarative popover invokers');

    const baselineTrigger = page.locator('#baselineTrigger');
    const baselineHelp = page.locator('#baselineHelp');
    await baselineTrigger.focus();
    assert.equal(await baselineHelp.evaluate((node) => node.classList.contains('open')), true);
    const baselineFocusAfterOpen = await page.evaluate(() => document.activeElement?.id || '');
    const baselineAria = await baselineTrigger.ariaSnapshot();
    await page.keyboard.press('Tab');
    const baselineFirstTabTarget = await page.evaluate(() => document.activeElement?.id || document.activeElement?.getAttribute('aria-label') || '');
    await page.keyboard.press('Escape');
    assert.equal(await baselineHelp.evaluate((node) => node.classList.contains('open')), false);

    await baselineTrigger.click();
    const baselineScreenshot = path.join(outDir, `baseline-${viewport.label}.png`);
    await page.screenshot({ path: baselineScreenshot, fullPage: true });
    await page.keyboard.press('Escape');

    const nativeTrigger = page.locator('#nativeTrigger');
    const nativeHelp = page.locator('#nativeHelp');
    await nativeTrigger.focus();
    await nativeTrigger.press('Enter');
    assert.equal(await popoverOpen(nativeHelp), true, 'Native popover must open from keyboard activation');

    const nativeAriaOpen = await nativeTrigger.ariaSnapshot();
    assert.match(nativeAriaOpen, /expanded/i, 'Native invoker accessibility snapshot must expose expanded state');

    await page.keyboard.press('Tab');
    const nativeFirstTabTarget = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.id || '');
    assert.equal(nativeFirstTabTarget, 'Chiudi aiuto nativo', 'Popover content must follow the invoker in keyboard navigation order');

    await page.keyboard.press('Escape');
    assert.equal(await popoverOpen(nativeHelp), false, 'Escape must light-dismiss the native popover');
    assert.equal(await page.evaluate(() => document.activeElement?.id || ''), 'nativeTrigger', 'Escape must return focus to the invoker');

    await nativeTrigger.press('Enter');
    assert.equal(await popoverOpen(nativeHelp), true);
    const nativeBounds = await measure(page, '#nativeHelp');
    assert.ok(nativeBounds.left >= -1 && nativeBounds.right <= viewport.width + 1, 'Native popover must fit horizontally');
    assert.ok(nativeBounds.top >= -1 && nativeBounds.bottom <= viewport.height + 1, 'Native popover must fit vertically');
    assert.ok(
      nativeBounds.documentScrollWidth <= nativeBounds.documentClientWidth + 1,
      'Native candidate must not create page-level horizontal overflow'
    );

    const nativeScreenshot = path.join(outDir, `native-${viewport.label}.png`);
    await page.screenshot({ path: nativeScreenshot, fullPage: true });

    await page.locator('h1').click();
    assert.equal(await popoverOpen(nativeHelp), false, 'Outside click must light-dismiss the native popover');

    evidence.candidates.push({
      viewport: { width: viewport.width, height: viewport.height },
      baseline: {
        semanticRole: await baselineHelp.getAttribute('role'),
        focusAfterOpen: baselineFocusAfterOpen,
        firstTabTargetAfterOpen: baselineFirstTabTarget,
        invokerAccessibilitySnapshot: baselineAria,
        screenshot: path.relative(process.cwd(), baselineScreenshot),
      },
      nativePopover: {
        support,
        semanticModel: 'NON_MODAL_POPOVER',
        invokerAccessibilitySnapshotOpen: nativeAriaOpen,
        firstTabTargetAfterOpen: nativeFirstTabTarget,
        escapeReturnFocus: 'nativeTrigger',
        lightDismiss: true,
        bounds: nativeBounds,
        screenshot: path.relative(process.cwd(), nativeScreenshot),
        status: 'PASS',
      },
    });

    await page.close();
  }

  evidence.status = 'PASS';
  evidence.conclusion = 'NATIVE_CANDIDATE_EVIDENCE_PASS_EXTERNAL_DEPENDENCY_NOT_REQUIRED_BY_CURRENT_TRIAL';
  await fs.writeFile(path.join(outDir, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n', 'utf8');
  process.stdout.write('TRAMA_CONTROL_CENTER_CS_S1_NATIVE_EVIDENCE_PASS\n');
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
