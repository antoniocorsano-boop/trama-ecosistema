from __future__ import annotations

from config import load_runtime_config
from embedding import LocalEmbeddingClient
from indexer import SemanticIndexer
from search import SemanticSearchService
from server import create_server
from service import MemoryService
from storage import ProjectionStore
from vector_backend import select_vector_backend


def build_service(config):
    store = ProjectionStore(config.db_path)
    embedder = LocalEmbeddingClient(
        config.embedding_url,
        config.embedding_model,
        timeout=config.embedding_timeout_seconds,
    )
    indexer = SemanticIndexer(store, embedder)
    backend = select_vector_backend(config.sqlite_vec_path)
    search_service = SemanticSearchService(store, embedder, backend=backend)
    return MemoryService(indexer, search_service)


def main():
    config = load_runtime_config()
    service = build_service(config)
    server = create_server(config, service)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
