import crypto from 'crypto';

/**
 * Canonically sorts object keys recursively to produce deterministic JSON representations
 */
export function canonicalizeParameters(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(canonicalizeParameters);
  }

  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};

  for (const key of sortedKeys) {
    result[key] = canonicalizeParameters(obj[key]);
  }

  return result;
}

/**
 * Computes a deterministic SHA-256 hash for action parameters bound to actor, tool, and destination
 */
export function computeParameterHash(
  agentId: string,
  tool: string,
  destination: string,
  parameters: Record<string, any>
): string {
  const canonical = canonicalizeParameters(parameters);
  const payload = JSON.stringify({
    agentId: agentId.trim().toLowerCase(),
    tool: tool.trim().toLowerCase(),
    destination: destination.trim().toLowerCase(),
    parameters: canonical
  });

  return crypto.createHash('sha256').update(payload).digest('hex');
}
