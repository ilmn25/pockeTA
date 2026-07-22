import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Plus, Trash2, AlertTriangle, CheckCircle2, ChevronRight, Info, Search, MoveRight, ArrowRight, MessageSquare, Lightbulb, RefreshCw, X, Layers, GripVertical, Move } from 'lucide-react';
import { Course, SemesterPlan, StudentProfile, Suggestion, CourseCategory } from '../types';
import { INITIAL_SEMESTER_PLANS } from '../data/mockData';

interface StudyPlannerProps {
  profile: StudentProfile;
  studyPlan: SemesterPlan[];
  setStudyPlan: React.Dispatch<React.SetStateAction<SemesterPlan[]>>;
  catalog: Course[];
  suggestions: Suggestion[];
  onApplySuggestion: (sug: Suggestion) => void;
  highlightCourseCode?: string;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  profile,
  studyPlan,
  setStudyPlan,
  catalog,
  suggestions,
  onApplySuggestion,
  highlightCourseCode
}) => {
  const [usePersonalized, setUsePersonalized] = useState(true);
  const [personalizedMap, setPersonalizedMap] = useState<Record<string, { desc: string; score: number }>>({});
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [draggedCourse, setDraggedCourse] = useState<{ course: Course; sourceSemesterId: string | 'catalog' } | null>(null);
  const [dragOverSemesterId, setDragOverSemesterId] = useState<string | null>(null);
  const [activeCourseModal, setActiveCourseModal] = useState<Course | null>(null);
  
  // Collaborative AI Assistant Chat state
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLogs, setAiChatLogs] = useState<{ sender: 'user' | 'pocketa'; text: string }[]>([
    {
      sender: 'pocketa',
      text: `Hello! I am PockeTA, your study planning co-pilot. I am reviewing your 4-year study plan. Ask me to help sequence prerequisites, adjust credit loads, or recommend electives for ${profile.careerGoals.slice(0, 40)}...`
    }
  ]);
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Fetch / Refresh Personalized Course Descriptions when goals or view mode changes
  useEffect(() => {
    let isMounted = true;
    const fetchPersonalized = async () => {
      if (!usePersonalized || Object.keys(personalizedMap).length > 0) return;
      setIsPersonalizing(true);
      try {
        const response = await fetch('/api/courses/personalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            careerGoals: profile.careerGoals,
            courses: catalog
          })
        });
        const data = await response.json();
        if (isMounted && data.personalizedCourses) {
          const map: Record<string, { desc: string; score: number }> = {};
          data.personalizedCourses.forEach((item: any) => {
            map[item.code] = {
              desc: item.personalizedDescription,
              score: item.alignmentScore || 90
            };
          });
          setPersonalizedMap(map);
        }
      } catch (err) {
        console.error('Failed to personalize courses:', err);
      } finally {
        if (isMounted) setIsPersonalizing(false);
      }
    };

    fetchPersonalized();
    return () => { isMounted = false; };
  }, [profile.careerGoals, usePersonalized]);

  // Handle Drag and Drop
  const handleDragStart = (e: React.DragEvent, course: Course, sourceSemesterId: string | 'catalog') => {
    e.dataTransfer.setData('text/plain', course.code);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCourse({ course, sourceSemesterId });
  };

  const handleDragOver = (e: React.DragEvent, semesterId: string) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    setDragOverSemesterId(semesterId);
  };

  const handleDragLeave = () => {
    setDragOverSemesterId(null);
  };

  const handleDrop = (e: React.DragEvent, targetSemesterId: string) => {
    e.preventDefault();
    setDragOverSemesterId(null);

    let courseToMove = draggedCourse?.course;
    let sourceSemId = draggedCourse?.sourceSemesterId;

    if (!courseToMove) {
      const code = e.dataTransfer.getData('text/plain');
      if (code) {
        courseToMove = catalog.find(c => c.code === code);
        sourceSemId = 'catalog';
      }
    }

    if (!courseToMove) return;

    const course = courseToMove;

    // Do not allow dropping onto completed semesters
    const targetSem = studyPlan.find(s => s.id === targetSemesterId);
    if (!targetSem || targetSem.isCompleted) {
      setDraggedCourse(null);
      return;
    }

    // Check if target semester already contains this course
    if (targetSem.courses.some(c => c.code === course.code)) {
      setDraggedCourse(null);
      return;
    }

    setStudyPlan(prevPlan => {
      return prevPlan.map(sem => {
        // Remove from source if moving between uncompleted semesters
        if (sourceSemId !== 'catalog' && sem.id === sourceSemId && !sem.isCompleted) {
          return { ...sem, courses: sem.courses.filter(c => c.code !== course.code) };
        }
        // If added from catalog, remove from any other uncompleted semester if it was previously placed
        if (sourceSemId === 'catalog' && !sem.isCompleted && sem.id !== targetSemesterId) {
          if (sem.courses.some(c => c.code === course.code)) {
            return { ...sem, courses: sem.courses.filter(c => c.code !== course.code) };
          }
        }
        // Add to target semester
        if (sem.id === targetSemesterId) {
          return { ...sem, courses: [...sem.courses, course] };
        }
        return sem;
      });
    });

    setDraggedCourse(null);
  };

  // Add Course directly to a specific uncompleted semester
  const handleAddCourseToSemester = (course: Course, semesterId: string) => {
    setStudyPlan(prevPlan => {
      const targetSem = prevPlan.find(s => s.id === semesterId);
      if (!targetSem || targetSem.isCompleted) return prevPlan;
      if (targetSem.courses.some(c => c.code === course.code)) return prevPlan;

      return prevPlan.map(sem => {
        // Remove from any other uncompleted semester first if already present
        if (!sem.isCompleted && sem.id !== semesterId) {
          if (sem.courses.some(c => c.code === course.code)) {
            return { ...sem, courses: sem.courses.filter(c => c.code !== course.code) };
          }
        }
        if (sem.id === semesterId) {
          return { ...sem, courses: [...sem.courses, course] };
        }
        return sem;
      });
    });
  };

  // Helper to check if a course is currently placed in the study plan
  const getPlannedSemester = (courseCode: string) => {
    return studyPlan.find(sem => sem.courses.some(c => c.code === courseCode));
  };

  // Remove Course from Semester
  const handleRemoveCourse = (semesterId: string, courseCode: string) => {
    setStudyPlan(prev =>
      prev.map(sem => {
        if (sem.id === semesterId) {
          return { ...sem, courses: sem.courses.filter(c => c.code !== courseCode) };
        }
        return sem;
      })
    );
  };

  // Check Prerequisite Conflicts
  const getPrerequisiteWarnings = (course: Course, currentSemesterId: string) => {
    if (!course.prerequisites || course.prerequisites.length === 0) return [];

    const semesterIndex = studyPlan.findIndex(s => s.id === currentSemesterId);
    if (semesterIndex === -1) return [];

    // Collect all taken/planned courses in strictly EARLIER semesters
    const earlierCourses = new Set(
      studyPlan
        .slice(0, semesterIndex)
        .flatMap(s => s.courses.map(c => c.code))
    );

    const missingPrereqs = course.prerequisites.filter(req => !earlierCourses.has(req));
    return missingPrereqs;
  };

  // Collaborative Chat
  const handleSendAiChat = async () => {
    if (!aiChatInput.trim()) return;
    const userText = aiChatInput;
    setAiChatLogs(prev => [...prev, { sender: 'user', text: userText }]);
    setAiChatInput('');
    setIsAiReplying(true);

    try {
      const response = await fetch('/api/advising/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Study Plan Collaborative Optimization Request: "${userText}"`,
          studentProfile: profile,
          studyPlan
        })
      });
      const data = await response.json();
      setAiChatLogs(prev => [...prev, { sender: 'pocketa', text: data.answer || 'I have reviewed your study plan options.' }]);
    } catch {
      setAiChatLogs(prev => [...prev, { sender: 'pocketa', text: 'I recommend balancing your Year 4 Term 2 electives for optimal prerequisite sequencing.' }]);
    } finally {
      setIsAiReplying(false);
    }
  };

  // Filter Catalog Courses
  const filteredCatalog = catalog.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'ALL' ? true :
      selectedCategory === 'Not Taken' ? (c.grade === 'Not Taken' || !getPlannedSemester(c.code)) :
      c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Study Planning Workspace</h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200">
              Interactive Planner
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Drag and drop courses between semesters. PockeTA personalizes course descriptions based on your career goals and alerts you of prerequisite dependencies.
          </p>
        </div>

        {/* Controls: Personalized Toggle & Collaborative AI Assistant Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Personalized Toggle Button */}
          <button
            id="toggle-personalized-desc-btn"
            onClick={() => setUsePersonalized(!usePersonalized)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              usePersonalized
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${usePersonalized ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
            <span>
              {usePersonalized ? 'PockeTA Personalized Descriptions ON' : 'Standard Catalog Descriptions'}
            </span>
          </button>

          {/* AI Collaborative Assistant Button */}
          <button
            id="open-collaborative-ai-btn"
            onClick={() => setIsAiChatOpen(!isAiChatOpen)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>PockeTA Co-Pilot</span>
          </button>

          {/* Reset Plan Button */}
          <button
            id="reset-official-plan-btn"
            onClick={() => {
              setStudyPlan(INITIAL_SEMESTER_PLANS);
              localStorage.setItem('pocketa_study_plan_v3', JSON.stringify(INITIAL_SEMESTER_PLANS));
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
            title="Reset study plan to official curriculum"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
            <span>Reset Official Plan</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Study Plan Semesters + Proactive Suggestions & Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left 3 Cols: 8-Semester Interactive Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyPlan.map((sem) => {
              const termCredits = sem.courses.reduce((sum, c) => sum + c.credits, 0);
              const isOverloaded = termCredits > 18;
              const isUnderloaded = termCredits < 12 && !sem.isCompleted;
              const isDropTarget = dragOverSemesterId === sem.id;

              return (
                <div
                  key={sem.id}
                  onDragOver={(e) => handleDragOver(e, sem.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, sem.id)}
                  className={`bg-white border rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between ${
                    isDropTarget
                      ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/30 scale-[1.01]'
                      : sem.isCurrent
                      ? 'border-indigo-300 bg-indigo-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Semester Header */}
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{sem.label}</span>
                        {sem.isCompleted && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                            Completed
                          </span>
                        )}
                        {sem.isCurrent && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold">
                            Current Term
                          </span>
                        )}
                      </div>

                      {/* Term Credit Meter */}
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-xs font-bold ${
                            isOverloaded
                              ? 'text-rose-600'
                              : isUnderloaded
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {termCredits} Credits
                        </span>
                      </div>
                    </div>

                    {/* Workload Warning Notice */}
                    {isOverloaded && (
                      <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 font-medium">
                        <AlertTriangle className="w-3 h-3 shrink-0 text-rose-600" />
                        <span>{'Credit overload (>18). Consider shifting 1 course.'}</span>
                      </div>
                    )}

                    {/* Course Cards Container */}
                    <div className="mt-4 space-y-3 min-h-[140px]">
                      {sem.courses.length === 0 ? (
                        <div className="h-full min-h-[120px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs">
                          <Plus className="w-5 h-5 mb-1 text-slate-400" />
                          <span>Drag & drop courses here</span>
                        </div>
                      ) : (
                        sem.courses.map((course) => {
                          const prereqWarnings = getPrerequisiteWarnings(course, sem.id);
                          const isHighlighted = highlightCourseCode === course.code;
                          const personalizedInfo = personalizedMap[course.code];

                          return (
                            <div
                              key={course.code}
                              draggable={!sem.isCompleted}
                              onDragStart={(e) => handleDragStart(e, course, sem.id)}
                              className={`group relative bg-slate-50 border rounded-xl p-3.5 transition-all ${
                                sem.isCompleted
                                  ? 'border-slate-200 opacity-80 cursor-default'
                                  : 'border-slate-200 hover:border-indigo-300 hover:bg-white cursor-grab active:cursor-grabbing shadow-sm'
                              } ${isHighlighted ? 'ring-2 ring-amber-400 border-amber-300 bg-amber-50/50' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                    <span className="font-bold text-xs text-indigo-600 font-mono">
                                      {course.code}
                                    </span>
                                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                      {course.credits} Credits
                                    </span>
                                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                      {course.category}
                                    </span>
                                    {course.grade && (
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                        course.grade === 'A' || course.grade === 'A-'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : course.grade.startsWith('B')
                                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                          : course.grade.startsWith('C')
                                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                          : course.grade === 'R'
                                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        Grade: {course.grade}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                                    {course.title}
                                  </h4>
                                </div>

                                {!sem.isCompleted && (
                                  <button
                                    onClick={() => handleRemoveCourse(sem.id, course.code)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove from term"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Description: Personalized vs Standard */}
                              <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                                {usePersonalized && personalizedInfo?.desc
                                  ? personalizedInfo.desc
                                  : course.standardDescription}
                              </p>

                              {/* Goal Match Badge if Personalized */}
                              {usePersonalized && personalizedInfo?.score && (
                                <div className="mt-2.5 flex items-center justify-between text-[10px]">
                                  <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                    <span>{personalizedInfo.score}% Goal Alignment</span>
                                  </span>
                                  <button
                                    onClick={() => setActiveCourseModal(course)}
                                    className="text-indigo-600 hover:underline font-semibold"
                                  >
                                    Details
                                  </button>
                                </div>
                              )}

                              {/* Prerequisite Warnings */}
                              {prereqWarnings.length > 0 && (
                                <div className="mt-2 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg space-y-0.5">
                                  <div className="flex items-center space-x-1 font-bold">
                                    <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
                                    <span>Prerequisite Warning</span>
                                  </div>
                                  <p>
                                    Missing prior completion of: {prereqWarnings.join(', ')}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Proactive Suggestions + Course Repository */}
        <div className="space-y-6">
          
          {/* Proactive PockeTA Suggestions Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Proactive Suggestions</h3>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold border border-indigo-200">
                PockeTA AI
              </span>
            </div>

            <p className="text-xs text-slate-500">
              PockeTA analyzes your study plan against your goal: <i>"{profile.careerGoals.slice(0, 50)}..."</i>
            </p>

            <div className="space-y-3">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-bold text-indigo-700 leading-snug">
                      {sug.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {sug.reason}
                  </p>
                  <button
                    onClick={() => onApplySuggestion(sug)}
                    className="w-full mt-2 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Apply Modification to Plan</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Course Repository Search & Drag Palette */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Course Repository</h3>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-1">
              {['ALL', 'Not Taken', 'Core', 'Elective', 'General Education', 'Capstone', 'WIE'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search catalog by code or title..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Course List Items */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredCatalog.map((course) => {
                const plannedSem = getPlannedSemester(course.code);

                return (
                  <div
                    key={course.code}
                    draggable
                    onDragStart={(e) => handleDragStart(e, course, 'catalog')}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:bg-white hover:shadow-md transition-all group relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {course.code}
                        </span>
                        {course.grade && course.grade !== 'Not Taken' ? (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            course.grade === 'A' || course.grade === 'A-'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : course.grade.startsWith('B')
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : course.grade.startsWith('C')
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}>
                            {course.grade}
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Not Taken
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-medium">
                        {course.credits} Cr
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      {course.title}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        Prereqs: {course.prerequisites.join(', ') || 'None'}
                      </div>

                      {plannedSem ? (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-medium">
                          In {plannedSem.term}
                        </span>
                      ) : (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddCourseToSemester(course, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                          className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                        >
                          <option value="" disabled>+ Add to...</option>
                          {studyPlan.filter(s => !s.isCompleted).map(s => (
                            <option key={s.id} value={s.id}>{s.label.split(' ')[0]}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Collaborative AI Co-Pilot Drawer */}
      {isAiChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
          <div className="bg-indigo-600 p-3.5 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span className="font-bold text-xs">PockeTA Collaborative Co-Pilot</span>
            </div>
            <button
              onClick={() => setIsAiChatOpen(false)}
              className="p-1 rounded text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-3 overflow-y-auto flex-1 text-xs">
            {aiChatLogs.map((log, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl ${
                  log.sender === 'user'
                    ? 'bg-indigo-600 text-white ml-6 text-right'
                    : 'bg-slate-100 text-slate-800 mr-6 border border-slate-200'
                }`}
              >
                {log.text}
              </div>
            ))}
            {isAiReplying && (
              <div className="text-[11px] text-indigo-600 animate-pulse font-medium">
                PockeTA is reflecting on your plan...
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center space-x-2">
            <input
              type="text"
              value={aiChatInput}
              onChange={(e) => setAiChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAiChat()}
              placeholder="e.g. Move AI4001 to Year 3 Term 1..."
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSendAiChat}
              disabled={isAiReplying || !aiChatInput.trim()}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {activeCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">
                  {activeCourseModal.code}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">{activeCourseModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveCourseModal(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="block font-bold uppercase text-slate-400 text-[10px] tracking-wider mb-1">
                  PockeTA Personalized Career Match
                </span>
                <p className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-indigo-900 leading-relaxed font-medium">
                  {personalizedMap[activeCourseModal.code]?.desc || activeCourseModal.standardDescription}
                </p>
              </div>

              <div>
                <span className="block font-bold uppercase text-slate-400 text-[10px] tracking-wider mb-1">
                  Standard University Catalog Description
                </span>
                <p className="bg-slate-50 p-3 rounded-xl text-slate-700 leading-relaxed border border-slate-200">
                  {activeCourseModal.standardDescription}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-[11px]">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Grade / Status:</span>
                  <span className="font-bold text-slate-800">
                    {activeCourseModal.grade || 'Not Taken'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Prerequisites:</span>
                  <span className="font-bold text-slate-800">
                    {activeCourseModal.prerequisites.join(', ') || 'None'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Offered Semesters:</span>
                  <span className="font-bold text-slate-800">
                    {activeCourseModal.semesterOffered.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveCourseModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
