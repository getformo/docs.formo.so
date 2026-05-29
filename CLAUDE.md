# CLAUDE.md

Guidance for AI agents working in this repository (the Formo docs site, built with Mintlify).

## Writing style

- **Never use em dashes (`—`).** Rewrite the sentence instead: use a colon for a term/definition, a semicolon or period to split clauses, parentheses for an aside, or a comma. This applies to all content: `.mdx` pages, the OpenAPI spec (`api/openapi.json`), summaries, and titles.
- En dashes (`–`) are also discouraged; use "to" for ranges (e.g. "5 to 10").
- The arrow character `→` is fine where it represents a flow or a UI path (e.g. "Settings → Lifecycle", "page → connect → swap").

## Single source of truth

Define each concept once and link to it elsewhere rather than restating the details (which drift out of sync).

- **User lifecycle stages** (New, Returning, Power User, Resurrected, Churned): the authoritative definition with exact rules and thresholds lives in `features/wallet-intelligence/wallet-profiles.mdx` (`#user-lifecycle`). Other pages should give a brief, contextual mention and link to it. The SQL-oriented restatement in `data/catalog.mdx` is the one allowed exception, since it serves query writers in-context.

## API reference

`api/openapi.json` is the source spec that generates the API reference pages. Keep it valid JSON; descriptions render as published docs, so apply the writing-style rules above to them too.
