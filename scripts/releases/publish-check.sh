#!/bin/bash

# publish-check.sh
# NPM publish readiness check for @hiraoku/cc-flow-cli

set -e

# Colors and symbols
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="🔍"

# Command arguments
FIX_MODE=false
DRY_RUN=false

for arg in "$@"; do
  case $arg in
    --fix)
      FIX_MODE=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
  esac
done

# Helper functions
print_header() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}${CHECK} NPM Publish Readiness Check${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

print_section() {
  local emoji="$1"
  local title="$2"
  local status="$3"
  printf "%-30s %s\n" "${emoji} ${title}" "${status}"
}

print_error() {
  echo -e "${RED}${CROSS} $1${NC}"
}

print_success() {
  echo -e "${GREEN}${CHECK} $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}${WARNING} $1${NC}"
}

print_info() {
  echo -e "${BLUE}${INFO} $1${NC}"
}

# Check functions
check_required_files() {
  local errors=0
  
  print_info "📋 プロジェクト必須ファイル検証中..."
  
  # Check package.json
  if [ ! -f "package.json" ]; then
    print_error "package.json が見つかりません"
    errors=$((errors + 1))
  else
    print_success "package.json 存在確認"
  fi
  
  # Check README.md
  if [ ! -f "README.md" ]; then
    print_warning "README.md が見つかりません"
    if [ "$FIX_MODE" = true ]; then
      print_info "README.md を作成しています..."
      create_readme
    fi
    errors=$((errors + 1))
  else
    print_success "README.md 存在確認"
  fi
  
  # Check .gitignore
  if [ ! -f ".gitignore" ]; then
    print_warning ".gitignore が見つかりません"
    if [ "$FIX_MODE" = true ]; then
      print_info ".gitignore を作成しています..."
      create_gitignore
    fi
    errors=$((errors + 1))
  else
    print_success ".gitignore 存在確認"
  fi
  
  return $errors
}

check_package_json() {
  local errors=0
  
  print_info "🔍 Package.json 詳細検証中..."
  
  # Check required fields
  local name=$(node -e "console.log(require('./package.json').name || '')")
  local version=$(node -e "console.log(require('./package.json').version || '')")
  local description=$(node -e "console.log(require('./package.json').description || '')")
  
  if [ -z "$name" ]; then
    print_error "package.json に name フィールドがありません"
    if [ "$FIX_MODE" = true ]; then
      print_info "package.json の name を設定しています..."
      update_package_json_name
    fi
    errors=$((errors + 1))
  else
    print_success "name: $name"
  fi
  
  if [ -z "$version" ]; then
    print_error "package.json に version フィールドがありません"
    errors=$((errors + 1))
  else
    print_success "version: $version"
  fi
  
  if [ -z "$description" ]; then
    print_warning "package.json に description フィールドがありません"
    if [ "$FIX_MODE" = true ]; then
      print_info "package.json の description を設定しています..."
      update_package_json_description
    fi
    errors=$((errors + 1))
  else
    print_success "description: $description"
  fi
  
  return $errors
}

check_build() {
  local errors=0
  
  print_info "🏗️ ビルドとコンパイル検証中..."
  
  # Check if build script exists
  local build_script=$(node -e "console.log(require('./package.json').scripts?.build || '')")
  
  if [ -z "$build_script" ]; then
    print_warning "package.json に build スクリプトがありません"
    errors=$((errors + 1))
  else
    print_info "build スクリプトを実行中..."
    if npm run build > /dev/null 2>&1; then
      print_success "ビルド成功"
    else
      print_error "ビルドが失敗しました"
      errors=$((errors + 1))
    fi
  fi
  
  return $errors
}

check_tests() {
  local errors=0
  
  print_info "🧪 テストとコード品質確認中..."
  
  # Check test script
  local test_script=$(node -e "console.log(require('./package.json').scripts?.test || '')")
  
  if [ -z "$test_script" ]; then
    print_warning "package.json に test スクリプトがありません"
    errors=$((errors + 1))
  else
    print_info "テストを実行中..."
    if npm test > /dev/null 2>&1; then
      print_success "テスト成功"
    else
      print_error "テストが失敗しました"
      errors=$((errors + 1))
    fi
  fi
  
  return $errors
}

check_package_contents() {
  local errors=0
  
  print_info "📁 パッケージ内容検証中..."
  
  # Check templates directory
  if [ ! -d "templates" ]; then
    print_error "templates/ ディレクトリが見つかりません"
    errors=$((errors + 1))
  else
    print_success "templates/ ディレクトリ存在確認"
  fi
  
  # Check scripts directory
  if [ ! -d "scripts" ]; then
    print_error "scripts/ ディレクトリが見つかりません"
    errors=$((errors + 1))
  else
    print_success "scripts/ ディレクトリ存在確認"
  fi
  
  # Check .claude/agents directory
  if [ ! -d ".claude/agents" ]; then
    print_error ".claude/agents/ ディレクトリが見つかりません"
    errors=$((errors + 1))
  else
    print_success ".claude/agents/ ディレクトリ存在確認"
  fi
  
  return $errors
}

check_cli_functionality() {
  local errors=0
  
  print_info "🔧 CLI機能テスト中..."
  
  # Check bin script
  if [ ! -f "bin/cc-flow.js" ]; then
    print_error "bin/cc-flow.js が見つかりません"
    errors=$((errors + 1))
  else
    if [ -x "bin/cc-flow.js" ]; then
      print_success "bin/cc-flow.js 実行可能"
    else
      print_error "bin/cc-flow.js に実行権限がありません"
      if [ "$FIX_MODE" = true ]; then
        chmod +x bin/cc-flow.js
        print_success "実行権限を付与しました"
      fi
      errors=$((errors + 1))
    fi
  fi
  
  return $errors
}

check_package_size() {
  local errors=0
  
  print_info "📈 パッケージサイズ確認中..."
  
  if [ "$DRY_RUN" = true ] || [ "$FIX_MODE" = true ]; then
    if command -v npm &> /dev/null; then
      local size=$(npm pack --dry-run 2>/dev/null | grep "package size" | awk '{print $3}' || echo "unknown")
      if [ "$size" != "unknown" ]; then
        print_success "パッケージサイズ: $size"
      else
        print_warning "パッケージサイズを確認できませんでした"
      fi
    fi
  fi
  
  return $errors
}

check_final_publish() {
  local errors=0
  
  print_info "🚀 公開前最終確認中..."
  
  if [ "$DRY_RUN" = true ]; then
    print_info "npm publish --dry-run を実行中..."
    if npm publish --dry-run > /dev/null 2>&1; then
      print_success "パッケージ公開準備完了"
    else
      print_error "npm publish --dry-run が失敗しました"
      errors=$((errors + 1))
    fi
  else
    print_success "最終確認スキップ（--dry-run 未指定）"
  fi
  
  return $errors
}

# Fix functions
create_readme() {
  cat > README.md << 'EOF'
# CC-Flow CLI

Claude Code workflow platform that enables sequential execution of sub-agents through custom slash commands.

## Installation

```bash
npm install -g @hiraoku/cc-flow-cli
```

## Usage

```bash
# Create a new workflow
cc-flow create-workflow spec "3 4 1 6 2"

# Execute workflow
cc-flow spec-workflow "Your task context"
```

## Features

- POML (Prompt Orchestration Markup Language) integration
- Modular script architecture
- Custom slash commands
- Sequential sub-agent execution

## License

MIT
EOF
}

create_gitignore() {
  cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.env
.DS_Store
*.tgz
coverage/
.nyc_output/
EOF
}

update_package_json_name() {
  node -e "
    const pkg = require('./package.json');
    pkg.name = '@hiraoku/cc-flow-cli';
    require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  "
}

update_package_json_description() {
  node -e "
    const pkg = require('./package.json');
    pkg.description = 'Claude Code workflow platform with POML orchestration';
    require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  "
}

# Main execution
main() {
  print_header
  
  local total_errors=0
  
  # Run all checks
  check_required_files || total_errors=$((total_errors + $?))
  echo ""
  
  check_package_json || total_errors=$((total_errors + $?))
  echo ""
  
  check_build || total_errors=$((total_errors + $?))
  echo ""
  
  check_tests || total_errors=$((total_errors + $?))
  echo ""
  
  check_package_contents || total_errors=$((total_errors + $?))
  echo ""
  
  check_cli_functionality || total_errors=$((total_errors + $?))
  echo ""
  
  check_package_size || total_errors=$((total_errors + $?))
  echo ""
  
  check_final_publish || total_errors=$((total_errors + $?))
  echo ""
  
  # Summary
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  if [ $total_errors -eq 0 ]; then
    local pkg_name=$(node -e "console.log(require('./package.json').name || 'unknown')")
    local pkg_version=$(node -e "console.log(require('./package.json').version || 'unknown')")
    echo -e "${GREEN}🎉 ${pkg_name} v${pkg_version} は公開準備完了です！${NC}"
    echo ""
    echo "次のステップ:"
    echo "npm publish"
  else
    echo -e "${RED}${CROSS} $total_errors 個の問題が見つかりました${NC}"
    if [ "$FIX_MODE" = false ]; then
      echo ""
      echo "修正するには --fix フラグを使用してください:"
      echo "./scripts/releases/publish-check.sh --fix"
    fi
  fi
  
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  return $total_errors
}

# Run main function
main "$@"