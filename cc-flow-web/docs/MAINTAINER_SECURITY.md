# Maintainer Security Guide

## Required Security Setup for Package Maintainers

### 1. Enable Two-Factor Authentication (2FA)

**CRITICAL**: 2FA must be enabled for all maintainers with publish access.

#### Enable 2FA on npm:

```bash
# Check current 2FA status
npm profile get

# Enable 2FA for authentication and publishing
npm profile enable-2fa auth-and-writes
```

Follow the prompts to:
1. Install an authenticator app (Google Authenticator, Authy, etc.)
2. Scan the QR code or enter the secret key
3. Enter the verification code
4. Save the recovery codes in a secure location

#### Verify 2FA is enabled:

```bash
npm profile get | grep "two-factor auth"
# Should show: enabled
```

### 2. Secure npm Token Management

For CI/CD (GitHub Actions):

1. Create an automation token:
   ```bash
   npm token create --read-only=false --cidr=0.0.0.0/0
   ```

2. Add to GitHub Secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Add new secret: `NPM_TOKEN`
   - Paste the token value

3. Token security:
   - Use granular tokens when possible
   - Rotate tokens regularly (every 90 days)
   - Never commit tokens to git
   - Use different tokens for different environments

### 3. Publishing Workflow

#### Manual Publishing (Not Recommended)

```bash
# With 2FA enabled
npm publish --access public
# Enter 2FA code when prompted
```

#### Automated Publishing (Recommended)

Use GitHub Actions workflow (`.github/workflows/publish.yml`):

1. Create a new release on GitHub
2. Workflow automatically builds and publishes with provenance
3. No manual 2FA required (uses NPM_TOKEN)

Benefits:
- Automatic provenance attestation
- Reproducible builds
- Audit trail via GitHub releases
- No local credentials exposure

### 4. Security Checklist Before Each Release

- [ ] Review all dependency updates
- [ ] Run `npm audit` and address critical/high vulnerabilities
- [ ] Verify `package-lock.json` is up to date
- [ ] Check for suspicious code in pull requests
- [ ] Ensure tests pass
- [ ] Review the diff of files to be published
- [ ] Verify provenance is enabled in CI/CD

### 5. Incident Response

If credentials are compromised:

1. **Immediately revoke the token**:
   ```bash
   npm token revoke <token-id>
   ```

2. **Reset 2FA**:
   ```bash
   npm profile disable-2fa
   npm profile enable-2fa auth-and-writes
   ```

3. **Audit recent publishes**:
   ```bash
   npm view @hiraoku/cc-flow-web versions
   npm unpublish @hiraoku/cc-flow-web@<compromised-version>
   ```

4. **Notify users** via:
   - GitHub Security Advisory
   - npm deprecation message
   - Direct communication channels

### 6. Regular Security Maintenance

Weekly:
- Review dependabot alerts
- Check npm audit results

Monthly:
- Rotate npm tokens
- Review access permissions
- Update dependencies

Quarterly:
- Security audit of codebase
- Review and update security documentation
- Test incident response procedures

### 7. Additional Resources

- [npm 2FA Documentation](https://docs.npmjs.com/about-two-factor-authentication)
- [npm Token Management](https://docs.npmjs.com/about-access-tokens)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
