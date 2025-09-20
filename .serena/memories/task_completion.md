# Task Completion Checklist

## Before Committing Changes
1. **Type checking**: `npm run type-check`
2. **Build validation**: `npm run build`
3. **Run tests**: `npm run test`
4. **Visual testing**: `npm run dev` and test UI flows

## Code Quality Checks
- Ensure responsive design works on narrow terminals (40 chars min)
- Verify color accessibility with high contrast
- Test keyboard navigation and shortcuts
- Validate bilingual support (English/Japanese)

## UI/TUI Specific
- Test on different terminal sizes (40-120 characters)
- Verify proper text wrapping and content overflow
- Ensure consistent spacing and alignment
- Check box drawing characters render correctly

## Distribution
- Version updates in package.json if needed
- Build artifacts are clean: `npm run clean && npm run build`
- Binary permissions: `chmod +x bin/cc-flow.js`
- Validate installation: `npm pack` and test locally

## Documentation
- Update README.md if new features added
- Update CHANGELOG.md for version changes
- Ensure code comments are current
- Verify example commands work correctly

## Git Workflow
```bash
git add .
git commit -m "descriptive commit message"
git push origin feature-branch
# Create PR to main branch
```