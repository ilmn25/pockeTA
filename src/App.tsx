import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { JourneyDashboard } from './components/JourneyDashboard';
import { StudyPlanner } from './components/StudyPlanner';
import { WieCapstoneSelection } from './components/WieCapstoneSelection';
import { GoalEditorModal } from './components/GoalEditorModal';
import { StudentProfile, SemesterPlan, Suggestion, Course } from './types';
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_SEMESTER_PLANS,
  COURSE_CATALOG,
  MOCK_WIE_POSITIONS,
  MOCK_CAPSTONE_PROJECTS
} from './data/mockData';
import { Sparkles, CheckCircle2, Info } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('pocketa_profile_v3');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROFILE;
  });

  const [studyPlan, setStudyPlan] = useState<SemesterPlan[]>(() => {
    const saved = localStorage.getItem('pocketa_study_plan_v3');
    if (saved) {
      try {
        const parsed: SemesterPlan[] = JSON.parse(saved);
        // Verify all courses in parsed plan exist in current COURSE_CATALOG
        const catalogCodes = new Set(COURSE_CATALOG.map(c => c.code));
        const hasUnknownCourses = parsed.some(sem => 
          sem.courses.some(c => !catalogCodes.has(c.code))
        );
        if (!hasUnknownCourses) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing saved study plan", e);
      }
    }
    return INITIAL_SEMESTER_PLANS;
  });

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem('pocketa_profile_v3', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('pocketa_study_plan_v3', JSON.stringify(studyPlan));
  }, [studyPlan]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'study-plan' | 'wie-capstone'>('dashboard');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedWieId, setSelectedWieId] = useState<string | null>('wie_01');
  const [selectedCapstoneId, setSelectedCapstoneId] = useState<string | null>('cap_01');
  const [highlightCourseCode, setHighlightCourseCode] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Proactive suggestions list
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: 'sug_01',
      type: 'add',
      title: 'Add COMP4423: Computer Vision',
      reason: 'Enhances specialization in visual recognition and intelligent software systems.',
      suggestedCourse: COURSE_CATALOG.find(c => c.code === 'COMP4423'),
      targetSemesterId: 'y4t2'
    },
    {
      id: 'sug_02',
      type: 'add',
      title: 'Add COMP4432: Machine Learning',
      reason: 'Essential elective for predictive modeling and smart algorithms.',
      suggestedCourse: COURSE_CATALOG.find(c => c.code === 'COMP4432'),
      targetSemesterId: 'y4t2'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle Goal Update
  const handleSaveGoals = (newGoals: string, selectedTags: string[]) => {
    setProfile(prev => ({
      ...prev,
      careerGoals: newGoals,
      keySkillsInterest: selectedTags
    }));
    showToast('Aspirations updated! Course descriptions & AI advice re-personalized.');
  };

  // Apply Proactive Suggestion to Study Plan
  const handleApplySuggestion = (sug: Suggestion) => {
    if (!sug.suggestedCourse || !sug.targetSemesterId) {
      showToast('Suggestion applied to your planning notes.');
      setSuggestions(prev => prev.filter(s => s.id !== sug.id));
      return;
    }

    const courseToAdd = sug.suggestedCourse;
    const targetSemId = sug.targetSemesterId;

    setStudyPlan(prevPlan =>
      prevPlan.map(sem => {
        if (sem.id === targetSemId) {
          const exists = sem.courses.some(c => c.code === courseToAdd.code);
          if (!exists) {
            return { ...sem, courses: [...sem.courses, courseToAdd] };
          }
        }
        return sem;
      })
    );

    setSuggestions(prev => prev.filter(s => s.id !== sug.id));
    setHighlightCourseCode(courseToAdd.code);
    showToast(`Added ${courseToAdd.code} (${courseToAdd.title}) to study plan!`);
  };

  // Remediation Redirection Flow from WIE/Capstone
  const handleRemediateAndRedirect = (missingCourseCodes: string[]) => {
    if (missingCourseCodes.length === 0) {
      setActiveTab('study-plan');
      return;
    }

    // Automatically add missing courses to Year 3 Term 1 if not already in plan
    setStudyPlan(prevPlan => {
      let updated = [...prevPlan];
      missingCourseCodes.forEach(code => {
        const courseObj = COURSE_CATALOG.find(c => c.code === code);
        if (courseObj) {
          // Check if code is anywhere in plan
          const alreadyPlanned = updated.some(sem => sem.courses.some(c => c.code === code));
          if (!alreadyPlanned) {
            // Insert into y3t1
            updated = updated.map(sem => {
              if (sem.id === 'y3t1') {
                return { ...sem, courses: [...sem.courses, courseObj] };
              }
              return sem;
            });
          }
        }
      });
      return updated;
    });

    setHighlightCourseCode(missingCourseCodes[0]);
    setActiveTab('study-plan');
    showToast(`Redirected to Study Planner. Staged missing course(s) ${missingCourseCodes.join(', ')} into Year 3 Term 1!`);
  };

  const handleNavigateTab = (tab: 'dashboard' | 'study-plan' | 'wie-capstone', extra?: any) => {
    setActiveTab(tab);
    if (extra?.highlightCourse) {
      setHighlightCourseCode(extra.highlightCourse);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 bg-indigo-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-indigo-500 animate-slide-in">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <JourneyDashboard
            profile={profile}
            studyPlan={studyPlan}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'study-plan' && (
          <StudyPlanner
            profile={profile}
            studyPlan={studyPlan}
            setStudyPlan={setStudyPlan}
            catalog={COURSE_CATALOG}
            suggestions={suggestions}
            onApplySuggestion={handleApplySuggestion}
            highlightCourseCode={highlightCourseCode}
          />
        )}

        {activeTab === 'wie-capstone' && (
          <WieCapstoneSelection
            profile={profile}
            studyPlan={studyPlan}
            wiePositions={MOCK_WIE_POSITIONS}
            capstoneProjects={MOCK_CAPSTONE_PROJECTS}
            selectedWieId={selectedWieId}
            selectedCapstoneId={selectedCapstoneId}
            onSelectWie={(id) => {
              setSelectedWieId(id);
              showToast('Updated primary WIE selection!');
            }}
            onSelectCapstone={(id) => {
              setSelectedCapstoneId(id);
              showToast('Updated primary Capstone selection!');
            }}
            onRemediateAndRedirect={handleRemediateAndRedirect}
          />
        )}
      </main>

      {/* Career Aspirations Goal Modal */}
      <GoalEditorModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        profile={profile}
        onSaveGoals={handleSaveGoals}
      />
    </div>
  );
}
