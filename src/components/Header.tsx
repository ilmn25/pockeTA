import React from 'react';
import { Compass, Calendar, Award, Sparkles, User, Target, CheckCircle2, Briefcase, GraduationCap } from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'study-plan' | 'wie' | 'capstone';
  setActiveTab: (tab: 'dashboard' | 'study-plan' | 'wie' | 'capstone') => void;
  profile: StudentProfile;
  onOpenGoalModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenGoalModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto shrink-0">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  PockeTA
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 hidden md:inline-block">
                  Academic Advisor
                </span>
              </div>
            </div>

            {/* Student Profile Quick View on Mobile */}
            <div className="flex items-center space-x-2 sm:hidden">
              <button
                id="header-goal-button-mobile"
                onClick={onOpenGoalModal}
                className="p-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1"
                title="Update Aspirations"
              >
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] max-w-[90px] truncate">{profile.keySkillsInterest[0] || 'Goals'}</span>
              </button>

              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Scrollable on small mobile) */}
          <nav className="flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar w-full sm:w-auto shrink-0">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              disabled={activeTab === 'dashboard'}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] flex-1 sm:flex-initial justify-center ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm font-bold cursor-default pointer-events-none'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-study-plan"
              onClick={() => setActiveTab('study-plan')}
              disabled={activeTab === 'study-plan'}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] flex-1 sm:flex-initial justify-center ${
                activeTab === 'study-plan'
                  ? 'bg-slate-900 text-white shadow-sm font-bold cursor-default pointer-events-none'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Study Planner</span>
            </button>

            <button
              id="nav-tab-wie"
              onClick={() => setActiveTab('wie')}
              disabled={activeTab === 'wie'}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] flex-1 sm:flex-initial justify-center ${
                activeTab === 'wie'
                  ? 'bg-slate-900 text-white shadow-sm font-bold cursor-default pointer-events-none'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>WIE</span>
            </button>

            <button
              id="nav-tab-capstone"
              onClick={() => setActiveTab('capstone')}
              disabled={activeTab === 'capstone'}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] flex-1 sm:flex-initial justify-center ${
                activeTab === 'capstone'
                  ? 'bg-slate-900 text-white shadow-sm font-bold cursor-default pointer-events-none'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span>Capstone</span>
            </button>
          </nav>

          {/* Desktop Student Profile & Goals */}
          <div className="hidden sm:flex items-center space-x-3 shrink-0">
            <button
              id="header-goal-button"
              onClick={onOpenGoalModal}
              className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors group max-w-[180px]"
              title="Click to update career goals"
            >
              <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate text-xs text-slate-700 font-medium">
                {profile.careerGoals}
              </span>
            </button>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left text-xs">
                <span className="font-semibold text-slate-800 block leading-tight">
                  {profile.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  GPA {profile.gpa.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
