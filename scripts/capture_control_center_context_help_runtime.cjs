const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { promises: fs } = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve('.');
const outDir = path.resolve(process.env.TRAMA_CONTEXT_HELP_EVIDENCE_DIR || 'artifacts/control-center-context-help-runtime');
const port = Number(process.env.TRAMA_CONTEXT_HELP_PORT || 6012);
const exactHead = process.env.TRAMA_EXACT_HEAD || null;
const runId = process.env.TRAMA_RUN_ID || null;

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.png', 'image/png'],
]);

function resolveRequest(requestUrl) {
  const url = new URL(requestUrl || '/', `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(url.pathname === '/' ? '/control-center/index.html' : url.pathname);
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

async function accessibilityState(page, selector) {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Accessibility.enable');
    const doc = await session.send('DOM.getDocument', { depth: 1 });
    const query = await session.send('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector,
    });
    assert.ok(query.nodeId, `Accessibility target not found: ${selector}`);
    const tree = await session.send('Accessibility.getPartialAXTree', {
      nodeId: query.nodeId,
      fetchRelatives: false,
    });
    const node = tree.nodes[0];
    assert.ok(node, `Accessibility node not found: ${selector}`);
    return {
      role: node.role?.value || null,
      name: node.name?.value || null,
      properties: Object.fromEntries((node.properties || []).map((item) => [item.name, item.value?.value])),
    };
  } finally {
    await session.detach();
  }
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

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

  const browser = await chromium.launch({ headless: true });
  const evidence = {
    schemaVersion: 'trama.control-center.context-help-runtime-evidence/v1',
    exactHead,
    runId,
    generatedAt: new Date().toISOString(),
    target: 'control-center/index.html',
    component: 'CONTROL_CENTER.CONTEXT_HELP.FAMILY',
    dependencyAdded: false,
    registryPromotionPerformed: false,
    viewports: [],
  };

  try {
    for (const viewport of [
      { width: 390, height: 844, label: '390x844' },
      { width: 1024, height: 768, label: '1024x768' },
    ]) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        serviceWorkers: 'block',
        acceptDownloads: true,
      });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${port}/control-center/index.html`, { waitUntil: 'load' });

      const support = await page.evaluate(() => ({
        popover: 'popover' in HTMLElement.prototype,
        showPopover: typeof HTMLElement.prototype.showPopover === 'function',
        positionArea: CSS.supports('position-area', 'block-end'),
      }));
      assert.equal(support.popover, true, 'Evidence browser must support Popover API');
      assert.equal(support.showPopover, true, 'Evidence browser must support showPopover');

      const popover = page.locator('#helpPopover');
      const invoker = page.locator('#assurance .helpable').first();
      assert.equal(await popover.getAttribute('popover'), 'auto');
      assert.equal(await popover.getAttribute('role'), null, 'Context help must not claim dialog semantics');
      assert.equal(await popoverOpen(popover), false, 'Context help must start closed');

      await invoker.focus();
      await page.waitForFunction(() => document.querySelector('#helpPopover')?.matches(':popover-open'));
      assert.equal(await page.locator('#helpTitle').textContent(), 'Stakeholder Assurance');
      assert.equal(await invoker.getAttribute('aria-details'), 'helpPopover');
      assert.equal(await invoker.getAttribute('aria-haspopup'), 'true');

      const axOpen = await accessibilityState(page, '#assurance .helpable');
      assert.equal(axOpen.properties.details !== undefined, true, 'Invoker must expose a details relationship in the accessibility tree');

      const initialBounds = await measure(page, '#helpPopover');
      assert.ok(initialBounds.left >= -1 && initialBounds.right <= viewport.width + 1, 'Initial popover must fit horizontally');
      assert.ok(initialBounds.top >= -1 && initialBounds.bottom <= viewport.height + 1, 'Initial popover must fit vertically');
      assert.ok(initialBounds.documentScrollWidth <= initialBounds.documentClientWidth + 1, 'Initial Context Help must not create page-level horizontal overflow');

      const screenshot = path.join(outDir, `runtime-${viewport.label}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });

      await page.locator('h1').click();
      assert.equal(await popoverOpen(popover), false, 'Outside click must light-dismiss the popover');

      await invoker.click();
      await page.waitForFunction(() => document.querySelector('#helpPopover')?.matches(':popover-open'));

      const secondaryInvoker = page.locator('header .report-link.helpable');
      await secondaryInvoker.focus();
      await page.waitForFunction(() => document.querySelector('#helpPopover')?.matches(':popover-open'));
      assert.equal(await page.locator('#helpTitle').textContent(), 'Dossier stakeholder', 'Changing help source must refresh the contextual content');
      assert.equal(await invoker.getAttribute('aria-details'), null, 'Previous source must be unbound when Context Help moves');
      assert.equal(await secondaryInvoker.getAttribute('aria-details'), 'helpPopover', 'New source must own the contextual-help relationship');

      const reboundBounds = await measure(page, '#helpPopover');
      assert.ok(reboundBounds.left >= -1 && reboundBounds.right <= viewport.width + 1, 'Rebound popover must fit horizontally');
      assert.ok(reboundBounds.top >= -1 && reboundBounds.bottom <= viewport.height + 1, 'Rebound popover must fit vertically');
      assert.ok(reboundBounds.documentScrollWidth <= reboundBounds.documentClientWidth + 1, 'Rebound Context Help must not create page-level horizontal overflow');

      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.id || ''), 'helpClose', 'Popover content must follow the rebound invoker in keyboard order');

      await page.keyboard.press('Escape');
      assert.equal(await popoverOpen(popover), false, 'Escape must dismiss native popover');
      assert.equal(
        await page.evaluate(() => document.activeElement === document.querySelector('header .report-link.helpable')),
        true,
        'Escape must return focus to the currently bound invoker after source rebinding'
      );

      await page.mouse.move(0, 0);
      await invoker.hover();
      await page.waitForTimeout(80);
      assert.equal(await popoverOpen(popover), false, 'Hover alone must not persist contextual help');

      evidence.viewports.push({
        viewport: { width: viewport.width, height: viewport.height },
        support,
        semanticModel: 'NON_MODAL_NATIVE_POPOVER',
        accessibleRelationship: {
          ariaDetails: 'helpPopover',
          ariaHasPopup: 'true',
          accessibilityTree: axOpen,
        },
        keyboard: {
          firstTabTarget: 'helpClose',
          escapeDismissal: true,
          focusReturn: true,
          sourceRebinding: true,
        },
        lightDismiss: true,
        hoverPersistence: false,
        bounds: {
          initial: initialBounds,
          rebound: reboundBounds,
        },
        screenshot: path.relative(process.cwd(), screenshot),
        status: 'PASS',
      });

      await context.close();
    }

    evidence.status = 'PASS';
    evidence.conclusion = 'DEPLOYED_RUNTIME_NATIVE_POPOVER_EVIDENCE_PASS_REGISTRY_REMAINS_CONSERVATIVE';
    await fs.writeFile(path.join(outDir, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n', 'utf8');
    process.stdout.write('TRAMA_CONTROL_CENTER_CONTEXT_HELP_RUNTIME_EVIDENCE_PASS\n');
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
