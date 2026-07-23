import React, { useState, useEffect } from 'react';
import { Award, Briefcase, GraduationCap, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, X, Check, ShieldCheck, MapPin, DollarSign, Clock, Users, Building2, BookOpen, Plus, Send, Lightbulb, Code, Layers } from 'lucide-react';
import { WIEPosition, CapstoneProject, StudentProfile, SemesterPlan } from '../types';
import { Codesigner } from './Codesigner';

interface WieCapstoneSelectionProps {
  profile: StudentProfile;
  studyPlan: SemesterPlan[];
  wiePositions: WIEPosition[];
  capstoneProjects: CapstoneProject[];
  selectedWieId: string | null;
  selectedCapstoneId: string | null;
  onSelectWie: (id: string) => void;
  onSelectCapstone: (id: string) => void;
  onRemediateAndRedirect: (missingCourseCodes: string[]) => void;
  onAddCustomCapstone?: (newCap: CapstoneProject) => void;
  initialActiveSubTab: 'wie' | 'capstone';
  // Codesigner Props
  aiChatLogs: { sender: 'user' | 'pocketa', text: string }[];
  aiChatInput: string;
  setAiChatInput: (val: string) => void;
  isAiReplying: boolean;
  onSendAiChat: (text?: string) => void;
}

const COURSE_NAME_MAP: Record<string, string> = {
  'COMP3211': 'Software Engineering',
  'COMP2411': 'Database Systems',
  'COMP3423': 'Human Computer Interaction',
  'COMP2021': 'Object-Oriented Programming',
  'COMP3438': 'System Programming',
  'COMP3334': 'Computer Systems Security',
  'COMP4913': 'Capstone Project',
  'COMP2011': 'Data Structures',
  'COMP2432': 'Operating Systems',
  'COMP4432': 'Machine Learning',
  'COMP4423': 'Computer Vision',
  'COMP3511': 'Legal Aspects and Ethics of Computing',
  'COMP4442': 'Service and Cloud Computing',
  'COMP3421': 'Web Application Design'
};

const CO_DESIGN_DOMAINS = [
  'Healthcare AI & Medical Vision',
  'Full-Stack Web Architecture & Cloud',
  'Cybersecurity & Zero-Trust Infrastructure',
  'FinTech & High-Frequency Systems',
  'Autonomous Robotics & Edge Sensing',
  'HCI & AI Co-Pilot Interaction'
];

const CO_DESIGN_STACKS = [
  'React / TypeScript / Vite',
  'PyTorch / TensorFlow / CUDA',
  'C++20 / POSIX Systems',
  'Docker / Kubernetes / Microservices',
  'Python / OpenCV / MediaPipe'
];

export const WieCapstoneSelection: React.FC<WieCapstoneSelectionProps> = ({
  profile,
  studyPlan,
  wiePositions,
  capstoneProjects,
  selectedWieId,
  selectedCapstoneId,
  onSelectWie,
  onSelectCapstone,
  onRemediateAndRedirect,
  onAddCustomCapstone,
  initialActiveSubTab,
  aiChatLogs,
  aiChatInput,
  setAiChatInput,
  isAiReplying,
  onSendAiChat
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'selection' | 'codesigner'>('selection');

  useEffect(() => {
    setActiveSubTab('selection');
  }, [initialActiveSubTab]);

  // AI Co-Designer Modal State
  const [isCoDesignerOpen, setIsCoDesignerOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(CO_DESIGN_DOMAINS[0]);
  const [selectedStack, setSelectedStack] = useState<string[]>([CO_DESIGN_STACKS[0], CO_DESIGN_STACKS[1]]);
  const [customIdea, setCustomIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCapstone, setGeneratedCapstone] = useState<CapstoneProject | null>(null);

  // Set of planned/taken course codes in study plan
  const planCourseCodes = new Set<string>();
  studyPlan.forEach((s) => s.courses.forEach((c) => planCourseCodes.add(c.code)));

  const handleGenerateCoDesign = () => {
    setIsGenerating(true);
    setGeneratedCapstone(null);

    setTimeout(() => {
      const ideaPrompt = customIdea.trim() || `${selectedDomain} System`;
      const id = `cap_ai_${Date.now()}`;
      
      const newCap: CapstoneProject = {
        id,
        title: `AI-Driven ${selectedDomain}: ${ideaPrompt.slice(0, 45)}`,
        supervisor: 'Prof. David Lam & Dr. Raymond Lee (Interactive AI Research Lab)',
        department: 'Department of Computing',
        description: `An innovative Capstone research project co-designed with PockeTA AI. Focuses on developing a high-performance system for ${selectedDomain.toLowerCase()}, leveraging ${selectedStack.join(', ')}. Integrates automated evaluation, real-time telemetry, and rigorous empirical benchmarks.`,
        keyTech: [...selectedStack, selectedDomain],
        prerequisiteCourseCodes: ['COMP3211', 'COMP3423', 'COMP3438'],
        deliverables: 'Working full-stack prototype, empirical performance evaluation report, and publishable conference thesis paper.',
        difficulty: 'Advanced',
        capacity: '2 Students'
      };

      setGeneratedCapstone(newCap);
      setIsGenerating(false);
    }, 1200);
  };

  const handleSaveAndApplyCustomCapstone = () => {
    if (generatedCapstone && onAddCustomCapstone) {
      onAddCustomCapstone(generatedCapstone);
      setIsCoDesignerOpen(false);
      setGeneratedCapstone(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {initialActiveSubTab === 'wie' ? 'Work-Integrated Education (WIE)' : 'Capstone Project Portfolio'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {initialActiveSubTab === 'wie' 
              ? 'Explore internships and clinical AI placements aligned with your career goals.'
              : 'Choose a research topic or co-design a custom thesis project with PockeTA AI.'}
          </p>
        </div>

        {/* Sub-Tab Selector (Only for Capstone) */}
        {initialActiveSubTab === 'capstone' && (
          <div className="flex bg-slate-100/90 p-1 rounded-full border border-slate-200 shrink-0 w-full sm:w-auto">
            <button
              id="subtab-capstone-selection-btn"
              onClick={() => setActiveSubTab('selection')}
              disabled={activeSubTab === 'selection'}
              className={`flex items-center justify-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all flex-1 sm:flex-initial ${
                activeSubTab === 'selection'
                  ? 'bg-slate-900 text-white shadow-sm cursor-default pointer-events-none'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Projects ({capstoneProjects.length})</span>
            </button>

            <button
              id="subtab-capstone-codesigner-btn"
              onClick={() => setActiveSubTab('codesigner')}
              disabled={activeSubTab === 'codesigner'}
              className={`flex items-center justify-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all flex-1 sm:flex-initial ${
                activeSubTab === 'codesigner'
                  ? 'bg-slate-900 text-white shadow-sm cursor-default pointer-events-none'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">AI Codesigner</span>
            </button>
          </div>
        )}
      </div>

      {/* Conditional Content Rendering */}
      {initialActiveSubTab === 'wie' ? (
        /* WIE Positions List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wiePositions.map((pos) => {
            const isSelected = selectedWieId === pos.id;
            const missingPrereqs = pos.prerequisiteCourseCodes.filter((c) => !planCourseCodes.has(c));
            const isPrereqSatisfied = missingPrereqs.length === 0;

            return (
              <div
                key={pos.id}
                className={`bg-white border rounded-2xl p-6 transition-all shadow-sm flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                          {pos.logoBadge || pos.company}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {pos.type}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-2 leading-snug">
                        {pos.role}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center space-x-2 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pos.company}</span>
                        <span>•</span>
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pos.location}</span>
                      </p>
                    </div>

                    {isSelected && (
                      <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Primary Choice</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pos.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{pos.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{pos.stipend}</span>
                    </div>
                  </div>

                  {/* Related & Recommended Courses for WIE Placement */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="uppercase tracking-wider text-[10px] text-slate-500">Related & Recommended Courses</span>
                      <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                        {pos.prerequisiteCourseCodes.length} Preparatory Subjects
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {pos.prerequisiteCourseCodes.map((code) => {
                        const isPlannedOrTaken = planCourseCodes.has(code);
                        const title = COURSE_NAME_MAP[code] || 'Computing Subject';
                        return (
                          <div key={code} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                                {code}
                              </span>
                              <span className="font-semibold text-slate-800">{title}</span>
                            </div>
                            {isPlannedOrTaken ? (
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>In Plan</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => onRemediateAndRedirect([code])}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
                              >
                                <span>+ Add to Plan</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium italic">
                      {isPrereqSatisfied 
                        ? "✓ All prerequisites satisfied" 
                        : `⚠ Missing: ${missingPrereqs.join(', ')}`}
                    </span>
                    {!isPrereqSatisfied && (
                      <button
                        onClick={() => onRemediateAndRedirect(missingPrereqs)}
                        className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                      >
                        Add Missing to Plan
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => onSelectWie(pos.id)}
                    disabled={isSelected}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm cursor-default pointer-events-none'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isSelected ? 'Selected WIE Choice ✓' : 'Select Choice'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeSubTab === 'selection' ? (
        /* Capstone Selection Content */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capstoneProjects.map((cap) => {
              const isSelected = selectedCapstoneId === cap.id;
              const capPrereqCodes = cap.prerequisiteCourseCodes || ['COMP3211', 'COMP3423'];
              const missingPrereqs = capPrereqCodes.filter((c) => !planCourseCodes.has(c));
              const isPrereqSatisfied = missingPrereqs.length === 0;

              return (
                <div
                  key={cap.id}
                  className={`bg-white border rounded-2xl p-6 transition-all shadow-sm flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                      : 'border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                            {cap.difficulty}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            Cap: {cap.capacity}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 mt-2 leading-snug">
                          {cap.title}
                        </h3>
                        <p className="text-xs text-indigo-700 mt-1 font-semibold">
                          {cap.supervisor} • {cap.department}
                        </p>
                      </div>

                      {isSelected && (
                        <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Selected Capstone</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cap.description}
                    </p>

                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Key Technical Focus & Stack
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cap.keyTech.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] bg-slate-100 text-indigo-700 border border-slate-200 px-2 py-0.5 rounded font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Required Courses for Capstone */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Required Prerequisites</span>
                      </div>

                      <div className="space-y-1.5">
                        {capPrereqCodes.map((code) => {
                          const isPlannedOrTaken = planCourseCodes.has(code);
                          const title = COURSE_NAME_MAP[code] || 'Prerequisite Subject';
                          return (
                            <div key={code} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-bold text-indigo-700">
                                  {code}
                                </span>
                                <span className="font-medium text-slate-800">{title}</span>
                              </div>
                              {isPlannedOrTaken ? (
                                <span className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Satisfied</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => onRemediateAndRedirect([code])}
                                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
                                >
                                  <span>+ Add to Plan</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium italic">
                        {isPrereqSatisfied 
                          ? "✓ All prerequisites satisfied" 
                          : `⚠ Missing: ${missingPrereqs.join(', ')}`}
                      </span>
                      {!isPrereqSatisfied && (
                        <button
                          onClick={() => onRemediateAndRedirect(missingPrereqs)}
                          className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                        >
                          Add Missing to Plan
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => onSelectCapstone(cap.id)}
                      disabled={isSelected}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-sm cursor-default pointer-events-none'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isSelected ? 'Selected Capstone Choice ✓' : 'Select Choice'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* AI Codesigner Content */
        <Codesigner
          profile={profile}
          studyPlan={studyPlan}
          aiChatLogs={aiChatLogs}
          aiChatInput={aiChatInput}
          setAiChatInput={setAiChatInput}
          isAiReplying={isAiReplying}
          onSendAiChat={onSendAiChat}
        />
      )}

      {/* AI Capstone Co-Designer Studio Modal */}
      {isCoDesignerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-800 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <span>PockeTA AI Capstone Co-Designer Studio</span>
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Brainstorm and formulate custom thesis proposals with AI guidance.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCoDesignerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Select Research Focus */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Research Focus / Domain
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CO_DESIGN_DOMAINS.map((domain, dIdx) => (
                    <button
                      key={dIdx}
                      type="button"
                      onClick={() => setSelectedDomain(domain)}
                      disabled={selectedDomain === domain}
                      className={`p-3 rounded-xl border text-xs text-left font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        selectedDomain === domain
                          ? 'border-slate-900 bg-slate-900 text-white cursor-default pointer-events-none'
                          : 'border-slate-200 hover:border-indigo-200 text-slate-700 bg-slate-50/50'
                      }`}
                    >
                      <span>{domain}</span>
                      {selectedDomain === domain && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Technical Stack */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Select Preferred Technology Stack
                </label>
                <div className="flex flex-wrap gap-2">
                  {CO_DESIGN_STACKS.map((stack, sIdx) => {
                    const isSelected = selectedStack.includes(stack);
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedStack(prev => prev.filter(s => s !== stack));
                          } else {
                            setSelectedStack(prev => [...prev, stack]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        <span>{stack}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Thesis Topic or Innovation Keywords */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Thesis Concept / Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={customIdea}
                  onChange={(e) => setCustomIdea(e.target.value)}
                  placeholder="e.g. Real-time medical image segmentation co-pilot with privacy isolation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Generate Action Button */}
              <button
                type="button"
                onClick={handleGenerateCoDesign}
                disabled={isGenerating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>PockeTA AI is structuring capstone proposal & prerequisites...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Capstone Proposal with PockeTA AI</span>
                  </>
                )}
              </button>

              {/* Generated Proposal Result Card */}
              {generatedCapstone && (
                <div className="bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 border-2 border-indigo-500 rounded-2xl p-5 space-y-4 shadow-md animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                    <span className="text-[10px] font-mono font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                      ✨ AI-Generated Custom Capstone
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Capacity: {generatedCapstone.capacity}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                      {generatedCapstone.title}
                    </h4>
                    <p className="text-xs text-indigo-700 font-semibold">
                      {generatedCapstone.supervisor} • {generatedCapstone.department}
                    </p>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200/80 rounded-xl p-3">
                    {generatedCapstone.description}
                  </p>

                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Required Prerequisites Needed
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedCapstone.prerequisiteCourseCodes.map((code) => (
                        <span key={code} className="text-xs font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded">
                          {code} ({COURSE_NAME_MAP[code] || 'Prerequisite'})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>Key Deliverables:</span>
                    <span className="font-semibold text-slate-800">{generatedCapstone.deliverables}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCoDesignerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              >
                Close
              </button>
              {generatedCapstone && (
                <button
                  type="button"
                  onClick={handleSaveAndApplyCustomCapstone}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save & Add to My Selections</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

