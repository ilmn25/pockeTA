import React, { useState } from 'react';
import { Search, Sparkles, Target, Compass, BookOpen, ArrowRight, Lightbulb, CheckCircle2, GraduationCap, Award, MessageSquare, RefreshCw, Layers } from 'lucide-react';
import { StudentProfile, SemesterPlan, AdvisingMessage } from '../types';
import { SAMPLE_ADVISING_QUESTIONS } from '../data/mockData';

interface JourneyDashboardProps {
  profile: StudentProfile;
  studyPlan: SemesterPlan[];
  onOpenGoalModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'study-plan' | 'wie-capstone', extra?: any) => void;
}

export const JourneyDashboard: React.FC<JourneyDashboardProps> = ({
  profile,
  studyPlan,
  onOpenGoalModal,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AdvisingMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'pocketa',
      timestamp: 'Just now',
      content: `Welcome to your PockeTA Journey Dashboard, ${profile.name}! I am your AI Academic Advising Assistant. I have reviewed your current degree requirements and career aspirations in **${profile.keySkillsInterest[0]} & ${profile.keySkillsInterest[1]}**. How can I help guide your university journey today?`,
      suggestedActions: [
        { label: 'Check Study Plan Alignment', actionType: 'NAVIGATE', payload: { tab: 'study-plan' } },
        { label: 'Explore WIE Internship Options', actionType: 'NAVIGATE', payload: { tab: 'wie-capstone' } }
      ]
    }
  ]);

  const totalCreditsPlanned = studyPlan.reduce(
    (acc, sem) => acc + sem.courses.reduce((cAcc, c) => cAcc + c.credits, 0),
    0
  );

  const handleAskQuestion = async (textToAsk?: string) => {
    const questionText = textToAsk || query;
    if (!questionText.trim()) return;

    const userMsg: AdvisingMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: questionText
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToAsk) setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/advising/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          studentProfile: profile,
          studyPlan
        })
      });

      const data = await response.json();

      const aiMsg: AdvisingMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'pocketa',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: data.answer || 'Thank you for your question. You can review your study plan for details.',
        suggestedActions: data.suggestedActions
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error asking question:', err);
      const fallbackMsg: AdvisingMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'pocketa',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `I've analyzed your question regarding "${questionText}". Based on your target goals in **${profile.careerGoals}**, I recommend prioritizing **COMP4423 Computer Vision** and **COMP4432 Machine Learning** in Year 4 Term 2 to prepare for Capstone and industry opportunities.`,
        suggestedActions: [
          { label: 'View Study Planner', actionType: 'NAVIGATE', payload: { tab: 'study-plan' } }
        ]
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: { label: string; actionType: string; payload?: any }) => {
    if (action.actionType === 'NAVIGATE') {
      onNavigateTab(action.payload?.tab || 'study-plan', action.payload);
    } else if (action.actionType === 'UPDATE_GOAL') {
      onOpenGoalModal();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good morning, {profile.name}. 👋
            </h1>
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium pt-1">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Department of Computing • {profile.major} ({profile.degreeName})</span>
            </div>
          </div>

          {/* Upgraded Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full lg:w-auto shrink-0">
            {/* Current Term Card */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-indigo-200/90 rounded-2xl p-4 shadow-2xs space-y-1.5 min-w-[170px]">
              <div className="flex items-center justify-between text-indigo-600">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">
                  Current Term
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 tracking-tight">
                {profile.currentYearTerm}
              </div>
              <div className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-2 py-0.5 rounded-md w-fit">
                Active Enrolled Term
              </div>
            </div>

            {/* Degree Progress Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1.5 min-w-[170px]">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">
                  Degree Progress
                </span>
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="text-lg font-black text-indigo-600 tracking-tight">
                {profile.earnedCredits} <span className="text-xs font-normal text-slate-500">/ {profile.totalRequiredCredits} Credits</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((profile.earnedCredits / profile.totalRequiredCredits) * 100))}%` }}
                />
              </div>
            </div>

            {/* Cumulative GPA Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1.5 min-w-[170px]">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">
                  Cumulative GPA
                </span>
                <Award className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-lg font-black text-emerald-600 tracking-tight">
                {profile.gpa.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ 4.30</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md w-fit flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Dean's Honor Roll</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Advising Chat Box + Career Aspirations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: PockeTA AI Advising Chat Box & Conversation */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                    <span>PockeTA AI Academic Advisor</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono font-semibold">
                      Live Assistant
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ask any questions about degree requirements, prerequisites, or study plans.
                  </p>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  title="Clear chat history"
                >
                  Clear chat
                </button>
              )}
            </div>

            {/* Chat Conversation Stream & Empty Suggestions */}
            <div className="space-y-4 min-h-[320px] max-h-[460px] overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Start a Conversation with PockeTA</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Select one of the suggested inquiries below or type your question in the chat input.
                    </p>
                  </div>

                  {/* Suggestions when empty */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-xl mx-auto">
                    {SAMPLE_ADVISING_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAskQuestion(q)}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 rounded-xl transition-all text-xs font-semibold leading-snug cursor-pointer flex items-center justify-between group"
                      >
                        <span>"{q}"</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      } space-y-2`}
                    >
                      <div
                        className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                            : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {msg.sender === 'pocketa' && (
                          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-2 pb-1.5 border-b border-slate-200/60">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>PockeTA AI Advisor</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              • {msg.timestamp}
                            </span>
                          </div>
                        )}

                        <div className="whitespace-pre-line font-sans">
                          {msg.content}
                        </div>

                        {/* Action Buttons if available */}
                        {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-2">
                            {msg.suggestedActions.map((act, aIdx) => (
                              <button
                                key={aIdx}
                                onClick={() => handleActionClick(act)}
                                className="flex items-center space-x-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer"
                              >
                                <span>{act.label}</span>
                                <ArrowRight className="w-3 h-3 text-indigo-600" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Suggested questions at bottom if messages exist */}
                  {messages.length < 3 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                        Suggested Inquiries:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {SAMPLE_ADVISING_QUESTIONS.slice(0, 3).map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAskQuestion(q)}
                            className="text-[11px] bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-lg transition-colors font-medium text-left cursor-pointer"
                          >
                            "{q}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {isLoading && (
                <div className="flex items-center space-x-3 text-xs text-indigo-600 bg-indigo-50 p-3 rounded-xl border border-indigo-100 w-fit animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>PockeTA is analyzing degree requirements and career goals...</span>
                </div>
              )}
            </div>

            {/* Chat Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="relative flex items-center pt-3 border-t border-slate-100"
            >
              <Search className="absolute left-3.5 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input
                id="advising-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask PockeTA about prerequisites, electives..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 sm:pl-11 pr-20 sm:pr-24 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
              />
              <button
                id="ask-advising-btn"
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-1.5 sm:right-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-40 flex items-center space-x-1 cursor-pointer min-h-[36px]"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Ask</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Career Goals & Aspirations Record Card */}
        <div className="space-y-6">
          {/* Aspirations & Career Goals Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">My Aspirations</h3>
              </div>
              <button
                id="edit-aspirations-btn"
                onClick={onOpenGoalModal}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1.5">
              <span className="block text-xs font-semibold text-slate-400">
                Long-term Career & Core Motivation
              </span>
              <p className="text-sm font-bold text-slate-800 leading-relaxed">
                "{profile.careerGoals}"
              </p>
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Specialized Technical Focus Areas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.keySkillsInterest.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="flex items-center justify-between">
                <span>Personalized Course Mapping:</span>
                <span className="text-emerald-600 font-semibold">Active & Synced</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Degree Specialization:</span>
                <span className="text-slate-800 font-medium">Medical AI & Vision</span>
              </div>
            </div>
          </div>

          {/* AI Banner Suggestion Card */}
          <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-90">AI Suggestion</span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              To align better with your target goal in Medical AI & Computer Vision, PockeTA suggests verifying 'AI4001 Computer Vision' in Year 3.
            </p>
            <button
              onClick={() => onNavigateTab('study-plan')}
              className="w-full py-3 bg-white text-indigo-600 hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              Update Study Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
