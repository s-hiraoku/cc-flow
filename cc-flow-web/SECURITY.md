# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in cc-flow-web, please report it by emailing the maintainers. Please do not create a public GitHub issue.

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and aim to provide a fix within 7 days for critical vulnerabilities.

## Supply Chain Security

This package implements the following security measures:

### 1. Provenance Attestation
- All releases are published with npm provenance when published via GitHub Actions
- Provenance can be verified using: `npm view @hiraoku/cc-flow-web --json | jq .dist.attestations`

### 2. Dependency Management
- `package-lock.json` is committed to ensure reproducible builds
- Dependencies are audited regularly with `npm audit`
- Automated dependency updates are reviewed before merging

### 3. Build Security
- Standalone Next.js build reduces runtime dependencies
- No postinstall scripts that could execute malicious code
- Minimal production dependencies

### 4. Publishing Security
- 2FA required for npm publishing
- GitHub Actions workflow requires review for releases
- NPM_TOKEN stored as encrypted GitHub secret

## Verification

To verify the integrity of this package:

```bash
# Check provenance (requires npm 9+)
npm view @hiraoku/cc-flow-web --json | jq .dist.attestations

# Verify package signature
npm audit signatures

# Check for known vulnerabilities
npm audit
```

## Security Best Practices for Users

When using cc-flow-web:
1. Always use specific version numbers in package.json
2. Run `npm audit` regularly
3. Keep Node.js updated to the latest LTS version
4. Review the package's source code before using in production
