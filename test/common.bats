#!/usr/bin/env bats

# Test for common.sh utility functions

setup() {
    export SCRIPT_DIR="$BATS_TEST_DIRNAME/../scripts/workflow"
    export TEST_DIR="$(mktemp -d)"
    export ORIGINAL_PWD="$PWD"
    
    cd "$TEST_DIR"
    
    # common.shを読み込み
    source "$SCRIPT_DIR/utils/common.sh"
}

teardown() {
    cd "$ORIGINAL_PWD"
    rm -rf "$TEST_DIR"
}

@test "validate_args succeeds with valid input" {
    run validate_args "valid_value" "test_parameter"
    [ "$status" -eq 0 ]
}

@test "validate_args fails with empty input" {
    run validate_args "" "test_parameter"
    [ "$status" -ne 0 ]
    [[ "$output" =~ "エラー" ]]
    [[ "$output" =~ "test_parameter" ]]
}

@test "validate_args fails with whitespace-only input" {
    run validate_args "   " "test_parameter"
    [ "$status" -ne 0 ]
    [[ "$output" =~ "エラー" ]]
}

@test "array_contains finds existing element" {
    local test_array=("apple" "banana" "orange")
    
    run array_contains "banana" "${test_array[@]}"
    [ "$status" -eq 0 ]
}

@test "array_contains doesn't find non-existing element" {
    local test_array=("apple" "banana" "orange")
    
    run array_contains "grape" "${test_array[@]}"
    [ "$status" -eq 1 ]
}

@test "array_contains handles empty array" {
    local empty_array=()
    
    run array_contains "anything" "${empty_array[@]}"
    [ "$status" -eq 1 ]
}

@test "array_contains handles exact matches only" {
    local test_array=("test" "testing" "tester")
    
    # "test"は見つかる
    run array_contains "test" "${test_array[@]}"
    [ "$status" -eq 0 ]
    
    # 部分文字列は見つからない
    run array_contains "tes" "${test_array[@]}"
    [ "$status" -eq 1 ]
}

@test "safe_mkdir creates directory successfully" {
    run safe_mkdir "test_directory"
    
    [ "$status" -eq 0 ]
    [ -d "test_directory" ]
}

@test "safe_mkdir handles existing directory" {
    mkdir "existing_dir"
    
    run safe_mkdir "existing_dir"
    
    [ "$status" -eq 0 ]
    [ -d "existing_dir" ]
}

@test "safe_mkdir creates nested directories" {
    run safe_mkdir "path/to/nested/directory"
    
    [ "$status" -eq 0 ]
    [ -d "path/to/nested/directory" ]
}

@test "safe_write_file creates file with content" {
    local test_content="Hello, World!"
    
    run safe_write_file "test.txt" "$test_content"
    
    [ "$status" -eq 0 ]
    [ -f "test.txt" ]
    
    actual_content=$(cat "test.txt")
    [ "$actual_content" = "$test_content" ]
}

@test "safe_write_file overwrites existing file" {
    echo "original content" > "existing.txt"
    local new_content="new content"
    
    run safe_write_file "existing.txt" "$new_content"
    
    [ "$status" -eq 0 ]
    actual_content=$(cat "existing.txt")
    [ "$actual_content" = "$new_content" ]
}

@test "safe_write_file creates parent directories" {
    local test_content="test content"
    
    run safe_write_file "deep/path/file.txt" "$test_content"
    
    [ "$status" -eq 0 ]
    [ -f "deep/path/file.txt" ]
    
    actual_content=$(cat "deep/path/file.txt")
    [ "$actual_content" = "$test_content" ]
}

@test "info displays info messages" {
    run info "test information message"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "🔍" ]]
    [[ "$output" =~ "test information message" ]]
}

@test "success displays success messages" {
    run success "test success message"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "✅" ]]
    [[ "$output" =~ "test success message" ]]
}

@test "error_exit displays error and exits" {
    run error_exit "test error message"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "❌" ]]
    [[ "$output" =~ "test error message" ]]
}
