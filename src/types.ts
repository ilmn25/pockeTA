export type CourseCategory = 'Core' | 'Elective' | 'Common Core' | 'Capstone' | 'WIE';

export interface Course {
  code: string;
  title: string;
  credits: number;
  category: CourseCategory;
  prerequisites: string[];
  semesterOffered: ('Term 1' | 'Term 2' | 'Term 3')[];
  standardDescription: string;
  personalizedDescription?: string;
  alignmentScore?: number;
  tags?: string[];
  grade?: string;
  termTaken?: string;
}

export interface SemesterPlan {
  id: string; // e.g. 'y1t1'
  label: string; // e.g. 'Year 1 Term 1'
  year: number;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  isCompleted?: boolean;
  isCurrent?: boolean;
  courses: Course[];
}

export interface StudentProfile {
  id: string;
  name: string;
  studentId: string;
  degree: string;
  degreeName?: string;
  major?: string;
  cohortYear: string;
  currentYearTerm: string;
  gpa: number;
  earnedCredits: number;
  totalRequiredCredits: number;
  careerGoals: string;
  targetJob?: string;
  targetJobSalary?: string;
  targetJobSkills?: string[];
  keySkillsInterest: string[];
}

export interface Suggestion {
  id: string;
  type: 'add' | 'move' | 'prerequisite_warning' | 'recommendation' | 'load_balance';
  title: string;
  reason: string;
  suggestedCourse?: Course;
  targetSemesterId?: string;
  applied?: boolean;
}

export interface WIEPosition {
  id: string;
  company: string;
  role: string;
  industry: string;
  location: string;
  duration: string;
  stipend: string;
  description: string;
  requiredSkills: string[];
  prerequisiteCourseCodes: string[];
  type: 'Internship' | 'Industry Research Attachment' | 'Clinical AI Placement';
  logoBadge?: string;
}

export interface CapstoneProject {
  id: string;
  title: string;
  supervisor: string;
  department: string;
  description: string;
  keyTech: string[];
  prerequisiteCourseCodes: string[];
  deliverables: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Challenging';
  capacity: string;
}

export interface AlignmentAnalysis {
  fitScore: number; // 0 - 100
  verdict: 'High Alignment' | 'Moderate Alignment' | 'Prerequisite Gap';
  alignmentReason: string;
  strengths: string[];
  skillGaps: string[];
  missingPrereqsInPlan: string[];
  recommendedCourseCodes: string[];
  suggestedPlanAction?: string;
}

export interface AdvisingMessage {
  id: string;
  sender: 'user' | 'pocketa';
  timestamp: string;
  content: string;
  relatedCourseCodes?: string[];
  suggestedActions?: {
    label: string;
    actionType: 'NAVIGATE' | 'ADD_COURSE' | 'UPDATE_GOAL';
    payload?: any;
  }[];
}
