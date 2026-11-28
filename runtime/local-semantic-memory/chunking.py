from __future__ import annotations

def chunk_projection_text(text: str, *, max_chars: int = 1800, overlap_chars: int = 200):
    if not isinstance(text, str):
        raise TypeError('text must be a string')
    if max_chars <= 0 or overlap_chars < 0 or overlap_chars >= max_chars:
        raise ValueError('invalid chunk bounds')
    source = text.strip()
    if not source:
        return []
    out=[]; start=0; n=len(source)
    while start < n:
        hard_end=min(start+max_chars,n); end=hard_end
        if hard_end < n:
            floor=min(start+1200, hard_end)
            window=source[floor:hard_end]
            # Prefer the last newline, then any whitespace, within the preferred tail.
            rel=window.rfind('\n')
            if rel < 0:
                for i in range(len(window)-1,-1,-1):
                    if window[i].isspace(): rel=i; break
            if rel >= 0:
                end=floor+rel
                if end <= start: end=hard_end
        chunk=source[start:end].strip()
        if chunk: out.append(chunk)
        if end >= n: break
        next_start=max(start+1,end-overlap_chars)
        # Trim only leading whitespace; this never increases overlap.
        while next_start < end and source[next_start].isspace(): next_start += 1
        start=next_start
    return out
