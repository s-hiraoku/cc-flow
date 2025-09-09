---
description: "Interactive setup for Git submodules in CC-Deck projects"
argument-hint: "[project-name] [github-url]"
allowed-tools: ["Bash", "Write", "Read", "Edit", "LS", "Glob", "Grep"]
---

# Interactive Git Submodule Setup

This command helps you set up new Git submodules in the CC-Deck project with an interactive conversation flow.

## Usage

```bash
/submodule-setup
```

Or with arguments:

```bash
/submodule-setup my-project https://github.com/username/my-project.git
```

## Interactive Flow

The command will guide you through:

1. **Project Name**: Name for your submodule project
2. **GitHub URL**: GitHub repository URL for the submodule
3. **Directory Creation**: Creates the project directory structure
4. **Git Configuration**: Sets up local git repository
5. **Remote Setup**: Connects to GitHub repository
6. **Submodule Registration**: Configures parent project submodule settings
7. **Initial Commit**: Creates initial project structure

## What This Command Does

### 1. Project Directory Setup

- Creates `projects/{project-name}/` directory
- Initializes basic project structure
- Sets up `.gitignore` file

### 2. Git Repository Initialization

- Initializes local git repository
- Adds remote origin to GitHub
- Creates initial commit with project structure

### 3. Submodule Configuration

- Updates `.gitmodules` file in parent project
- Syncs submodule configuration
- Commits submodule changes to parent project

### 4. Validation

- Verifies GitHub repository accessibility
- Checks git configuration
- Tests submodule functionality

# CC-Deck Submodule Setup 🚀

Welcome! I'll help you create a new submodule project with interactive guidance.

Let me start by parsing any arguments you provided and gathering the necessary information.

## Parsing Arguments

I'll check what arguments were provided with the command.

## Gathering Project Information

Now I need to collect some information about your new project. Let me ask you a few questions:

### 1. Project Name

I need a name for your new submodule project.

**Requirements:**

- Use lowercase letters, numbers, and hyphens only
- 2-50 characters long
- Cannot start or end with hyphens
- No consecutive hyphens
- Cannot use reserved names

**Examples:** `my-blog-app`, `e-commerce-site`, `portfolio-website`

### 2. GitHub Repository URL

I need the GitHub repository URL where this project will be hosted.

**Requirements:**

- Must be a valid GitHub URL
- Format: `https://github.com/username/repository-name.git`
- The repository should already exist on GitHub
- Username and repository name must be valid

**Example:** `https://github.com/s-hiraoku/my-new-project.git`

### 3. Project Type (Optional)

What type of project template would you like to use?

**Available options:**

- `next-js` - Next.js 15 + React 19 + TypeScript + Tailwind CSS (default)
- `basic` - Basic project with minimal structure
- `other` - Custom project type

**Default:** `next-js`

## Step 2: Validation

I'll validate the provided information:

✅ **Project name validation**

- Check format (lowercase, hyphens, numbers only)
- Verify directory doesn't already exist
- Ensure valid project name length

✅ **GitHub URL validation**

- Verify URL format
- Check if repository exists (if accessible)
- Validate repository name matches project name

✅ **Configuration summary**

```
Project Configuration:
- Name: {project-name}
- Path: projects/{project-name}/
- GitHub: {github-url}
- Type: {project-type}
```

**Proceed with setup?** (y/n): _{waiting for confirmation}_

## Step 3: Project Directory Setup

Creating project directory and basic structure...

```bash
# Create project directory
mkdir -p projects/{project-name}
cd projects/{project-name}

# Create basic project structure based on type
```

**Next.js Project Structure**:

```
projects/{project-name}/
├── README.md
├── package.json
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/
│   └── lib/
└── public/
```

**Other Project Types**: Minimal structure with README.md, package.json, and .gitignore

## Step 4: Git Repository Initialization

Setting up local git repository...

```bash
# Initialize git repository
git init

# Create initial README
echo "# {project-name}" > README.md
echo "" >> README.md
echo "This project is part of the CC-Deck development platform." >> README.md

# Add remote origin
git remote add origin {github-url}

# Create .gitignore appropriate for project type
```

## Step 5: Initial Commit and Push

Creating initial commit...

```bash
# Stage all files
git add .

# Create initial commit
git commit -m "Initial project setup for {project-name}

- Add basic project structure
- Configure {project-type} development environment
- Set up gitignore and configuration files
- Ready for CC-Deck submodule integration"

# Set main branch and push
git branch -M main
git push -u origin main
```

## Step 6: Submodule Configuration

Configuring parent project submodule settings...

```bash
# Return to parent directory
cd /Volumes/SSD/development/cc-deck

# Update or create .gitmodules
```

**.gitmodules Configuration**:

```ini
[submodule "projects/{project-name}"]
    path = projects/{project-name}
    url = {github-url}
```

```bash
# Sync submodule configuration
git submodule sync projects/{project-name}
git submodule init projects/{project-name}

# Set remote HEAD
cd projects/{project-name}
git remote set-head origin main
```

## Step 7: Parent Project Update

Updating parent project with new submodule...

```bash
# Return to parent and commit changes
cd /Volumes/SSD/development/cc-deck

# Add .gitmodules changes
git add .gitmodules

# Commit submodule addition
git commit -m "Add {project-name} as Git submodule

- New submodule: projects/{project-name}
- Repository: {github-url}
- Type: {project-type}
- Configured for independent development and deployment"

# Add submodule reference
git add projects/{project-name}
git commit -m "Initialize {project-name} submodule reference"
```

## Step 8: Validation and Testing

Testing submodule functionality...

```bash
# Check submodule status
git submodule status

# Verify submodule can be updated
git submodule update --remote projects/{project-name}

# Test basic operations
cd projects/{project-name}
git status
git log --oneline -3
```

## Step 9: Success Summary

🎉 **Submodule Setup Complete!**

### What was created:

- ✅ Project directory: `projects/{project-name}/`
- ✅ Git repository initialized and connected to GitHub
- ✅ Basic {project-type} project structure
- ✅ Submodule configured in parent project
- ✅ Initial commit pushed to GitHub

### Next steps:

1. **Start developing**:

   ```bash
   cd projects/{project-name}
   # Install dependencies if applicable
   npm install  # for Next.js/React projects
   # Start development server
   npm run dev  # for Next.js/React projects
   ```

2. **Development workflow**:

   ```bash
   # Make changes in projects/{project-name}/
   git add .
   git commit -m "Your changes"
   git push origin main

   # Update parent project
   cd /Volumes/SSD/development/cc-deck
   git add projects/{project-name}
   git commit -m "Update {project-name} submodule"
   ```

3. **Documentation**:
   - See `docs/submodule-management.md` for detailed workflow
   - Project-specific README available at `projects/{project-name}/README.md`

### Useful commands:

- **Status check**: `git submodule status`
- **Update from remote**: `git submodule update --remote projects/{project-name}`
- **Project directory**: `cd projects/{project-name}`

**Setup completed successfully!** Your new submodule is ready for development. 🚀
