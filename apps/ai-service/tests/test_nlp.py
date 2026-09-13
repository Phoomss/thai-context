import pytest
from app.services.nlp.tokenizer import ThaiNLPTokenizer
from app.services.nlp.query_parser import query_parser
from app.services.rag.guardrail import hallucination_guard
from app.models.schemas import EvidenceItem

def test_thai_tokenizer():
    text = "การพัฒนาประสิทธิภาพในการทำงาน"
    tokens = ThaiNLPTokenizer.tokenize(text)
    assert len(tokens) > 0
    assert "ประสิทธิภาพ" in tokens

def test_query_understanding_intent_and_exclusions():
    query = "อยากบอกว่าคนนี้ทำงานได้ดี แต่ไม่อยากใช้คำว่าเก่ง"
    res = query_parser.parse(query)
    assert res.intent == "find_alternative_word"
    assert "เก่ง" in res.excluded_terms
    assert "ทำงานได้ดี" in res.meaning

def test_query_understanding_with_context():
    query = "ทำงานเร็ว ในบริบทรายงานมหาวิทยาลัย"
    res = query_parser.parse(query)
    assert res.context == "รายงานมหาวิทยาลัย"

def test_hallucination_guard_empty():
    passed, reason = hallucination_guard.validate([])
    assert passed is False
    assert "ไม่พบหลักฐาน" in reason

def test_hallucination_guard_low_relevance():
    evidences = [
        EvidenceItem(
            word="คำใดๆ",
            source="ทดสอบ",
            edition="2554",
            definition="นิยาม",
            relevance=0.30
        )
    ]
    passed, reason = hallucination_guard.validate(evidences)
    assert passed is False
    assert "ต่ำกว่าเกณฑ์" in reason

def test_hallucination_guard_passed():
    evidences = [
        EvidenceItem(
            word="ประสิทธิภาพ",
            source="สำนักงานราชบัณฑิตยสภา",
            edition="2554",
            definition="ความสามารถในการทำงาน",
            relevance=0.88
        )
    ]
    passed, reason = hallucination_guard.validate(evidences)
    assert passed is True
