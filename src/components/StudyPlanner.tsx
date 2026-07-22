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
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
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
    e.dataTransfer.setData('application/json', JSON.stringify({ code: course.code, sourceSemesterId }));
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

    let courseCode = e.dataTransfer.getData('text/plain');
    let sourceSemId = draggedCourse?.sourceSemesterId;

    if (!courseCode && draggedCourse) {
      courseCode = draggedCourse.course.code;
    }

    try {
      const jsonData = e.dataTransfer.getData('application/json');
      if (jsonData) {
        const parsed = JSON.parse(jsonData);
        if (parsed.code) courseCode = parsed.code;
        if (parsed.sourceSemesterId) sourceSemId = parsed.sourceSemesterId;
      }
    } catch (err) {
      // Ignore JSON parse error
    }

    if (!courseCode) return;

    const course = catalog.find(c => c.code === courseCode) || draggedCourse?.course;
    if (!course) return;

    // Do not allow dropping onto completed semesters
    const targetSem = studyPlan.find(s => s.id === targetSemesterId);
    if (!targetSem || targetSem.isCompleted) {
      setDraggedCourse(null);
      return;
    }

    // Do nothing if dropped onto the same semester
    if (sourceSemId === targetSemesterId) {
      setDraggedCourse(null);
      return;
    }

    setStudyPlan(prevPlan => {
      // First remove the course from any uncompleted semesters
      const cleanedPlan = prevPlan.map(sem => {
        if (!sem.isCompleted && sem.courses.some(c => c.code === course.code)) {
          return {
            ...sem,
            courses: sem.courses.filter(c => c.code !== course.code)
          };
        }
        return sem;
      });

      // Add to the target semester
      return cleanedPlan.map(sem => {
        if (sem.id === targetSemesterId) {
          return {
            ...sem,
            courses: [...sem.courses, course]
          };
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

      // Remove course from any existing uncompleted semester
      const cleanedPlan = prevPlan.map(sem => {
        if (!sem.isCompleted && sem.courses.some(c => c.code === course.code)) {
          return { ...sem, courses: sem.courses.filter(c => c.code !== course.code) };
        }
        return sem;
      });

      // Add to target semester if not already present
      return cleanedPlan.map(sem => {
        if (sem.id === semesterId) {
          if (sem.courses.some(c => c.code === course.code)) return sem;
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

  // Check if a course is taken
  const isCourseTaken = (c: Course) => {
    if (c.grade && c.grade !== 'Not Taken') return true;
    return studyPlan.some(sem => sem.isCompleted && sem.courses.some(sc => sc.code === c.code));
  };

  // Check if a course is Capstone
  const isCapstoneCourse = (c: Course) => {
    if (c.category === 'Capstone') return true;
    if (c.code === 'COMP4913') return true;
    if (c.title.toLowerCase().includes('capstone')) return true;
    return false;
  };

  // Filter Catalog Courses (excludes capstone, includes selected & taken courses at the bottom)
  const filteredCatalog = catalog
    .filter(c => {
      if (isCapstoneCourse(c)) return false;

      const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' ? true : c.category === selectedCategory;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      const aSelected = isCourseTaken(a) || !!getPlannedSemester(a.code);
      const bSelected = isCourseTaken(b) || !!getPlannedSemester(b.code);
      if (!aSelected && bSelected) return -1;
      if (aSelected && !bSelected) return 1;
      return 0;
    });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Main Full-Width 8-Semester Interactive Grid Grouped by Year */}
      <div className="w-full space-y-8">
          {[1, 2, 3, 4].map((yearNumber) => {
            const yearSemesters = studyPlan.filter((s) => s.year === yearNumber);
            const totalYearCredits = yearSemesters.reduce(
              (sum, sem) => sum + sem.courses.reduce((cSum, c) => cSum + c.credits, 0),
              0
            );
            const isYearCompleted = yearSemesters.every((s) => s.isCompleted);
            const hasCurrentTerm = yearSemesters.some((s) => s.isCurrent);

            return (
              <div key={yearNumber} className="space-y-4">
                {/* Year Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 pt-1">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <span>Year {yearNumber}</span>
                      {isYearCompleted && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                          Completed Year
                        </span>
                      )}
                      {hasCurrentTerm && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-semibold">
                          Current Academic Year
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                      {totalYearCredits} Credits Total
                    </span>
                  </div>
                </div>

                {/* Semesters Grid for Year {yearNumber} */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {yearSemesters.map((sem) => {
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
                                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                    {!sem.isCompleted && (
                                      <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 cursor-grab active:cursor-grabbing" title="Drag to move between semesters" />
                                    )}
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
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
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
      );
    })}
  </div>

      {/* Floating Edge Trigger Button for Course Repository Side Menu Drawer */}
      <button
        id="edge-catalog-drawer-trigger-btn"
        onClick={() => setIsCatalogMenuOpen(!isCatalogMenuOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-2.5 rounded-l-2xl shadow-2xl z-40 flex flex-col items-center space-y-2 text-xs font-bold transition-all cursor-pointer border-l border-t border-b border-indigo-500"
        title="Toggle Course Repository Side Menu"
      >
        <Layers className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="[writing-mode:vertical-lr] rotate-180 tracking-wider text-[11px] font-mono uppercase">
          Course Catalog
        </span>
      </button>

      {/* Course Repository Slide-Out Side Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-2xl border-l border-slate-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCatalogMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-xs font-bold text-white">Course Repository Side Menu</h3>
              <p className="text-[10px] text-slate-400">Drag courses directly onto any semester</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsAiChatOpen(!isAiChatOpen)}
              className="p-1.5 text-indigo-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Open PockeTA Co-Pilot"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setStudyPlan(INITIAL_SEMESTER_PLANS);
                localStorage.setItem('pocketa_study_plan_v3', JSON.stringify(INITIAL_SEMESTER_PLANS));
              }}
              className="p-1.5 text-rose-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset official plan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCatalogMenuOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3 shrink-0">
          {/* Category Filters (Capstone & Taken removed) */}
          <div className="flex flex-wrap gap-1">
            {['ALL', 'Core', 'Elective', 'General Education', 'WIE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search available courses..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Course Cards List (Draggable, Taken Courses Excluded, Capstone Excluded) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* AI Suggestions Section - Highlighted Draggable Items with Explanation */}
          {suggestions.length > 0 && (
            <div className="space-y-2.5 pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-1.5 px-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                <h4 className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider">
                  AI Suggested Recommendations (Draggable)
                </h4>
              </div>

              {suggestions.map((sug) => {
                const course = sug.suggestedCourse || catalog.find(c => c.code === sug.id || sug.title.includes(c.code));
                const plannedSem = course ? getPlannedSemester(course.code) : null;
                const taken = course ? isCourseTaken(course) : false;
                const isSelectedOrTaken = taken || !!plannedSem;

                return (
                  <div
                    key={sug.id}
                    draggable={course && !isSelectedOrTaken ? true : false}
                    onDragStart={(e) => course && !isSelectedOrTaken && handleDragStart(e, course, 'catalog')}
                    className={`bg-gradient-to-br from-amber-50 via-amber-50/80 to-indigo-50/40 border-2 border-amber-300/90 rounded-xl p-3 shadow-sm space-y-2 transition-all hover:border-amber-400 hover:shadow-md ${
                      isSelectedOrTaken
                        ? 'opacity-60 cursor-not-allowed select-none'
                        : 'cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                        {course && !isSelectedOrTaken && (
                          <GripVertical className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{sug.title}</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full shrink-0">
                        Suggested
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 leading-relaxed bg-white/90 p-2.5 rounded-lg border border-amber-200/70 shadow-2xs">
                      <span className="text-[10px] font-extrabold text-amber-900 uppercase block mb-0.5">
                        Explanation:
                      </span>
                      {sug.reason}
                    </div>

                    {course && !isSelectedOrTaken && (
                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[11px]">
                        <span className="text-amber-900 font-semibold text-[10px] flex items-center space-x-1">
                          <Move className="w-3 h-3 text-amber-600" />
                          <span>Drag to semester card or:</span>
                        </span>
                        <button
                          onClick={() => onApplySuggestion(sug)}
                          className="text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    {isSelectedOrTaken && (
                      <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg text-center">
                        ✓ Added to Plan ({plannedSem?.label.split(' ')[0]} {plannedSem?.label.split(' ')[1]})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {filteredCatalog.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 font-medium">
              No available courses found.
            </div>
          ) : (
            filteredCatalog.map((course) => {
              const plannedSem = getPlannedSemester(course.code);
              const taken = isCourseTaken(course);
              const isSelectedOrTaken = taken || !!plannedSem;

              return (
                <div
                  key={course.code}
                  draggable={!isSelectedOrTaken}
                  onDragStart={(e) => !isSelectedOrTaken && handleDragStart(e, course, 'catalog')}
                  className={`border rounded-xl p-3 transition-all relative ${
                    isSelectedOrTaken
                      ? 'bg-slate-100/80 border-slate-200 opacity-60 cursor-not-allowed select-none'
                      : 'bg-slate-50 border-slate-200 cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:bg-white hover:shadow-md group'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {!isSelectedOrTaken && (
                        <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                      )}
                      <span className={`font-mono text-xs font-bold ${isSelectedOrTaken ? 'text-slate-500' : 'text-indigo-600'}`}>
                        {course.code}
                      </span>
                      {taken ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                          Taken ({course.grade || 'Passed'})
                        </span>
                      ) : plannedSem ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Selected in {plannedSem.term}
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Available
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-medium">
                      {course.credits} Cr
                    </span>
                  </div>

                  <div className={`text-xs font-semibold mt-1 ${isSelectedOrTaken ? 'text-slate-500' : 'text-slate-800'}`}>
                    {course.title}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60">
                    <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                      Prereqs: {course.prerequisites.join(', ') || 'None'}
                    </div>

                    {!isSelectedOrTaken && (
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
            })
          )}
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
