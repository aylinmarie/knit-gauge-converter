# security-audit

```yaml
name: security-audit
description: Comprehensive security audit of Next.js/TypeScript code
model: sonnet
```

Perform a thorough security audit of the provided code.

## What to Check

**Injection risks**: SQL, command, and template injection patterns

**Authentication issues**: Hardcoded credentials, insecure token handling

**Sensitive data exposure**: Logging secrets, exposing PII in API responses

**Access control**: Missing permission checks, over-broad Supabase RLS policies

**Security misconfiguration**: Overly permissive CORS, missing Next.js security headers

**Cross-site scripting (XSS)**: Unescaped HTML output, unsafe rendering APIs

**Deserialization**: Unsafe `JSON.parse` with untrusted input

**Outdated dependencies**: Known CVEs in package.json

**Next.js API routes**:
- Missing input validation on request body/params
- No rate limiting on AI or database-hitting endpoints
- Auth checks present before accessing user data
- Sensitive errors not leaked to client responses

**Supabase**:
- `SUPABASE_SERVICE_ROLE_KEY` never exposed to client-side code or logged
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is appropriately scoped (anon key, not service role)
- RLS enabled on all tables containing user data
- No direct table access from client without RLS policies

**Anthropic SDK**:
- `ANTHROPIC_API_KEY` used only in server-side code (API routes, server components) — never in client components or NEXT_PUBLIC_ env vars
- Prompt inputs sanitized before passing to the API
- Model responses not blindly evaluated or rendered as raw HTML

**React-specific**: Unsafe rendering patterns, uncontrolled components accepting untrusted input

## Output Format

```
## Critical Issues
- [Issue]: [Location] - [Risk] - [Fix]

## Medium Issues
- [Issue]: [Location] - [Impact] - [Recommendation]

## Minor / Best Practices
- [Issue]: [Location] - [Why it matters]

## Security Score
[Pass/Fail] - Safe for [environment]
```
