'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import MeaningSearchHero from '../components/MeaningSearchHero';
import WordCard from '../components/WordCard';
import EvolutionSlider from '../components/EvolutionSlider';
import DialectMap from '../components/DialectMap';
import GroundedAIDrawer from '../components/GroundedAIDrawer';
import DemoGuideBadge from '../components/DemoGuideBadge';
import { fetchMeaningSearch } from '../lib/api-client';
import mockData from '../mocks/thai-context-mock.json';
import { Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(mockData.meaning_search);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [isAbstention, setIsAbstention] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const data = await fetchMeaningSearch(query);
      setSearchResult(data);
      if (data?.guardrail?.abstention_triggered) {
        setIsAbstention(true);
        setDrawerOpen(true);
      } else {
        setIsAbstention(false);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEvidence = (evidence: any) => {
    setSelectedEvidence(evidence);
    setIsAbstention(false);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header Navigation */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* 2. Hero Search Bar */}
        <MeaningSearchHero
          onSearch={handleSearch}
          isLoading={isLoading}
          parsedIntent={searchResult?.query_understanding}
        />

        {/* 3. Results Section */}
        {searchResult?.guardrail?.abstention_triggered ? (
          /* Safe Abstention Alert Banner */
          <div className="max-w-4xl mx-auto my-6 p-5 bg-amber-950/40 border border-amber-800/80 rounded-2xl flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-amber-400 text-sm">
                🛡️ THAI CONTEXT Anti-Hallucination Safe Abstention
              </div>
              <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                {searchResult?.guardrail?.message ||
                  'ระบบไม่พบคำศัพท์ที่มีความหมายตรงตามเงื่อนไขในพจนานุกรมฉบับทางการ เพื่อรักษาความน่าเชื่อถือทางวิชาการ ระบบจึงไม่สร้างคำตอบขึ้นมาเอง'}
              </p>
            </div>
          </div>
        ) : (
          /* Recommended Words Cards */
          <div className="max-w-4xl mx-auto my-6">
            <div className="flex items-center space-x-2 text-slate-300 font-bold text-base mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>คำศัพท์ที่ระบบแนะนำตามบริบท</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResult?.recommendations?.map((word: any) => (
                <WordCard
                  key={word.headword}
                  word={word}
                  onOpenEvidence={handleOpenEvidence}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. 3-Era Evolution Timeline Slider */}
        <EvolutionSlider />

        {/* 5. Dialect Cultural Explorer */}
        <DialectMap />
      </main>

      {/* Slide-over Evidence Drawer */}
      <GroundedAIDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        evidence={selectedEvidence}
        isAbstention={isAbstention}
      />

      {/* Floating Demo Cheatsheet Guide for Presenter */}
      <DemoGuideBadge />
    </div>
  );
}
