import asyncio
import sys
from tests.test_ai_assistant import (
    test_1_grounded_answer,
    test_2_academic_usage,
    test_3_unknown_word_abstention,
    test_4_hallucination_attempt_rejection,
    test_5_writing_suggestion_separation,
    test_6_sse_streaming_events,
    test_7_confidence_calculation_weights,
    test_8_multi_word_comparison_uses_every_word,
)

def main():
    print("Running AI Assistant Test Suite...")
    
    print("Test 1: Grounded Answer...", end=" ")
    test_1_grounded_answer()
    print("PASS")

    print("Test 2: Academic Usage...", end=" ")
    test_2_academic_usage()
    print("PASS")

    print("Test 3: Unknown Word Abstention...", end=" ")
    test_3_unknown_word_abstention()
    print("PASS")

    print("Test 4: Hallucination Attempt Rejection...", end=" ")
    test_4_hallucination_attempt_rejection()
    print("PASS")

    print("Test 5: Writing Suggestion Separation...", end=" ")
    test_5_writing_suggestion_separation()
    print("PASS")

    print("Test 6: SSE Streaming Events...", end=" ")
    asyncio.run(test_6_sse_streaming_events())
    print("PASS")

    print("Test 7: Confidence Calculation Weights...", end=" ")
    test_7_confidence_calculation_weights()
    print("PASS")

    print("Test 8: Multi-word comparison covers every word...", end=" ")
    test_8_multi_word_comparison_uses_every_word()
    print("PASS")

    print("\n✅ All 8 AI Assistant Tests Passed Successfully!")

if __name__ == "__main__":
    main()
