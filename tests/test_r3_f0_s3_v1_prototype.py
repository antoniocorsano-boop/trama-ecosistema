import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE = ROOT / "docs" / "product" / "prototypes" / "r3-f0-s3-v1"
HTML_PATH = PROTOTYPE / "index.html"
CSS_PATH = PROTOTYPE / "styles.css"
JS_PATH = PROTOTYPE / "prototype.js"


def _luminance(hex_color: str) -> float:
    value = hex_color.lstrip("#")
    rgb = [int(value[i:i+2], 16) / 255 for i in (0, 2, 4)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def _contrast(a: str, b: str) -> float:
    high, low = sorted((_luminance(a), _luminance(b)), reverse=True)
    return (high + 0.05) / (low + 0.05)


class S3V1PrototypeContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = HTML_PATH.read_text(encoding="utf-8")
        cls.css = CSS_PATH.read_text(encoding="utf-8")
        cls.js = JS_PATH.read_text(encoding="utf-8")

    def test_single_h1_and_skip_link(self):
        self.assertEqual(len(re.findall(r"<h1\b", self.html)), 1)
        self.assertIn('class="skip-link" href="#contenuto"', self.html)
        self.assertIn('id="contenuto"', self.html)

    def test_internal_anchors_resolve_and_ids_are_unique(self):
        ids = re.findall(r'\sid="([^"]+)"', self.html)
        hrefs = re.findall(r'href="#([^"]+)"', self.html)
        self.assertEqual(len(ids), len(set(ids)), "Duplicate ids found")
        missing = sorted(set(hrefs) - set(ids))
        self.assertEqual(missing, [], f"Missing anchor targets: {missing}")

    def test_no_runtime_or_external_assets(self):
        scripts = re.findall(r'<script[^>]+src="([^"]+)"', self.html, flags=re.IGNORECASE)
        self.assertEqual(scripts, ["prototype.js"])
        self.assertNotRegex(self.html.lower(), r"https?://|src=\"//|href=\"//")
        self.assertNotRegex(self.html.lower(), r"react|vue|angular|svelte|bootstrap|tailwind")
        self.assertNotRegex(self.js.lower(), r"fetch\(|xmlhttprequest|websocket|https?://")

    def test_accessible_map_and_status_contracts(self):
        self.assertIn('class="map-canvas" aria-hidden="true"', self.html)
        self.assertIn('id="elenco"', self.html)
        self.assertIn("edge-prerequisite", self.html)
        self.assertIn("edge-resource", self.html)
        self.assertIn("edge-raccordo", self.html)
        self.assertEqual(self.html.count('role="status"'), 1)
        for label in ("CurricularStatus", "EditorialStatus", "UIFeedbackStatus"):
            self.assertIn(label, self.html)

    def test_tabs_semantics_and_keyboard_contract(self):
        self.assertIn('role="tablist"', self.html)
        self.assertEqual(self.html.count('role="tab"'), 2)
        self.assertEqual(self.html.count('role="tabpanel"'), 2)
        self.assertIn('aria-selected="true"', self.html)
        self.assertIn('aria-selected="false"', self.html)
        for key in ("ArrowRight", "ArrowLeft", "Home", "End"):
            self.assertIn(key, self.js)
        self.assertIn('setAttribute("aria-selected"', self.js)
        self.assertIn("panel.hidden = !selected", self.js)

    def test_focus_targets_responsive_and_motion_contracts(self):
        self.assertIn(":focus-visible", self.css)
        self.assertIn("button:focus-visible", self.css)
        self.assertIn(".skip-link:focus", self.css)
        self.assertIn("overflow-x: clip", self.css)
        self.assertIn('.view-switcher a[href="#visuale"]', self.css)
        self.assertRegex(self.css, r"min-height:\s*44px")
        self.assertRegex(self.css, r"@media\s*\(max-width:\s*759px\)")
        self.assertRegex(self.css, r"@media\s*\(min-width:\s*1400px\)")
        self.assertIn("prefers-reduced-motion", self.css)

    def test_sample_token_contrast(self):
        white = "#ffffff"
        colors = {
            "text-primary": "#1f2937",
            "text-secondary": "#475569",
            "action-primary": "#1d4ed8",
            "focus-ring": "#0369a1",
            "authority-arena": "#312e81",
            "domain-atlas": "#0f766e",
            "editorial-withdrawn": "#7c2d12",
            "ui-error": "#991b1b",
        }
        for name, color in colors.items():
            with self.subTest(token=name):
                self.assertGreaterEqual(_contrast(color, white), 4.5)


if __name__ == "__main__":
    unittest.main()
