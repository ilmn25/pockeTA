import React, { useState } from 'react';
import { Target, X, Sparkles, Check, Lightbulb } from 'lucide-react';
import { StudentProfile } from '../types';

interface GoalEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveGoals: (newGoals: string, selectedTags: string[]) => void;
}

const ALL_SKILL_TAGS = [
  'Software Engineering',
  'Human Computer Interaction',
  'Database Systems',
  'Computer Vision',
  'Artificial Intelligence',
  'Machine Learning',
  'Computer Networking',
  'Operating Systems',
  'Cybersecurity',
  'Information Systems'
];

export const GoalEditorModal: React.FC<GoalEditorModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveGoals
}) => {
  const [goalsText, setGoalsText] = useState(profile.careerGoals);
  const [selectedTags, setSelectedTags] = useState<string[]>(profile.keySkillsInterest || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSaveGoals(goalsText, selectedTags);
    setIsSubmitting(false);
    onClose();
  };

  const handlePreset = (presetText: string) => {
    setGoalsText(presetText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-800 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Record & Update Career Aspirations</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                PockeTA uses your aspirations to personalize course descriptions and proactively guide your plan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Career Objectives & Aspirations Description
            </label>
            <textarea
              value={goalsText}
              onChange={(e) => setGoalsText(e.target.value)}
              rows={4}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
              placeholder="e.g. Aiming to work as an AI Healthcare Specialist focused on computer vision models for clinical diagnostic support and surgical robotics..."
            />
          </div>

          {/* Preset Inspirations */}
          <div>
            <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Career Pathway Inspiration Templates:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handlePreset('Targeting an R&D career in AI-driven Medical Imaging & Bio-Healthcare Robotics. Aiming to build clinical-grade vision models after graduation.')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors text-left font-medium"
              >
                🏥 Medical Imaging & Robotics
              </button>
              <button
                type="button"
                onClick={() => handlePreset('Pursuing Software Engineering in Autonomous Driving & Robotics Kinematics. Focused on C++, ROS2, and sensor fusion systems.')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors text-left font-medium"
              >
                🤖 Autonomous Systems & ROS2
              </button>
              <button
                type="button"
                onClick={() => handlePreset('Aiming for a Postgraduate Master / PhD research position in Privacy-Preserving Deep Learning and Federated Cloud Infrastructure.')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors text-left font-medium"
              >
                🎓 AI Postgraduate Research
              </button>
            </div>
          </div>

          {/* Skill Interest Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Key Technical Focus Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_SKILL_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Personalizing...' : 'Update & Re-personalize Courses'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
