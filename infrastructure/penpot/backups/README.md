# Penpot backups

Backup artifacts are intentionally not stored in Git.

A production-ready deployment must define and test:

- PostgreSQL backup and restore;
- Penpot asset volume backup and restore;
- secret rotation and recovery procedure;
- retention policy;
- restore drill evidence.

This directory exists only to document the boundary. Runtime backups must be stored in a protected backup system outside the repository.
