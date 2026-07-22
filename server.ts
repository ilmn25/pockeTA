import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// API Endpoints (Deterministic & Smart Local Advising Engine)
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Advising Q&A Endpoint
app.post('/api/advising/ask', async (req, res) => {
  try {
    const { question, studentProfile } = req.body;
    const qLower = (question || '').toLowerCase();
    
    let answer = '';
    let suggestedActions = [
      { label: 'Go to Study Planning Workspace', actionType: 'NAVIGATE', payload: { tab: 'study-plan' } },
      { label: 'Check WIE & Capstone Fit', actionType: 'NAVIGATE', payload: { tab: 'wie-capstone' } }
    ];

    if (qLower.includes('prerequisite') || qLower.includes('prereq')) {
      answer = `Based on your profile in **${studentProfile?.major || 'Computer Science & AI'}**, here is PockeTA's prerequisite breakdown:\n\n` +
        `• **COMP2011 (Data Structures)** is a strict prerequisite for **COMP3211 (Software Engineering)** and **COMP3438 (System Programming)**.\n` +
        `• **COMP3421 (Web App Design)** requires **COMP2021 (Object-Oriented Programming)**.\n` +
        `• **COMP4913 (Capstone Project)** requires completing at least 60 credits including core Level 3 courses.\n\n` +
        `You can drag and drop any course in your Study Plan to adjust your sequence!`;
    } else if (qLower.includes('wie') || qLower.includes('internship') || qLower.includes('placement')) {
      answer = `For your **Work-Integrated Education (WIE)** placement:\n\n` +
        `• PockeTA recommends placing WIE in **Year 3 Term 2** or **Summer** after taking *COMP3211 (Software Engineering)*.\n` +
        `• Industry partners favor candidates with project experience in *Data Structures*, *Software Engineering*, and *Web/Cloud Development*.`;
      suggestedActions = [
        { label: 'Explore WIE Placements', actionType: 'NAVIGATE', payload: { tab: 'wie-capstone' } }
      ];
    } else if (qLower.includes('capstone') || qLower.includes('project')) {
      answer = `Regarding your **Capstone Project (COMP4913)**:\n\n` +
        `• It spans **Year 4 Term 1 & Term 2** (6 credits total).\n` +
        `• For your goal in **${studentProfile?.careerGoals || 'Software Engineering'}**, consider pairing it with specialized electives like *Machine Learning (COMP4432)* or *Service & Cloud Computing (COMP4442)*.`;
      suggestedActions = [
        { label: 'View Capstone Options', actionType: 'NAVIGATE', payload: { tab: 'wie-capstone' } }
      ];
    } else {
      answer = `Based on your career aspirations (**${studentProfile?.careerGoals || 'Software Engineering, AI & Full-Stack Systems'}**):\n\n` +
        `1. **Recommended Electives**: We suggest taking *COMP3421 (Web Application Design)*, *COMP4442 (Service & Cloud Computing)*, and *COMP4432 (Machine Learning)*.\n` +
        `2. **Credit Load**: Keep a balanced 15-18 credit load per term to ensure optimal academic performance.\n` +
        `3. **Sequencing**: Ensure foundational Level 2 programming courses are completed before enrolling in Level 4 electives.`;
    }

    res.json({ answer, suggestedActions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to answer advising question.' });
  }
});

// 2. Personalize Course Descriptions based on Student Career Goals
app.post('/api/courses/personalize', async (req, res) => {
  try {
    const { careerGoals, courses } = req.body;
    const goalText = careerGoals || 'Software Engineering & Intelligent Systems';

    const personalizedCourses = (courses || []).map((c: any) => {
      let desc = c.standardDescription || '';
      if (c.code === 'COMP3421') {
        desc = `Tailored for ${goalText}: Develops production-ready full-stack web applications, React architectures, and REST APIs essential for building modern user-facing software.`;
      } else if (c.code === 'COMP4442') {
        desc = `Tailored for ${goalText}: Master cloud microservices, Docker containerization, and backend infrastructure required for scalable enterprise deployments.`;
      } else if (c.code === 'COMP4432') {
        desc = `Tailored for ${goalText}: Applies predictive ML algorithms and deep neural networks to real-world software features and intelligent data pipelines.`;
      } else {
        desc = `Tailored for ${goalText}: Directly strengthens computational foundations and technical skills in ${c.tags?.join(', ') || 'software development'} required for your target career path.`;
      }

      return {
        code: c.code,
        personalizedDescription: desc,
        alignmentScore: 88 + (c.code.charCodeAt(c.code.length - 1) % 10)
      };
    });

    res.json({ personalizedCourses });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to personalize courses.' });
  }
});

// 3. Proactive Study Plan Suggestions & Prerequisites Check
app.post('/api/study-plan/suggestions', async (req, res) => {
  try {
    const { careerGoals } = req.body;
    res.json({
      suggestions: [
        {
          id: 'sug_01',
          type: 'add',
          title: 'Add COMP3421: Web Application Design',
          reason: `Recommended for ${careerGoals || 'Software Engineering'}: Develops core React and full-stack API design competencies.`,
          suggestedCourseCode: 'COMP3421',
          targetSemesterId: 'y4t2'
        },
        {
          id: 'sug_02',
          type: 'add',
          title: 'Add COMP4442: Service and Cloud Computing',
          reason: 'Key elective for microservices, cloud deployments, and scalable backend infrastructure.',
          suggestedCourseCode: 'COMP4442',
          targetSemesterId: 'y4t2'
        }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate suggestions.' });
  }
});

// 4. WIE & Capstone Alignment Analysis
app.post('/api/alignment/wie-capstone', async (req, res) => {
  try {
    const { selectionType, item, careerGoals, studyPlan } = req.body;

    const takenAndPlannedCourseCodes = new Set(
      studyPlan?.flatMap((s: any) => s.courses.map((c: any) => c.code)) || []
    );

    const requiredPrereqs: string[] = item?.prerequisiteCourseCodes || [];
    const missingPrereqsInPlan = requiredPrereqs.filter(code => !takenAndPlannedCourseCodes.has(code));

    const fitScore = missingPrereqsInPlan.length > 0 ? 75 : 95;
    const verdict = missingPrereqsInPlan.length > 0 ? 'Prerequisite Gap' : 'High Alignment';

    res.json({
      fitScore,
      verdict,
      alignmentReason: missingPrereqsInPlan.length > 0
        ? `This ${selectionType} (${item?.title || item?.role}) aligns well with ${careerGoals || 'your career goals'}, but your plan is missing prerequisite course(s): ${missingPrereqsInPlan.join(', ')}.`
        : `Strong fit! This ${selectionType} directly matches your technical coursework and career aspirations in ${careerGoals || 'Software Engineering'}.`,
      strengths: [
        `Direct practical application of software engineering principles`,
        `High relevance to target sector: ${item?.industry || item?.department || 'Tech'}`,
        `Fulfills graduation degree requirements efficiently`
      ],
      skillGaps: missingPrereqsInPlan.length > 0
        ? missingPrereqsInPlan.map(code => `Missing course ${code} in study plan`)
        : ['Minor gap in specialized domain frameworks'],
      missingPrereqsInPlan,
      recommendedCourseCodes: missingPrereqsInPlan,
      suggestedPlanAction: missingPrereqsInPlan.length > 0
        ? `Add missing course(s) ${missingPrereqsInPlan.join(', ')} to your study plan.`
        : `You are on track! Ready to apply.`
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to evaluate alignment.' });
  }
});

// -------------------------------------------------------------
// Vite Server Setup (Dev vs Production)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

