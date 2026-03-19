# AGENTS.md — vt-timeline-mfe

## Playwright E2E Workflow

### Loop obligatorio post-cambio

After ANY code change that affects UI:

1. Run visual tests: `npm run e2e -- --grep @visual`
2. If snapshots fail: review diff, fix code, repeat step 1
3. Run full suite: `npm run e2e`
4. Fix any failures
5. Repeat until all green

### Test Tags

| Tag | Category | Command |
|------|----------|---------|
| `@flow` | Functional/navigation tests | `npm run e2e -- --grep @flow` |
| `@visual` | Screenshot regression tests | `npm run e2e -- --grep @visual` |
| `@a11y` | Accessibility (axe-core WCAG) | `npm run e2e -- --grep @a11y` |
| `@perf` | Core Web Vitals & bundle size | `npm run e2e -- --grep @perf` |
| `@smoke` | Quick sanity check (subset) | `npm run e2e -- --grep @smoke` |

### A11y Failure Rules

- **NEVER** ignore `critical` or `serious` axe-core violations
- `moderate` violations: fix if quick, otherwise create a task
- `minor` violations: create a task, don't block PR

### Performance Thresholds

| Metric | Threshold | Action if exceeded |
|--------|-----------|-------------------|
| LCP | > 2.5s | MUST fix before merge |
| CLS | > 0.1 | MUST fix before merge |
| Total load | > 5s | MUST fix before merge |
| Bundle > 500KB | > 3 resources | Warning only |

### Snapshot Update Policy

- Visual snapshots (`--update-snapshots`) require **Diego's explicit approval**
- NEVER auto-update snapshots in CI
- When updating: run only `@visual` tag, review every diff screenshot
- Commit updated snapshots in a **separate commit** with message: `test(e2e): update visual baselines — [reason]`
