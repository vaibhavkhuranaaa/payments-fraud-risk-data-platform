# Use a compact public event store

## Decision

Publish the complete allowlisted event register from normalized merchant and category dictionaries plus one integer-keyed event table. Preserve timestamp order and reconstruct the seven-field public contract through a security-invoker view.

## Why

The governed local database is 2,266 MB, while Supabase Free becomes read-only above 500 MB. The public contract does not need repeated source hashes, raw-field lineage columns, wide hexadecimal IDs, or point-in-time feature storage. Native PostgreSQL normalization keeps all 1,852,394 approved rows while removing that repetition.

## Alternatives rejected

- Enable a paid database tier because the approved monthly ceiling remains $0.
- Publish Parquet or CSV files because the public repository and dashboard must not distribute dataset files.
- Add a search service because PostgreSQL indexes cover the bounded filters and cursor order.

## Not done

- No raw source file, identity-like field, feature, score, or payment action is copied.
- No new provider, package, or paid resource is introduced.
- No user-editable or write endpoint is added.

## Changed

Public event IDs become stable chronological integers. Merchant, category, source partition, and amount are stored compactly and reconstructed by the existing read-only API contract.
