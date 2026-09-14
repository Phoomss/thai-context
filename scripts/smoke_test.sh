#!/usr/bin/env bash
# ==============================================================================
# THAI CONTEXT — Automated Backend Smoke Test Suite
# Tests all 12 Core Endpoints across NestJS (3001) and FastAPI (8000)
# ==============================================================================

API_URL="${API_URL:-http://localhost:3001}"
AI_URL="${AI_URL:-http://localhost:8000}"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

assert_endpoint() {
  local name="$1"
  local method="$2"
  local url="$3"
  local data="$4"
  local expected_keyword="$5"

  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -e "\n${BLUE}▶ Test #${TOTAL_TESTS}: [${method}] ${name}${NC}"
  echo -e "  URL: ${url}"

  local response=""
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "${url}" -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X POST "${url}" -H "Content-Type: application/json" -d "${data}")
  fi

  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')

  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    if [ -n "$expected_keyword" ]; then
      if echo "$body" | grep -q "$expected_keyword"; then
        echo -e "  ${GREEN}✔ PASS${NC} (HTTP ${http_code} — Found keyword: '${expected_keyword}')"
        PASSED_TESTS=$((PASSED_TESTS + 1))
      else
        echo -e "  ${RED}✘ FAIL${NC} (HTTP ${http_code} — Expected keyword '${expected_keyword}' not found)"
        echo -e "  Response: ${body:0:300}..."
        FAILED_TESTS=$((FAILED_TESTS + 1))
      fi
    else
      echo -e "  ${GREEN}✔ PASS${NC} (HTTP ${http_code})"
      PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
  else
    echo -e "  ${RED}✘ FAIL${NC} (HTTP ${http_code})"
    echo -e "  Response: ${body:0:300}..."
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

echo -e "=================================================================="
echo -e "${YELLOW}🇹🇭 THAI CONTEXT — Running Backend Smoke Tests${NC}"
echo -e "Target Core API: ${API_URL}"
echo -e "Target AI Service: ${AI_URL}"
echo -e "=================================================================="

# 1. Health Checks
assert_endpoint "Core API Health" "GET" "${API_URL}/health" "" "status"
assert_endpoint "AI Service Health" "GET" "${AI_URL}/health" "" "ok"

# 2. Keyword Search
assert_endpoint "Keyword Search (Exact/Partial)" "GET" "${API_URL}/api/v1/search?q=%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E" "" "ประสิทธิภาพ"
assert_endpoint "Keyword & Edition Search (Task 6: edition=2554 & source=ROYAL_SOCIETY)" "GET" "${API_URL}/api/v1/search?q=%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E&edition=2554&source=ROYAL_SOCIETY" "" "2554"

# 3. Meaning-First Search
assert_endpoint "Meaning-first Search (ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน)" "POST" "${API_URL}/api/v1/search/meaning" \
  '{"query": "ทำงานได้ผลลัพธ์สูงสุดตามเป้าหมาย"}' "results"

# 4. Context Search with Negative Constraints
assert_endpoint "Context Search with Exclusion" "POST" "${API_URL}/api/v1/search/context" \
  '{"query": "อยากได้คำทางการที่หมายถึง ทำงานสำเร็จ แต่ไม่เอาคำว่า เสร็จ", "context": "เอกสารวิชาการ"}' "results"

# 5. Word Detail (Multi-Edition & AI Guidance)
assert_endpoint "Word Detail (Official + AI Assistance)" "GET" "${API_URL}/api/v1/dictionary/words/%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E" "" "officialData"

# 6. Word Evolution (2542, 2554, 2569)
assert_endpoint "Word Evolution Timeline" "GET" "${API_URL}/api/v1/dictionary/words/%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E/evolution" "" "timeline"

# 7. Edition Change Detection
assert_endpoint "Edition Change Detection (ADDED/CHANGED/UNCHANGED)" "GET" "${API_URL}/api/v1/dictionary/compare/%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E" "" "editions"

# 8. Nuanced Word Comparison
assert_endpoint "Nuanced Word Comparison (Side-by-Side)" "POST" "${API_URL}/api/v1/compare" \
  '{"words": ["ประสิทธิภาพ", "ประสิทธิผล"]}' "comparison"

# 9. Dialect Explorer
assert_endpoint "Regional Dialect Explorer" "GET" "${API_URL}/api/v1/dialect?region=NORTH" "" "results"

# 10. Standard to Dialect Mapping
assert_endpoint "Standard to Dialect Mapping (ลำ, แซ่บ, หรอย)" "GET" "${API_URL}/api/v1/dialect/mapping/%E0%B8%AD%E0%B8%A3%E0%B9%88%E0%B8%AD%E0%B8%A2" "" "mappings"

# 11. Grounded RAG Chat
assert_endpoint "Grounded RAG Assistant (Anti-Hallucination)" "POST" "${API_URL}/api/v1/ai/chat" \
  '{"message": "คำว่าประสิทธิภาพมีนิยามทางการว่าอย่างไร และควรใช้ในบริบทใด?"}' "answer"

# 12. Feedback Submission
assert_endpoint "User Feedback Submission" "POST" "${API_URL}/api/v1/feedback" \
  '{"queryText": "ทำงานสำเร็จ", "userAction": "THUMBS_UP", "rating": 5}' "success"

echo -e "\n=================================================================="
echo -e "${YELLOW}📊 Smoke Test Results:${NC}"
echo -e "  Total:  ${TOTAL_TESTS}"
echo -e "  Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "  Failed: ${RED}${FAILED_TESTS}${NC}"
echo -e "=================================================================="

if [ "$FAILED_TESTS" -eq 0 ]; then
  echo -e "${GREEN}🎉 All Smoke Tests Passed Successfully! Platform is Demo Ready.${NC}"
  exit 0
else
  echo -e "${RED}⚠️ Some tests failed. Please review the output above.${NC}"
  exit 1
fi
