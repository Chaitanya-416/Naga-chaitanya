# ScopeSeal AI — Security Architecture & Defenses

## 1. Zero-Trust Enforcement Boundaries
ScopeSeal operates under the foundational premise that **neither the user prompt, the retrieved documents, the LLM reasoning, nor the agent tool outputs can be trusted unconditionally**.

### 1.1 Strict Separation of Powers
- **The LLM (Google Gemini)**: Acts solely as an advisory semantic classification component. It extracts intent, evaluates linguistic similarity, and tags potential sensitive fields.
- **The Gateway (ScopeSeal Engine)**: Acts as the sole authorizing authority. Written in deterministic TypeScript with strict mathematical evaluation of risk scores, hash comparisons, and state transitions.

```
+-----------------------------------------------------------+
| UNTRUSTED ZONE                                            |
| External Documents, Resumes, Web Data, Raw Agent Proposals|
+-----------------------------------------------------------+
                             ↓
+-----------------------------------------------------------+
| ADVISORY SEMANTIC CLASSIFICATION                          |
| Google Gemini 2.5 Flash (Strict JSON Schema Output)       |
+-----------------------------------------------------------+
                             ↓
+-----------------------------------------------------------+
| DETERMINISTIC SECURITY GATEWAY (ENFORCEMENT BOUNDARY)     |
| - Zod Input & Output Schema Validation                   |
| - Purpose Passport Expiration & Scope Verification       |
| - Recursive Canonical JSON Normalization                 |
| - SHA-256 Parameter Hash Computation                     |
| - Multi-Factor Risk Calculation                          |
| - Cryptographic Single-Use Approval Binding               |
+-----------------------------------------------------------+
                             ↓
+-----------------------------------------------------------+
| CONTROLLED EXECUTION & IMMUTABLE LEDGER                   |
| Sandboxed Tool Invocation & PostgreSQL RLS Audit Trail    |
+-----------------------------------------------------------+
```

---

## 2. Secrets Management & Privacy Guarantees
1. **Zero Secret Leakage in Browser**:
   - `GEMINI_API_KEY`: Stored exclusively in server environment variables.
   - `SUPABASE_SECRET_KEY`: Service role credentials reside strictly on the backend.
   - Frontend bundles only receive publishable, anonymous keys (`VITE_SUPABASE_PUBLISHABLE_KEY`).
2. **Synthetic Demonstration Data**:
   - To guarantee complete privacy, ScopeSeal utilizes controlled synthetic candidate profiles. No real PII is collected or processed.
3. **Audit Immutability**:
   - All evaluated actions are permanently written to the Data Flow Ledger with cryptographic hashes, preventing revisionist audit tampering.
