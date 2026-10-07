# ScopeSeal AI — REST API Documentation (v1)

Base URL: `/api/v1`

## Health & Readiness
- `GET /api/v1/health`: API liveness probe.
- `GET /api/v1/ready`: Subsystem readiness probe (API, Database, Policy Engine, AI Provider, Auth, Ledger).

## Authentication
- `POST /api/v1/auth/session`: Authenticate session via Supabase or Local SecOps Authority.
- `POST /api/v1/auth/register`: Register tenant identity.
- `GET /api/v1/auth/me`: Fetch authenticated user profile and roles.

## Gateway Boundary
- `POST /api/v1/gateway/evaluate-action`: Intercept proposed agent action; returns risk score, verdict (`ALLOW`, `REVIEW`, `BLOCK`), SHA-256 parameter hash, and ledger ID.
- `POST /api/v1/gateway/execute-action`: Execute authorized action with verified hash and approval token.

## Purpose Passports
- `GET /api/v1/passports`: Retrieve user's Purpose Passports.
- `POST /api/v1/passports`: Create a new Purpose Passport.
- `PUT /api/v1/passports/:id`: Update Purpose Passport boundary.
- `DELETE /api/v1/passports/:id`: Delete Purpose Passport.

## Policies & Approvals
- `GET /api/v1/policies`: Get active policy weights and thresholds.
- `PUT /api/v1/policies/:id`: Update weights and thresholds.
- `GET /api/v1/approvals`: List pending and historical approvals.
- `POST /api/v1/approvals/:id/approve`: Approve ticket for single-use execution.
- `POST /api/v1/approvals/:id/reject`: Reject action request.

## Ledger & Incidents
- `GET /api/v1/ledger`: Retrieve chronological Data Flow Ledger events.
- `GET /api/v1/ledger/:id`: Inspect individual ledger event forensics.
- `GET /api/v1/incidents`: Retrieve security incident records.
- `GET /api/v1/incidents/:id`: Inspect incident forensic payload.

## Test Lab & Simulation
- `GET /api/v1/test-lab/scenarios`: List 9 red-team adversarial test scenarios.
- `POST /api/v1/test-lab/run-scenario`: Run a specific scenario vector.
- `GET /api/v1/test-lab/results`: Retrieve test run results.
- `POST /api/v1/policy-simulation/run`: Execute What-If policy simulation without database mutation or tool execution.

## Competition Demo
- `POST /api/v1/demo/reset`: Reset demo environment to seed state.
- `POST /api/v1/demo/run-safe-flow`: Run Flow B (Safe Candidate Review).
- `POST /api/v1/demo/run-attack-flow`: Run Flow C (Prompt Injection & Exfiltration Attack).
- `POST /api/v1/demo/run-drift-flow`: Run Flow D (Purpose Drift).
- `POST /api/v1/demo/run-approval-flow`: Run Flow E (Approval Workflow).
- `POST /api/v1/demo/run-tamper-flow`: Run Flow F (Approval Parameter Tampering).
