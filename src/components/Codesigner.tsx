import React, { useRef, useEffect } from 'react';
import { Sparkles, Send, User, Bot, Info, Target, Calendar, ArrowRight } from 'lucide-react';
import { StudentProfile, SemesterPlan } from '../types';
import { motion } from 'motion/react';

interface CodesignerProps {
  profile: StudentProfile;
  studyPlan: SemesterPlan[];
  aiChatLogs: { sender: 'user' | 'pocketa'; text: string }[];
  aiChatInput: string;
  setAiChatInput: (val: string) => void;
  isAiReplying: boolean;
  onSendAiChat: () => void;
}

export const Codesigner: React.FC<CodesignerProps> = ({
  profile,
  studyPlan,
  aiChatLogs,
  aiChatInput,
  setAiChatInput,
  isAiReplying,
  onSendAiChat
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiChatLogs]);

  const totalCredits = studyPlan.reduce((sum, sem) => 
    sum + sem.courses.reduce((s, c) => s + c.credits, 0), 0
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden animate-fade-in">
      {/* Header Section */}
      <div className="bg-slate-900 px-6 py-5 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center space-x-3">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Capstone AI Codesigner</h2>
            <p className="text-xs text-slate-400 font-medium">Design your custom thesis topic and research strategy</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Status</span>
            <span className="text-xs font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span>Ready to assist</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {aiChatLogs.map((log, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] space-x-3 ${log.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                    log.sender === 'user' 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                      : 'bg-white border-slate-200 text-slate-400 shadow-sm'
                  }`}>
                    {log.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  <div className={`group relative p-4 rounded-2xl text-sm leading-relaxed ${
                    log.sender === 'user'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-medium rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">
                      {log.text}
                    </div>
                    <span className={`text-[9px] absolute -bottom-4 ${log.sender === 'user' ? 'right-0' : 'left-0'} text-slate-400 font-bold uppercase tracking-widest`}>
                      {log.sender === 'user' ? 'You' : 'PockeTA'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isAiReplying && (
              <div className="flex justify-start">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-200 shrink-0">
            <div className="relative group">
              <textarea
                rows={2}
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSendAiChat();
                  }
                }}
                placeholder="Describe your research interests or a project idea to start designing your Capstone..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-inner"
              />
              <button
                onClick={onSendAiChat}
                disabled={isAiReplying || !aiChatInput.trim()}
                className="absolute right-3 bottom-3 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center group-focus-within:bg-indigo-600"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
              <span>Press Enter to send</span>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setAiChatInput("Brainstorm a Capstone topic for AI Healthcare")}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Brainstorm Topic
                </button>
                <span>•</span>
                <button 
                  onClick={() => setAiChatInput("Suggest a technical stack for a Vision project")}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Tech Stack
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Context Panel */}
        <div className="hidden lg:flex w-80 border-l border-slate-200 bg-white flex-col shrink-0">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center space-x-2">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Context Awareness</span>
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Goal</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {profile.careerGoals}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plan Status</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Credits Logged</span>
                    <span className="font-bold text-slate-800">{totalCredits} / 123</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((totalCredits / 123) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Capstone Design Tips</h3>
            <div className="space-y-3">
              {[
                { title: 'Topic Novelty', text: 'Consider integrating edge AI with privacy.', icon: ArrowRight },
                { title: 'Technical Depth', text: 'Aim for a complex implementation component.', icon: ArrowRight },
                { title: 'Feasibility', text: 'Ensure data availability for your research.', icon: ArrowRight },
              ].map((tip, i) => (
                <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 transition-all group">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 p-1 bg-slate-100 rounded text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <tip.icon className="w-2.5 h-2.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 mb-0.5">{tip.title}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{tip.text}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 border-t border-slate-100">
            <button 
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              onClick={() => setAiChatInput("Generate a structured Capstone proposal based on our discussion")}
            >
              <span>Generate Proposal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
