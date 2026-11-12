import hashlib, importlib.util, json, tempfile, unittest
from pathlib import Path
SKILL=Path(__file__).resolve().parents[1]/"skills/atlas-education-production"
spec=importlib.util.spec_from_file_location("gate",SKILL/"scripts/check_preproduction.py")
gate=importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)

class Tests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
    def record(self,family="avventura",narrative=True):
        roles=gate.ROLES | ({"story","world"} if narrative else set())
        artifacts={}
        for role in roles:
            path=self.root/(role+".md")
            path.write_text("synthetic test fixture "+role)
            artifacts[role]={"path":path.name,"sha256":gate.digest(path)}
        r={"schema":"atlas-preproduction/v1","family":family,"version":"test-only","narrative":narrative,"artifacts":artifacts}
        if not narrative:r["nonNarrativeRationale"]="synthetic test fixture"
        sha=hashlib.sha256(json.dumps(r,sort_keys=True,ensure_ascii=False,separators=(",",":")).encode()).hexdigest()
        r["reviews"]={name:{"decision":"PASS","designSha256":sha,"reviewer":"synthetic fixture","date":"2026-01-01","evidence":"test only","authority":"HUMAN_DECLARED"} for name in ({"experience","story","world"} if narrative else {"experience"})}
        return r
    def test_complete_is_not_authority(self):
        for family in sorted(gate.FAMILIES):
            r=self.record(family,family in {"avventura","racconto-fumetto"})
            out=gate.check(self.root,r)
            self.assertEqual(out["status"],"RECORD_STRUCTURALLY_COMPLETE")
            for key in ("human_authority_verified","production_authorized","quality_verified","publication_authorized"):
                self.assertIs(out[key],False)
    def test_missing_artifact(self):
        r=self.record();del r["artifacts"]["screenplay"]
        with self.assertRaisesRegex(ValueError,"MISSING_DESIGN_ARTIFACTS"):gate.check(self.root,r)
    def test_changed_storyboard(self):
        r=self.record();(self.root/"storyboard.md").write_text("changed")
        with self.assertRaisesRegex(ValueError,"DESIGN_HASH_MISMATCH"):gate.check(self.root,r)
    def test_missing_review(self):
        r=self.record();del r["reviews"]["world"]
        with self.assertRaisesRegex(ValueError,"MISSING_REVIEW"):gate.check(self.root,r)
    def test_nonpass(self):
        for status in ("REWORK","REJECT","NON REVISIONATO"):
            r=self.record();r["reviews"]["experience"]["decision"]=status
            with self.assertRaisesRegex(ValueError,"REVIEW_NOT_PASS"):gate.check(self.root,r)
    def test_stale_review(self):
        r=self.record();r["version"]="changed"
        with self.assertRaisesRegex(ValueError,"STALE_REVIEW"):gate.check(self.root,r)
    def test_nonhuman(self):
        r=self.record();r["reviews"]["story"]["authority"]="MODEL"
        with self.assertRaisesRegex(ValueError,"HUMAN_REVIEW_REQUIRED"):gate.check(self.root,r)
    def test_no_narrative_waiver_for_adventure(self):
        r=self.record("avventura",False)
        with self.assertRaisesRegex(ValueError,"NARRATIVE_REQUIRED"):gate.check(self.root,r)
    def test_non_narrative_rationale(self):
        r=self.record("microcorso",False);del r["nonNarrativeRationale"]
        with self.assertRaisesRegex(ValueError,"MISSING_RATIONALE"):gate.check(self.root,r)
    def test_traversal(self):
        r=self.record();r["artifacts"]["story"]["path"]="../story.md"
        with self.assertRaisesRegex(ValueError,"UNSAFE_ARTIFACT_PATH"):gate.check(self.root,r)
    def test_duplicate(self):
        r=self.record();r["artifacts"]["story"]=r["artifacts"]["world"]
        with self.assertRaisesRegex(ValueError,"DUPLICATE_ARTIFACT"):gate.check(self.root,r)
    def test_no_review_evidence(self):
        r=self.record();r["reviews"]["experience"]["evidence"]=""
        with self.assertRaisesRegex(ValueError,"MISSING_REVIEW_EVIDENCE"):gate.check(self.root,r)
if __name__=="__main__":unittest.main()
