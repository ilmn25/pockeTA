import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Plus, Trash2, AlertTriangle, CheckCircle2, ChevronRight, Info, Search, MoveRight, ArrowRight, Lightbulb, RefreshCw, X, Layers, GripVertical, Move } from 'lucide-react';
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
  
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);

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
    e.stopPropagation();
    try {
      e.dataTransfer.setData('text/plain', course.code);
      e.dataTransfer.setData('text', course.code);
      e.dataTransfer.setData('application/json', JSON.stringify({ code: course.code, sourceSemesterId }));
    } catch {
      // Fallback if dataTransfer setData fails in restricted contexts
    }
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

    let courseCode = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
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


  // Check if a course is taken
  const isCourseTaken = (c: Course) => {
    if (c.grade && c.grade !== 'Not Taken') return true;
    return studyPlan.some(sem => sem.isCompleted && sem.courses.some(sc => sc.code === c.code));
  };

  // Check if a course is Capstone or WIE (Excluded from general planner)
  const isExcludedFromPlanner = (c: Course) => {
    // Capstone checks
    if (c.category === 'Capstone') return true;
    if (c.code === 'COMP4913') return true;
    if (c.title.toLowerCase().includes('capstone')) return true;
    
    // WIE checks
    if (c.category === 'WIE') return true;
    if (c.code.includes('WIE')) return true;
    if (c.title.toLowerCase().includes('work-integrated education')) return true;
    
    return false;
  };

  // Helper to check if a course is recommended
  const isRecommended = (courseCode: string) => {
    return suggestions.some(sug => sug.id === courseCode || sug.title.includes(courseCode));
  };

  // Filter Catalog Courses (excludes capstone/WIE, includes selected & taken courses at the bottom)
  const filteredCatalog = catalog
    .filter(c => {
      if (isExcludedFromPlanner(c)) return false;

      const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' ? true : c.category === selectedCategory;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      const aSelected = isCourseTaken(a) || !!getPlannedSemester(a.code);
      const bSelected = isCourseTaken(b) || !!getPlannedSemester(b.code);
      
      // 1. Move selected/taken courses to the bottom
      if (!aSelected && bSelected) return -1;
      if (aSelected && !bSelected) return 1;
      
      // 2. For unselected courses, prioritize recommended ones
      if (!aSelected && !bSelected) {
        const aRecommended = isRecommended(a.code);
        const bRecommended = isRecommended(b.code);
        if (aRecommended && !bRecommended) return -1;
        if (!aRecommended && bRecommended) return 1;
      }
      
      return 0;
    });

  // Filter AI Suggestions (Hidden from view, used for logic)
  const filteredSuggestions = suggestions.filter(sug => {
    const course = sug.suggestedCourse || catalog.find(c => c.code === sug.id || sug.title.includes(c.code));
    if (!course) return false;
    const plannedSem = getPlannedSemester(course.code);
    const taken = isCourseTaken(course);
    return !(taken || !!plannedSem);
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Main Full-Width 8-Semester Interactive Grid Grouped by Year */}
      <div className="w-full space-y-8">
          {[1, 2, 3, 4].map((yearNumber) => {
            const yearSemesters = studyPlan.filter((s) => s.year === yearNumber);
            const totalYearCredits = yearSemesters.reduce(
              (sum, sem) => sum + sem.courses.reduce((cSum, c) => cSum + (isExcludedFromPlanner(c) ? 0 : c.credits), 0),
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {yearSemesters.map((sem) => {
              const termCredits = sem.courses.reduce((sum, c) => sum + (isExcludedFromPlanner(c) ? 0 : c.credits), 0);
              const visibleCourses = sem.courses.filter(c => !isExcludedFromPlanner(c));
              const maxCredits = sem.term === 'Term 3' ? 9 : 21;
              const minCredits = sem.term === 'Term 3' ? 0 : 12;
              const isOverloaded = termCredits > maxCredits;
              const isUnderloaded = termCredits < minCredits && !sem.isCompleted;
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
                        <span>{`Credit overload (>${maxCredits}). Consider shifting 1 course.`}</span>
                      </div>
                    )}

                    {/* Course Cards Container */}
                    <div className="mt-4 space-y-3 min-h-[140px]">
                      {visibleCourses.length === 0 ? (
                        <div className="h-full min-h-[120px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs">
                          <Plus className="w-5 h-5 mb-1 text-slate-400" />
                          <span>Drag & drop courses here</span>
                        </div>
                      ) : (
                        visibleCourses.map((course) => {
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
                                          ? 'text-emerald-700 bg-emerald-50'
                                          : course.grade.startsWith('B')
                                          ? 'text-blue-700 bg-blue-50'
                                          : course.grade.startsWith('C')
                                          ? 'text-amber-700 bg-amber-50'
                                          : course.grade === 'R'
                                          ? 'text-slate-700 bg-slate-100 border border-slate-200'
                                          : 'text-slate-600 bg-slate-50'
                                      }`}>
                                        {course.grade}
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

                              {/* Details Trigger */}
                              <div className="mt-2.5 flex items-center justify-end">
                                <button
                                  onClick={() => setActiveCourseModal(course)}
                                  className="text-[10px] text-indigo-600 hover:underline font-bold uppercase tracking-wider"
                                >
                                  View Details
                                </button>
                              </div>

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
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white py-4 px-2.5 rounded-l-2xl shadow-2xl z-40 flex flex-col items-center space-y-2 text-xs font-bold transition-all cursor-pointer border-l border-t border-b border-slate-700"
        title="Toggle Course Repository Side Menu"
      >
        <Layers className="w-5 h-5 text-indigo-400" />
        <span className="[writing-mode:vertical-lr] rotate-180 tracking-wider text-[11px] font-mono uppercase">
          Course Catalog
        </span>
      </button>

      {/* Course Repository Slide-Out Side Menu Drawer Overlay */}
      {isCatalogMenuOpen && (
        <div
          onClick={() => setIsCatalogMenuOpen(false)}
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40 transition-opacity ${draggedCourse ? 'pointer-events-none' : ''}`}
        />
      )}

      {/* Course Repository Slide-Out Side Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 max-w-full bg-white shadow-2xl border-l border-slate-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
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
              onClick={() => {
                setStudyPlan(INITIAL_SEMESTER_PLANS);
                localStorage.setItem('pocketa_study_plan_v5', JSON.stringify(INITIAL_SEMESTER_PLANS));
              }}
              className="p-1.5 text-rose-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Reset official plan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCatalogMenuOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3 shrink-0">
          {/* Category Filters (Capstone/WIE & Taken removed) */}
          <div className="flex flex-wrap gap-1">
            {['ALL', 'Core', 'Elective', 'Common Core'].map((cat) => (
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
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Course Cards List (Draggable, Taken Courses Excluded, Capstone/WIE Excluded) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredCatalog.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 font-medium">
              No available courses found.
            </div>
          ) : (
            filteredCatalog.map((course) => {
              const plannedSem = getPlannedSemester(course.code);
              const taken = isCourseTaken(course);
              const isSelectedOrTaken = taken || !!plannedSem;
              const recommended = isRecommended(course.code) && !isSelectedOrTaken;
              const suggestionExplanation = suggestions.find(s => s.id === course.code || s.title.includes(course.code))?.reason;

              return (
                <div
                  key={course.code}
                  draggable={!isSelectedOrTaken}
                  onDragStart={(e) => !isSelectedOrTaken && handleDragStart(e, course, 'catalog')}
                  className={`border rounded-xl p-3 transition-all relative ${
                    isSelectedOrTaken
                      ? 'bg-slate-100/80 border-slate-200 opacity-60 cursor-not-allowed select-none'
                      : recommended
                        ? 'bg-amber-50/30 border-amber-200 cursor-grab active:cursor-grabbing hover:border-amber-400 hover:bg-white hover:shadow-md group'
                        : 'bg-slate-50 border-slate-200 cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:bg-white hover:shadow-md group'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {!isSelectedOrTaken && (
                        <GripVertical className={`w-3.5 h-3.5 shrink-0 ${recommended ? 'text-amber-400 group-hover:text-amber-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                      )}
                      <span className={`font-mono text-xs font-bold ${isSelectedOrTaken ? 'text-slate-500' : recommended ? 'text-amber-700' : 'text-indigo-600'}`}>
                        {course.code}
                      </span>
                      {recommended && (
                        <span className="flex items-center space-x-1 text-[9px] font-black text-amber-700 bg-amber-100/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Recommended</span>
                        </span>
                      )}
                      {taken ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                          Taken ({course.grade || 'Passed'})
                        </span>
                      ) : plannedSem ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Selected in {plannedSem.term}
                        </span>
                      ) : (
                        !recommended && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Available
                          </span>
                        )
                      )}
                    </div>
                    <span className="text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-medium">
                      {course.credits} Cr
                    </span>
                  </div>

                  <div className={`text-xs font-semibold mt-1 ${isSelectedOrTaken ? 'text-slate-500' : 'text-slate-800'}`}>
                    {course.title}
                  </div>

                  {recommended && suggestionExplanation && (
                    <div className="mt-2 pt-2 border-t border-amber-100/50">
                      <p className="text-[10px] text-amber-900/60 font-medium italic leading-relaxed">
                        {suggestionExplanation}
                      </p>
                    </div>
                  )}

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
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 rounded px-1.5 py-0.5 outline-none cursor-pointer"
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
                <p className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 leading-relaxed font-medium">
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
