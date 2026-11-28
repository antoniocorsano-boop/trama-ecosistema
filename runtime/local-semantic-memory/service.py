from __future__ import annotations


class MemoryService:
    def __init__(self, indexer, search_service):
        self.indexer = indexer
        self.search_service = search_service

    def health(self):
        health = dict(self.indexer.health())
        backend = getattr(self.search_service, 'backend', None)
        if health.get('status') == 'ready' and getattr(backend, 'degraded_reason', None):
            health['status'] = 'degraded'
        return health

    def upsert(self, payload): return self.indexer.upsert(payload)
    def remove(self, payload): return self.indexer.remove(payload)
    def search(self, payload): return self.search_service.search(payload)
