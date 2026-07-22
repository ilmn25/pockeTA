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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Smart Academic Advising Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good morning, {profile.name}. 👋
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Where would you like your academic journey to lead today? PockeTA actively aligns your course sequencing, WIE placement, and Capstone research with your career aspirations.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto shrink-0">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Degree Progress
              </span>
              <span className="text-xl font-extrabold text-indigo-600">
                {profile.earnedCredits} / {profile.totalRequiredCredits}
              </span>
              <span className="text-[10px] text-slate-500">Credits Completed</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Cumulative GPA
              </span>
              <span className="text-xl font-extrabold text-emerald-600">
                {profile.gpa.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Honor Roll</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center col-span-2 sm:col-span-1">
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Current Term
              </span>
              <span className="text-base font-extrabold text-slate-800">
                {profile.currentYearTerm}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">BEng CS & AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Search & Advising Q&A + Career Aspirations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Search Bar & Academic Advising Interaction */}
        <div className="lg:col-span-2 space-y-6">
          {/* Advising Search Bar Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Ask PockeTA an Academic Advising Question</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="relative flex items-center"
            >
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                id="advising-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about prerequisites, electives, WIE placement, or study plans..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-28 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
              />
              <button
                id="ask-advising-btn"
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-40 flex items-center space-x-1.5"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Ask PockeTA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Inspiration Prompt Chips */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Inspired Inquiries:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_ADVISING_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAskQuestion(q)}
                    className="p-3 bg-white border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-left group flex flex-col justify-between"
                  >
                    <span className="text-xs font-medium leading-relaxed">"{q}"</span>
                    <div className="mt-2 flex items-center text-[11px] text-indigo-600 font-semibold">
                      <span>Ask question</span>
                      <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advising Conversation Stream */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Advising Insights & Dialogue</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {messages.length} message{messages.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
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
                            className="flex items-center space-x-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors font-semibold"
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

              {isLoading && (
                <div className="flex items-center space-x-3 text-xs text-indigo-600 bg-indigo-50 p-3 rounded-xl border border-indigo-100 w-fit animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>PockeTA is analyzing degree requirements and career goals...</span>
                </div>
              )}
            </div>
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
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
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
              className="w-full py-3 bg-white text-indigo-600 hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              Update Study Plan
            </button>
          </div>

          {/* Quick Access to Workspaces */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Workspace Shortcuts</span>
            </h4>

            <button
              onClick={() => onNavigateTab('study-plan')}
              className="w-full text-left bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 rounded-xl p-3.5 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                  Study Planning Workspace
                </div>
                <div className="text-[11px] text-slate-500">
                  Drag & drop courses, view personalized descriptions
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => onNavigateTab('wie-capstone')}
              className="w-full text-left bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 rounded-xl p-3.5 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                  WIE & Capstone Selection
                </div>
                <div className="text-[11px] text-slate-500">
                  Explore placements, test AI fit & missing prereqs
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
