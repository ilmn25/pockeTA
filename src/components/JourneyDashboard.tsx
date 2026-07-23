import React, { useState } from 'react';
import { Search, Sparkles, Target, Compass, BookOpen, ArrowRight, Lightbulb, CheckCircle2, GraduationCap, Award, MessageSquare, RefreshCw, Layers, Briefcase, TrendingUp, Edit3, Check, X } from 'lucide-react';
import { StudentProfile, SemesterPlan, AdvisingMessage } from '../types';
import { SAMPLE_ADVISING_QUESTIONS } from '../data/mockData';

interface JourneyDashboardProps {
  profile: StudentProfile;
  studyPlan: SemesterPlan[];
  onOpenGoalModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'study-plan' | 'wie-capstone', extra?: any) => void;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
}

const PRESET_TARGET_JOBS = [
  {
    title: 'Full-Stack AI Software Engineer',
    salary: 'HKD 32,000 - 45,000 / mo',
    skills: ['Software Engineering', 'HCI & Web Development', 'Database Architecture', 'Machine Learning', 'Systems & Cloud Security']
  },
  {
    title: 'AI Systems Architect & LLM Product Lead',
    salary: 'HKD 40,000 - 58,000 / mo',
    skills: ['AI Architecture', 'Distributed Systems', 'Python / C++', 'Model Optimization', 'Software Engineering']
  },
  {
    title: 'HCI & AI UX Engineer',
    salary: 'HKD 30,000 - 42,000 / mo',
    skills: ['Human-Computer Interaction', 'User Research & Prototyping', 'Web Application Design', 'Object-Oriented Programming']
  },
  {
    title: 'Cybersecurity & Infrastructure Specialist',
    salary: 'HKD 35,000 - 48,000 / mo',
    skills: ['Systems Programming', 'Computer Networks', 'Systems Security', 'Cloud Infrastructure', 'Legal & Cyber Ethics']
  },
  {
    title: 'Data Engineering & ML Specialist',
    salary: 'HKD 34,000 - 46,000 / mo',
    skills: ['Machine Learning', 'Data Structures & Algorithms', 'Database Systems', 'Big Data Analytics', 'Data Protection']
  }
];

export const JourneyDashboard: React.FC<JourneyDashboardProps> = ({
  profile,
  studyPlan,
  onOpenGoalModal,
  onNavigateTab,
  onUpdateProfile
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTargetJobModalOpen, setIsTargetJobModalOpen] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState(profile.targetJob || 'Full-Stack AI Software Engineer');
  const [customJobSalary, setCustomJobSalary] = useState(profile.targetJobSalary || 'HKD 32,000 - 45,000 / mo');

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
      {/* Hero Welcome Banner - Re-engineered for density */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-indigo-100/50" />
        
        <div className="relative z-10 flex flex-col gap-8">
          {/* Top Section: Identity & Academic Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                  {profile.name}
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Department of Computing • {profile.major}
                </p>
              </div>
            </div>

            {/* Concise Integrated Stats (The "License" Info) */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">GPA</span>
                <div className="text-sm font-black text-slate-900 leading-none">{profile.gpa.toFixed(2)}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Term</span>
                <div className="text-sm font-black text-indigo-600 leading-none">{profile.currentYearTerm.split(' ')[0]} {profile.currentYearTerm.split(' ')[1]}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Cohort</span>
                <div className="text-sm font-black text-slate-900 leading-none">{profile.cohortYear}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Progress</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-slate-900 leading-none">{Math.round((profile.earnedCredits / profile.totalRequiredCredits) * 100)}%</span>
                  <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(profile.earnedCredits / profile.totalRequiredCredits) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Aspirations & Target Job */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Target className="w-3 h-3" />
                  <span>Core Aspiration</span>
                </span>
                <button onClick={onOpenGoalModal} className="text-[10px] font-bold text-indigo-600 hover:underline">Edit</button>
              </div>
              <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                "{profile.careerGoals}"
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.keySkillsInterest.map((skill, sIdx) => (
                  <span key={sIdx} className="text-[10px] bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-md font-bold uppercase">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg shadow-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Briefcase className="w-3 h-3" />
                  <span>Target Career Milestone</span>
                </span>
                <button onClick={() => setIsTargetJobModalOpen(true)} className="text-[10px] font-bold text-indigo-400 hover:underline">Switch</button>
              </div>
              <div className="space-y-1">
                <div className="text-base font-black text-white leading-tight">
                  {profile.targetJob}
                </div>
                <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400">
                  <TrendingUp className="w-3 h-3 text-indigo-500" />
                  <span>{profile.targetJobSalary}</span>
                </div>
              </div>
              <div className="pt-1 flex flex-wrap gap-1">
                {profile.targetJobSkills?.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase border border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Advising Chat Box (Now full width or adapted) */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* PockeTA AI Advising Chat Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-100 text-indigo-600 border border-slate-200 rounded-2xl shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">PockeTA AI Academic Advisor</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Smart Degree Strategy Engine</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear Conversation
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              {/* Chat Conversation Stream */}
              <div className="space-y-6 min-h-[400px] max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-16 h-16 bg-slate-100 text-indigo-600 border border-slate-200 rounded-3xl flex items-center justify-center shadow-inner">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-black text-slate-900">Initiate Advisory Session</h4>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
                        Consult your personalized AI advisor on prerequisites, career mapping, and graduation readiness.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                      {SAMPLE_ADVISING_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAskQuestion(q)}
                          className="p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 rounded-2xl transition-all text-xs font-bold leading-snug cursor-pointer flex items-center justify-between group shadow-sm hover:shadow-md"
                        >
                          <span>"{q}"</span>
                          <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === 'user' ? 'items-end' : 'items-start'
                        } space-y-2`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 text-sm leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-slate-900 text-white rounded-br-none shadow-xl'
                              : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {msg.sender === 'pocketa' && (
                            <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.1em] mb-3 pb-2 border-b border-slate-200/50">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>AI Advising Core</span>
                              <span className="text-slate-400 font-bold ml-auto">{msg.timestamp}</span>
                            </div>
                          )}

                          <div className="whitespace-pre-line font-medium leading-relaxed">
                            {msg.content}
                          </div>

                          {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200/50 flex flex-wrap gap-2">
                              {msg.suggestedActions.map((act, aIdx) => (
                                <button
                                  key={aIdx}
                                  onClick={() => handleActionClick(act)}
                                  className="flex items-center space-x-2 text-xs bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl transition-all font-bold cursor-pointer shadow-sm"
                                >
                                  <span>{act.label}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-center space-x-3 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-3 rounded-2xl border border-indigo-100 w-fit animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="uppercase tracking-widest">PockeTA Processing...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskQuestion();
                }}
                className="mt-6 relative flex items-center"
              >
                <div className="absolute left-4 p-1.5 bg-slate-100 rounded-lg">
                  <Search className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about Year 4 electives, graduation credits, or WIE requirements..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-24 py-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="absolute right-2.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-40 flex items-center space-x-2"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send</span>}
                </button>
              </form>
            </div>

            {/* AI Advisor Sidebar - Contextual Tips */}
            <div className="hidden lg:block space-y-6 border-l border-slate-100 pl-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contextual Reminders</h4>
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-700">
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-wider">Optimization</span>
                    </div>
                    <p className="text-[11px] font-bold text-amber-900/80 leading-relaxed">
                      You haven't completed your WIE requirements. PockeTA suggests looking for internships in Year 3 Summer.
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-700">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-wider">Goal Match</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                      Your chosen elective 'COMP4421' perfectly aligns with your "{profile.targetJob}" target role.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Quick Shortcuts</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => onNavigateTab('study-plan')} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-slate-100 rounded-xl transition-all group">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Study Planner</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                  <button onClick={() => onNavigateTab('wie-capstone')} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-slate-100 rounded-xl transition-all group">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Capstone Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Target Job Switcher / Editor Modal */}
      {isTargetJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-800 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Select or Customize Target Job</h3>
                  <p className="text-xs text-slate-500">PockeTA aligns course choices, WIE, and Capstones with your target role.</p>
                </div>
              </div>
              <button
                onClick={() => setIsTargetJobModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Preset Job Roles
              </span>
              <div className="space-y-2.5">
                {PRESET_TARGET_JOBS.map((preset, pIdx) => {
                  const isCurrent = profile.targetJob === preset.title;
                  return (
                    <div
                      key={pIdx}
                      onClick={() => {
                        if (isCurrent) return;
                        setCustomJobTitle(preset.title);
                        setCustomJobSalary(preset.salary);
                        if (onUpdateProfile) {
                          onUpdateProfile({
                            targetJob: preset.title,
                            targetJobSalary: preset.salary,
                            targetJobSkills: preset.skills
                          });
                        }
                        setIsTargetJobModalOpen(false);
                      }}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'border-slate-900 bg-slate-900 text-white cursor-default pointer-events-none'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-sm ${isCurrent ? 'text-white' : 'text-slate-900'}`}>{preset.title}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full border border-white/20">
                              Active Target
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>{preset.salary}</p>
                      </div>
                      <Check className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-slate-300'}`} />
                    </div>
                  );
                })}
              </div>

              {/* Custom Job Role Section */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Or Set Custom Role & Salary
                </span>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Role Title</label>
                  <input
                    type="text"
                    value={customJobTitle}
                    onChange={(e) => setCustomJobTitle(e.target.value)}
                    placeholder="e.g. Autonomous Vehicle Robotics Software Engineer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Monthly Salary Range</label>
                  <input
                    type="text"
                    value={customJobSalary}
                    onChange={(e) => setCustomJobSalary(e.target.value)}
                    placeholder="e.g. HKD 35,000 - 50,000 / mo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsTargetJobModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateProfile) {
                    onUpdateProfile({
                      targetJob: customJobTitle,
                      targetJobSalary: customJobSalary
                    });
                  }
                  setIsTargetJobModalOpen(false);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Target Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
