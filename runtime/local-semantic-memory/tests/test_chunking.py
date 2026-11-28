import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

class ChunkingTests(unittest.TestCase):
    def test_short_and_whitespace(self):
        from chunking import chunk_projection_text
        self.assertEqual(chunk_projection_text('abc'), ['abc'])
        self.assertEqual(chunk_projection_text('   \n\t'), [])
    def test_long_chunks_are_bounded_deterministic_and_overlap_small(self):
        from chunking import chunk_projection_text
        text = ' '.join(f'token-{i:05d}' for i in range(700))
        a = chunk_projection_text(text); b = chunk_projection_text(text)
        self.assertEqual(a,b); self.assertGreater(len(a),1)
        self.assertTrue(all(0 < len(x) <= 1800 for x in a))
        # Measure overlap by source positions, not repeated textual patterns.
        cursor = 0
        positions=[]
        for chunk in a:
            pos=text.find(chunk, max(0, cursor-200))
            self.assertGreaterEqual(pos,0)
            positions.append((pos,pos+len(chunk)))
            cursor=pos+len(chunk)
        for left,right in zip(positions,positions[1:]):
            self.assertLessEqual(max(0,left[1]-right[0]),200)
    def test_prefers_boundary_after_1200(self):
        from chunking import chunk_projection_text
        text = 'a'*1250 + '\n' + 'b'*1000
        chunks = chunk_projection_text(text)
        self.assertEqual(len(chunks[0]),1250)

if __name__ == '__main__': unittest.main()
