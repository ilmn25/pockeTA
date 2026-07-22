import React from 'react';
import { Compass, Calendar, Award, Sparkles, User, Target, CheckCircle2 } from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'study-plan' | 'wie-capstone';
  setActiveTab: (tab: 'dashboard' | 'study-plan' | 'wie-capstone') => void;
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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                PockeTA
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 hidden sm:inline-block">
                Academic Advisor
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-study-plan"
              onClick={() => setActiveTab('study-plan')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'study-plan'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Study Planner</span>
            </button>

            <button
              id="nav-tab-wie-capstone"
              onClick={() => setActiveTab('wie-capstone')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'wie-capstone'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>WIE & Capstone</span>
            </button>
          </nav>

          {/* Student Profile & Goals */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              id="header-goal-button"
              onClick={onOpenGoalModal}
              className="hidden md:flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors group max-w-[180px]"
              title="Click to update career goals"
            >
              <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate text-xs text-slate-700 font-medium">
                {profile.careerGoals}
              </span>
            </button>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left text-xs hidden sm:block">
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
