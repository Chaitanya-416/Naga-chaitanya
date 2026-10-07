# ScopeSeal AI — Test Suite Documentation

## Overview
ScopeSeal AI includes comprehensive unit, integration, and adversarial red-team test suites executed via **Vitest** and **Supertest**.

## 1. Running Tests Locally

```bash
# Run all server tests (Health, Auth, Gateway, Security Scenarios)
npm run test

# Run adversarial security suite exclusively
npm run test:security
```

## 2. Test Suites Breakdown

### 2.1 Health & Readiness (`src/tests/health.test.ts`)
- `GET /api/v1/health`: Verifies status 200 and liveness uptime.
- `GET /api/v1/ready`: Verifies all 6 subsystems (API, Database, Policy Engine, AI, Auth, Ledger).

### 2.2 Auth & RLS Protection (`src/tests/auth.test.ts`)
- Validation testing for malformed emails and weak passwords.
- Valid session establishment and JWT token issuing.
- 401 Unauthorized rejection on unauthenticated requests.
- Protected `/api/v1/auth/me` context resolution.

### 2.3 Gateway Zero-Trust Pipeline (`src/tests/gateway.test.ts`)
- **Safe Flow**: `read_resume` within authorized purpose -> ALLOW ($\le 30$ risk).
- **Attack Flow**: Prompt injection attempting mass exfiltration -> BLOCK ($\ge 85$ risk) + Incident created.
- **Unregistered Tool**: Shell command execution (`execute_shell`) -> Immediate BLOCK.
- **Review Flow**: High-impact export triggers REVIEW and generates parameter-bound approval.
- **Anti-Tampering**: Parameter modification after approval -> 403 BLOCK.
- **Anti-Replay**: Second execution with used approval -> 403 BLOCK.
- **Policy Simulation**: Evaluates What-If risk deltas in isolation without mutating production policies.

### 2.4 Red-Team Adversarial Matrix (`src/tests/security/adversarial.test.ts`)
Executes all 9 defined attack vectors:
1. `safe-candidate-review`
2. `indirect-prompt-injection`
3. `data-exfiltration`
4. `purpose-drift`
5. `approval-parameter-tampering`
6. `approval-replay`
7. `expired-approval`
8. `unauthorized-tool`
9. `excessive-scope`
