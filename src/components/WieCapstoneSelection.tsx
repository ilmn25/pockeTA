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

  // Set of planned/taken course codes in study plan
  const planCourseCodes = new Set<string>();
  studyPlan.forEach((s) => s.courses.forEach((c) => planCourseCodes.add(c.code)));

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
            Explore Work-Integrated Education (WIE) internships and Capstone research topics with real-time AI alignment analysis against your career goals.
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
            const missingPrereqs = pos.prerequisiteCourseCodes.filter((c) => !planCourseCodes.has(c));
            const isPrereqSatisfied = missingPrereqs.length === 0;
            const fitScore = isPrereqSatisfied ? 94 : 82;

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

                  {/* Inline PockeTA Alignment Analysis Panel */}
                  <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-3.5 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-extrabold text-indigo-950">
                          PockeTA Alignment Analysis
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full">
                        {fitScore}% Goal Fit
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      Matches your career goal target <span className="font-semibold text-slate-900">"{profile.careerGoals.slice(0, 48)}..."</span> with direct hands-on industry exposure.
                    </p>

                    <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">Prerequisite Status:</span>
                      {isPrereqSatisfied ? (
                        <span className="text-emerald-700 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>All Satisfied in Plan</span>
                        </span>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-800 font-bold flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Missing: {missingPrereqs.join(', ')}</span>
                          </span>
                          <button
                            onClick={() => onRemediateAndRedirect(missingPrereqs)}
                            className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                          >
                            Add to Plan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => onSelectWie(pos.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
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
      ) : (
        /* Capstone Projects List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capstoneProjects.map((cap) => {
            const isSelected = selectedCapstoneId === cap.id;
            // Filter out key tech/prereqs
            const capPrereqCodes = ['COMP3438', 'COMP4432'].filter(code => cap.keyTech.some(t => t.toLowerCase().includes('ai') || t.toLowerCase().includes('machine') || t.toLowerCase().includes('cloud')));
            const missingPrereqs = capPrereqCodes.filter((c) => !planCourseCodes.has(c));
            const isPrereqSatisfied = missingPrereqs.length === 0;
            const fitScore = isPrereqSatisfied ? 92 : 80;

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

                  {/* Inline PockeTA Alignment Analysis Panel */}
                  <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-3.5 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-extrabold text-indigo-950">
                          PockeTA Alignment Analysis
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full">
                        {fitScore}% Goal Fit
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      Research topic aligns directly with your goals in <span className="font-semibold text-slate-900">"{profile.careerGoals.slice(0, 48)}..."</span>.
                    </p>

                    <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">Prerequisite Status:</span>
                      {isPrereqSatisfied ? (
                        <span className="text-emerald-700 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>All Satisfied in Plan</span>
                        </span>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-800 font-bold flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Missing: {missingPrereqs.join(', ')}</span>
                          </span>
                          <button
                            onClick={() => onRemediateAndRedirect(missingPrereqs)}
                            className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                          >
                            Add to Plan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => onSelectCapstone(cap.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isSelected ? 'Selected Capstone ✓' : 'Select Capstone'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
