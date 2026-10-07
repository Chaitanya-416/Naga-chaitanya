import { describe, it, expect, beforeEach } from 'vitest';
import { runScenario, SECURITY_SCENARIOS } from '../../engine/testLabEngine.js';
import { store } from '../../services/store.service.js';
import { DEMO_USER_ID } from '../../middleware/auth.middleware.js';

describe('ScopeSeal AI Security Red-Team Test Lab (9 Scenarios)', () => {
  beforeEach(() => {
    store.resetDemoData();
  });

  const scenarioIds = Object.keys(SECURITY_SCENARIOS);

  it.each(scenarioIds)('Scenario "%s" executes and matches expected security verdict', async (scenarioId) => {
    const result = await runScenario(DEMO_USER_ID, scenarioId);

    expect(result).toHaveProperty('id');
    expect(result.scenarioId).toBe(scenarioId);
    expect(result.observedDecision).toBe(result.expectedDecision);
    expect(result.passed).toBe(true);

    if (result.expectedDecision === 'BLOCK') {
      expect(result.riskScore).toBeGreaterThanOrEqual(70);
    } else {
      expect(result.riskScore).toBeLessThanOrEqual(30);
    }
  });
});
