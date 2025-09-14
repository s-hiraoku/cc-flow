#!/bin/bash

# テスト用のセットアップ
set -euo pipefail

# テスト対象をソース
source "$(dirname "$0")/../utils/common.sh"

# テストカウンター
TESTS_PASSED=0
TESTS_FAILED=0

# テスト関数
assert_equals() {
    local expected="$1"
    local actual="$2"
    local test_name="${3:-Test}"
    
    if [[ "$expected" == "$actual" ]]; then
        echo "✅ $test_name: PASSED"
        ((TESTS_PASSED++))
    else
        echo "❌ $test_name: FAILED"
        echo "   Expected: $expected"
        echo "   Actual: $actual"
        ((TESTS_FAILED++))
    fi
}

assert_contains() {
    local haystack="$1"
    local needle="$2"
    local test_name="${3:-Test}"
    
    if [[ "$haystack" == *"$needle"* ]]; then
        echo "✅ $test_name: PASSED"
        ((TESTS_PASSED++))
    else
        echo "❌ $test_name: FAILED"
        echo "   '$needle' not found in '$haystack'"
        ((TESTS_FAILED++))
    fi
}

# テスト実行
echo "Running tests for common.sh..."
echo "================================"

# validate_args のテスト
test_validate_args() {
    echo "Testing validate_args..."
    
    # 正常系
    if validate_args "test_value" "test_name" 2>/dev/null; then
        assert_equals "0" "$?" "validate_args with valid input"
    fi
    
    # 異常系（エラー出力をキャプチャ）
    local error_output
    if ! error_output=$(validate_args "" "test_name" 2>&1); then
        assert_contains "$error_output" "エラー" "validate_args with empty input"
    fi
}

# array_contains のテスト
test_array_contains() {
    echo "Testing array_contains..."
    
    local test_array=("apple" "banana" "orange")
    
    # 存在する要素
    if array_contains "banana" "${test_array[@]}"; then
        assert_equals "0" "$?" "array_contains with existing element"
    fi
    
    # 存在しない要素
    if ! array_contains "grape" "${test_array[@]}"; then
        assert_equals "1" "$?" "array_contains with non-existing element"
    fi
}

# テスト実行
test_validate_args
test_array_contains

# 結果サマリー
echo ""
echo "================================"
echo "Test Results:"
echo "  Passed: $TESTS_PASSED"
echo "  Failed: $TESTS_FAILED"
echo "================================"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "💔 Some tests failed"
    exit 1
fi