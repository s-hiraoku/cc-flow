# GitHub Actions & Automation Setup

This directory contains comprehensive GitHub Actions workflows and automation configurations for the cc-flow project.

## 🚀 Overview

The automation setup includes:

- **CI/CD Pipeline**: Automated testing, building, and validation
- **Renovate Bot**: Automated dependency updates
- **Claude Code Review**: AI-powered code review automation
- **Security Scanning**: CodeQL analysis and vulnerability detection
- **Auto-merge**: Intelligent PR merging for approved changes
- **Release Management**: Automated NPM publishing and GitHub releases

## 📁 Directory Structure

```
.github/
├── workflows/
│   ├── ci.yml              # Main CI/CD pipeline
│   ├── claude-review.yml   # Claude Code review automation
│   ├── release.yml         # Release automation
│   ├── codeql.yml          # Security analysis
│   └── auto-merge.yml      # Auto-merge for approved PRs
├── ISSUE_TEMPLATE/
│   ├── bug_report.yml      # Bug report template
│   └── feature_request.yml # Feature request template
├── renovate.json           # Renovate configuration
├── settings.yml            # Repository settings
├── pull_request_template.md # PR template
└── README.md              # This file
```

## 🔄 Workflows

### CI/CD Pipeline (`ci.yml`)
- **Triggers**: Push to main/develop, PRs
- **Node.js Versions**: 18, 20, 22
- **Steps**:
  - Install dependencies
  - Type checking
  - Linting
  - Testing
  - Building
  - Security audit

### Claude Code Review (`claude-review.yml`)
- **Triggers**: PR opened/updated
- **Features**:
  - Automated code quality checks
  - AI-powered review comments
  - Test validation
  - Accessibility recommendations

### Release Automation (`release.yml`)
- **Triggers**: Git tags (v*), manual dispatch
- **Features**:
  - Automated NPM publishing
  - GitHub release creation
  - Changelog generation
  - Version management

### Security Analysis (`codeql.yml`)
- **Triggers**: Push, PR, weekly schedule
- **Features**:
  - CodeQL security scanning
  - Vulnerability detection
  - Security advisory reports

### Auto-merge (`auto-merge.yml`)
- **Triggers**: PR status changes
- **Features**:
  - Intelligent merging for approved PRs
  - Renovate/Dependabot integration
  - Status check validation

## 🤖 Renovate Configuration

Automated dependency management with:
- **Schedule**: Monday 6 AM JST
- **Auto-merge**: DevDependencies only
- **Grouping**: Core dependencies, type definitions
- **Labels**: Automatic labeling and assignment

## 🏷️ Labels & Templates

### Labels
- **Type**: bug, feature, enhancement, documentation, refactor
- **Priority**: high, medium, low
- **Component**: tui, cli, workflow, testing
- **Special**: auto-merge, dependencies, good first issue

### Templates
- **Bug Report**: Structured bug reporting with environment details
- **Feature Request**: Comprehensive feature proposal template
- **Pull Request**: Detailed PR template with checklists

## 🛠️ Setup Requirements

### GitHub Secrets
```bash
NPM_TOKEN=your_npm_token      # For NPM publishing
GITHUB_TOKEN=automatic        # Auto-provided by GitHub
```

### Repository Settings
- Enable Actions in repository settings
- Configure branch protection for `main`
- Enable vulnerability alerts
- Enable dependency graph

### Renovate Setup
1. Install Renovate GitHub App
2. Configure in repository settings
3. Renovate will use the `renovate.json` config

## 📊 Monitoring & Notifications

### Status Checks
- All workflows report status to PRs
- Branch protection requires CI success
- Failed builds block merging

### Notifications
- PR reviews via Claude Code automation
- Security alerts for vulnerabilities
- Dependency update notifications

## 🔧 Local Development

To test workflows locally:

```bash
# Install act (GitHub Actions runner)
brew install act

# Test CI workflow
act push

# Test PR workflow
act pull_request
```

## 📈 Metrics & Analytics

Track workflow performance:
- Build success rates
- Test coverage reports
- Security scan results
- Dependency update frequency

## 🚨 Troubleshooting

### Common Issues

1. **CI Failures**
   - Check Node.js version compatibility
   - Verify test dependencies
   - Review type checking errors

2. **Auto-merge Not Working**
   - Ensure PR has required approvals
   - Check that all status checks pass
   - Verify labels are correct

3. **Renovate Issues**
   - Check configuration syntax
   - Verify GitHub App permissions
   - Review rate limiting

### Getting Help

- Check workflow run logs in Actions tab
- Review configuration files for syntax errors
- Consult GitHub Actions documentation

---

## 🎯 Best Practices

1. **Keep workflows focused**: Each workflow has a single responsibility
2. **Use caching**: NPM dependencies are cached for faster builds
3. **Fail fast**: Type checking and linting run before tests
4. **Security first**: Regular security scans and dependency updates
5. **Automation**: Minimize manual intervention where possible

## 🔮 Future Enhancements

- [ ] Performance benchmarking automation
- [ ] Visual regression testing
- [ ] Deployment previews
- [ ] Enhanced Claude Code integration
- [ ] Multi-platform testing (Windows, macOS, Linux)

---

*This automation setup ensures high code quality, security, and developer productivity for the cc-flow project.*