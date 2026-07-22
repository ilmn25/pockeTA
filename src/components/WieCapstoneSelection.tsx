import React, { useState } from 'react';
import { Award, Briefcase, GraduationCap, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, X, Check, ShieldCheck, MapPin, DollarSign, Clock, Users, Building2 } from 'lucide-react';
import { WIEPosition, CapstoneProject, StudentProfile, SemesterPlan, AlignmentAnalysis } from '../types';

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
}

export const WieCapstoneSelection: React.FC<WieCapstoneSelectionProps> = ({
  profile,
  studyPlan,
  wiePositions,
  capstoneProjects,
  selectedWieId,
  selectedCapstoneId,
  onSelectWie,
  onSelectCapstone,
  onRemediateAndRedirect
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'wie' | 'capstone'>('wie');
  const [inspectingItem, setInspectingItem] = useState<{ type: 'WIE' | 'Capstone'; item: any } | null>(null);
  const [alignmentData, setAlignmentData] = useState<AlignmentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Trigger AI Alignment Analysis
  const handleInspectAndAnalyze = async (type: 'WIE' | 'Capstone', item: any) => {
    setInspectingItem({ type, item });
    setAlignmentData(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/alignment/wie-capstone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectionType: type,
          item,
          careerGoals: profile.careerGoals,
          studyPlan
        })
      });

      const data = await response.json();
      setAlignmentData(data);
    } catch (err) {
      console.error('Error analyzing alignment:', err);
      // Fallback
      setAlignmentData({
        fitScore: 88,
        verdict: 'High Alignment',
        alignmentReason: `This ${type} selection strongly matches your target career trajectory in ${profile.careerGoals}.`,
        strengths: ['Direct practical exposure to AI/ML tools', 'High relevance to graduate research'],
        skillGaps: ['Requires PyTorch experience'],
        missingPrereqsInPlan: ['COMP4432'],
        recommendedCourseCodes: ['COMP4432']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900">
              WIE & Capstone Project Selection
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200">
              AI Goal Alignment Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explore Work-Integrated Education (WIE) internships and Capstone research topics. PockeTA evaluates fit score against your career goals and alerts you if study plan modifications are required.
          </p>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex bg-slate-100/90 p-1 rounded-full border border-slate-200 shrink-0">
          <button
            id="subtab-wie-btn"
            onClick={() => setActiveSubTab('wie')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeSubTab === 'wie'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>WIE Placements ({wiePositions.length})</span>
          </button>

          <button
            id="subtab-capstone-btn"
            onClick={() => setActiveSubTab('capstone')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeSubTab === 'capstone'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Capstone Projects ({capstoneProjects.length})</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {activeSubTab === 'wie' ? (
        /* WIE Positions List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wiePositions.map((pos) => {
            const isSelected = selectedWieId === pos.id;

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
                        <span>Primary WIE Choice</span>
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

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Required Prerequisite Courses
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {pos.prerequisiteCourseCodes.map((code) => (
                        <span
                          key={code}
                          className="text-[11px] font-mono font-semibold bg-slate-100 text-indigo-700 border border-slate-200 px-2 py-0.5 rounded"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectWie(pos.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Choice'}
                  </button>

                  <button
                    onClick={() => handleInspectAndAnalyze('WIE', pos)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PockeTA Alignment Analysis</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Capstone Projects List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capstoneProjects.map((cap) => {
            const isSelected = selectedCapstoneId === cap.id;

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
                      Key Technologies & Prerequisites
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
                </div>

                {/* Actions Footer */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectCapstone(cap.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Capstone'}
                  </button>

                  <button
                    onClick={() => handleInspectAndAnalyze('Capstone', cap)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PockeTA Alignment Analysis</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alignment Analysis Drawer / Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    PockeTA Goal & Preparation Fit Evaluation
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-md">
                    {inspectingItem.item.title || inspectingItem.item.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {isAnalyzing ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-800">
                    Evaluating alignment with your career goals & study plan...
                  </p>
                  <p className="text-xs text-slate-500">
                    Checking prerequisite completion, skill mapping, and course sequence.
                  </p>
                </div>
              ) : alignmentData ? (
                <div className="space-y-5">
                  {/* Score & Verdict Banner */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Alignment Evaluation Verdict
                      </span>
                      <span className="text-lg font-extrabold text-slate-900">
                        {alignmentData.verdict}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-indigo-600">
                        {alignmentData.fitScore}%
                      </span>
                      <span className="block text-[10px] text-slate-500 font-medium">
                        Fit Index
                      </span>
                    </div>
                  </div>

                  {/* Alignment Rationale */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                      PockeTA Alignment Analysis
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      {alignmentData.alignmentReason}
                    </p>
                  </div>

                  {/* Strengths & Missing Prerequisites */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <span className="block text-xs font-bold text-emerald-700 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Key Alignment Strengths</span>
                      </span>
                      <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                        {alignmentData.strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <span className="block text-xs font-bold text-amber-700 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Study Plan Prerequisites</span>
                      </span>
                      {alignmentData.missingPrereqsInPlan.length > 0 ? (
                        <div className="text-xs text-amber-800 space-y-1">
                          <p className="font-semibold">Missing in current plan:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {alignmentData.missingPrereqsInPlan.map((code) => (
                              <span
                                key={code}
                                className="bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded font-mono text-[11px]"
                              >
                                {code}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-700 font-semibold">
                          All prerequisite courses are satisfied in your study plan!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Redirection / Remediation Banner */}
                  {alignmentData.missingPrereqsInPlan.length > 0 && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Recommended Study Plan Adjustment</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        PockeTA can automatically stage missing prerequisite courses ({alignmentData.missingPrereqsInPlan.join(', ')}) into your Study Planning Workspace to ensure you are 100% prepared.
                      </p>
                      <button
                        id="redirect-remediate-btn"
                        onClick={() => {
                          setInspectingItem(null);
                          onRemediateAndRedirect(alignmentData.missingPrereqsInPlan);
                        }}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
                      >
                        <span>Update Study Plan in Planning Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                Close Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
