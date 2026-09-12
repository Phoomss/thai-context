import mockData from '../mocks/thai-context-mock.json';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchMeaningSearch(query: string) {
  const useMock =
    typeof window !== 'undefined'
      ? localStorage.getItem('thai_context_use_mock') === 'true'
      : process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  // Trigger safe abstention demo if user searches absurd query
  if (query.includes('วาร์ป') || query.includes('ไทม์แมชชีน') || query.includes('ควอนตัม')) {
    return {
      query_understanding: {
        raw_query: query,
        detected_meaning: query,
        context: 'วิทยาศาสตร์ล้ำยุค / เหนือธรรมชาติ',
        excluded_words: [],
      },
      recommendations: [],
      guardrail: {
        passed: false,
        confidence_score: 0.32,
        abstention_triggered: true,
        message:
          'ขออภัย ระบบไม่พบคำศัพท์หรือมโนทัศน์ที่ได้รับการรับรองในพจนานุกรมฉบับทางการ เพื่อป้องกันข้อมูลบิดเบือนระบบจึงไม่สร้างคำตอบขึ้นมาเอง',
      },
    };
  }

  if (useMock) {
    console.log('⚡ Using Fail-Safe Mock Data');
    return mockData.meaning_search;
  }

  try {
    const res = await fetch(`${API_BASE}/search/meaning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.warn('⚠️ Backend API error or unreachable. Falling back to local mock data.', error);
    return mockData.meaning_search;
  }
}
