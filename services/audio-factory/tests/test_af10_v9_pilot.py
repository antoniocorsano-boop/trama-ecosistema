import copy, unittest
from af10_v9_pilot import plan, authorization, REPO, BRANCH, BASE, compare

class AF10Tests(unittest.TestCase):
    def event(self):
        h="a"*40
        return {"action":"labeled","repository":{"private":False,"full_name":REPO},
                "label":{"name":"af10-pilot-"+h},
                "pull_request":{"head":{"sha":h,"ref":BRANCH,"repo":{"full_name":REPO}},
                                "base":{"ref":BASE}}}
    def test_exactly_two_units(self):
        units=plan()
        self.assertEqual([u["id"] for u in units],["S3U3","S5U3"])
        self.assertEqual(units[0]["text"],"Anche una macchina può sbagliare. Come può Teo accorgersene?")
        self.assertEqual(units[1]["text"],"Per cambiare il futuro servono tre cose: attenzione, verifica e responsabilità.")
    def test_authorized(self):
        self.assertEqual(authorization(self.event(),"1","pull_request"),"a"*40)
    def test_reject_invalid_events(self):
        for path,value in [(("action",),"synchronize"),(("repository","private"),True),
                           (("repository","full_name"),"other/repo"),
                           (("label","name"),"af09-v7-nicola-autorizzato"),
                           (("pull_request","head","sha"),"b"*40),
                           (("pull_request","head","ref"),"main"),
                           (("pull_request","base","ref"),"main"),
                           (("pull_request","head","repo","full_name"),"other/repo")]:
            with self.subTest(path=path):
                e=self.event(); d=e
                for key in path[:-1]: d=d[key]
                d[path[-1]]=value
                with self.assertRaises(ValueError): authorization(e,"1","pull_request")
    def test_reject_retry_push_credentials(self):
        for attempt,event,cred in [("2","pull_request",False),("1","push",False),("1","pull_request",True)]:
            with self.assertRaises(ValueError): authorization(self.event(),attempt,event,cred)
    def test_protected_meaning(self):
        self.assertTrue(compare("attenzione, verifica e responsabilità","attenzione, attenzione e responsabilità"))
