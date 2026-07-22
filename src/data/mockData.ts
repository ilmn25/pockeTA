import { Course, SemesterPlan, StudentProfile, WIEPosition, CapstoneProject } from '../types';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'std_1001',
  name: 'Alex Tan',
  studentId: '22084920D',
  degree: 'BEng (Hons) in Computing / Computer Science',
  cohortYear: '2023/2024',
  currentYearTerm: '2026/1 (Year 4 Term 1)',
  gpa: 3.06,
  earnedCredits: 87,
  totalRequiredCredits: 124,
  careerGoals: 'Specializing in Software Engineering, Human-Computer Interaction & AI Systems. Aiming for advanced positions in full-stack architecture, software security, and AI product engineering.',
  targetJob: 'Full-Stack AI Software Engineer',
  targetJobSalary: 'HKD 32,000 - 45,000 / mo',
  targetJobSkills: ['Software Engineering', 'HCI & Web Development', 'Database Architecture', 'Machine Learning', 'Systems & Cloud Security'],
  keySkillsInterest: ['Software Engineering', 'Human Computer Interaction', 'Database Systems', 'Computer Vision', 'AI']
};

export const COMPULSORY_COURSES: Course[] = [
  { code: 'AMA1104', title: 'INTRODUCTORY PROBABILITY', credits: 2.0, category: 'Core', prerequisites: [], semesterOffered: ['Term 1'], standardDescription: 'Fundamentals of probability theory, random variables, and basic statistical inference.', grade: 'C+', termTaken: '2023/1' },
  { code: 'COMP1002', title: 'COMPUTATIONAL THINKING AND PROBLEM SOLVING', credits: 4.0, category: 'Core', prerequisites: [], semesterOffered: ['Term 1'], standardDescription: 'Algorithmic problem solving, introductory programming, logic, and computational abstraction.', grade: 'A-', termTaken: '2023/1' },
  { code: 'COMP1011', title: 'PROGRAMMING FUNDAMENTALS', credits: 3.0, category: 'Core', prerequisites: ['COMP1002'], semesterOffered: ['Term 2'], standardDescription: 'Core programming constructs, control structures, functions, and memory management.', grade: 'B-', termTaken: '2023/2' },
  { code: 'COMP1411', title: 'INTRODUCTION TO COMPUTER SYSTEMS', credits: 3.0, category: 'Core', prerequisites: [], semesterOffered: ['Term 2'], standardDescription: 'Data representations, machine organization, assembly language, and hardware-software interaction.', grade: 'B', termTaken: '2023/2' },
  { code: 'COMP1433', title: 'INTRODUCTION TO DATA ANALYTICS', credits: 3.0, category: 'Core', prerequisites: [], semesterOffered: ['Term 2'], standardDescription: 'Data manipulation, exploratory analysis, visualization, and basic statistical tools using Python/R.', grade: 'B-', termTaken: '2023/2' },
  { code: 'COMP2011', title: 'DATA STRUCTURES', credits: 3.0, category: 'Core', prerequisites: ['COMP1011'], semesterOffered: ['Term 1'], standardDescription: 'Linear data structures, trees, graphs, sorting/searching algorithms, and complexity analysis.', grade: 'B', termTaken: '2024/1' },
  { code: 'COMP2012', title: 'DISCRETE MATHEMATICS', credits: 3.0, category: 'Core', prerequisites: [], semesterOffered: ['Term 1'], standardDescription: 'Sets, logic, proof techniques, graph theory, combinatorics, and algebraic structures for computing.', grade: 'B+', termTaken: '2024/1' },
  { code: 'COMP2021', title: 'OBJECT-ORIENTED PROGRAMMING', credits: 3.0, category: 'Core', prerequisites: ['COMP1011'], semesterOffered: ['Term 1'], standardDescription: 'Object-oriented design principles, encapsulation, inheritance, polymorphism, and Java design patterns.', grade: 'B+', termTaken: '2024/1' },
  { code: 'COMP2411', title: 'DATABASE SYSTEMS', credits: 3.0, category: 'Core', prerequisites: ['COMP2011'], semesterOffered: ['Term 1'], standardDescription: 'Relational model, SQL query optimization, ER modeling, normalization, and database indexing.', grade: 'C+', termTaken: '2024/1' },
  { code: 'COMP2322', title: 'COMPUTER NETWORKING', credits: 3.0, category: 'Core', prerequisites: ['COMP1411'], semesterOffered: ['Term 2'], standardDescription: 'OSI and TCP/IP protocol stack, routing, socket programming, link layer, and network performance.', grade: 'B-', termTaken: '2024/2' },
  { code: 'COMP2421', title: 'COMPUTER ORGANIZATION', credits: 3.0, category: 'Core', prerequisites: ['COMP1411'], semesterOffered: ['Term 2'], standardDescription: 'CPU architecture, instruction set architecture, pipelining, memory hierarchy, and cache design.', grade: 'B+', termTaken: '2024/2' },
  { code: 'COMP2432', title: 'OPERATING SYSTEMS', credits: 3.0, category: 'Core', prerequisites: ['COMP2011', 'COMP2421'], semesterOffered: ['Term 2'], standardDescription: 'Processes, concurrency, synchronization, virtual memory, file systems, and system calls.', grade: 'B+', termTaken: '2024/2' },
  { code: 'CLC1101', title: 'UNIVERSITY CHINESE', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'University-level Chinese language and communication skills.', grade: 'B-', termTaken: '2025/1' },
  { code: 'COMP3211', title: 'SOFTWARE ENGINEERING', credits: 3.0, category: 'Core', prerequisites: ['COMP2021'], semesterOffered: ['Term 1'], standardDescription: 'Software lifecycle models, Agile/Scrum, requirement specification, UML design, and CI/CD testing.', grade: 'B+', termTaken: '2025/1' },
  { code: 'COMP3423', title: 'HUMAN COMPUTER INTERACTION', credits: 3.0, category: 'Core', prerequisites: ['COMP2021'], semesterOffered: ['Term 1'], standardDescription: 'User-centered design, usability evaluation, wireframing, interactive prototyping, and cognitive UI guidelines.', grade: 'A', termTaken: '2025/1' },
  { code: 'COMP3438', title: 'SYSTEM PROGRAMMING', credits: 3.0, category: 'Core', prerequisites: ['COMP2432'], semesterOffered: ['Term 1'], standardDescription: 'Low-level C programming, Unix system calls, process control, IPC, and POSIX multithreading.', grade: 'B', termTaken: '2025/1' },
  { code: 'COMP3334', title: 'COMPUTER SYSTEMS SECURITY', credits: 3.0, category: 'Core', prerequisites: ['COMP2322', 'COMP2432'], semesterOffered: ['Term 2'], standardDescription: 'Cryptography principles, network security, authentication protocols, OS access control, and malware analysis.', grade: 'B+', termTaken: '2025/2' },
  { code: 'COMP3511', title: 'LEGAL ASPECTS AND ETHICS OF COMPUTING', credits: 3.0, category: 'Core', prerequisites: [], semesterOffered: ['Term 2'], standardDescription: 'Ethical frameworks, intellectual property, privacy laws, and professional responsibility in computing.', grade: 'Not Taken', termTaken: '-' },
  { code: 'GUR1004', title: 'LEADERSHIP', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 2'], standardDescription: 'Leadership theories, personal development, and social responsibility.', grade: 'B+', termTaken: '2025/2' },
  { code: 'COMP4913', title: 'CAPSTONE PROJECT', credits: 6.0, category: 'Capstone', prerequisites: ['COMP3211'], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Year-long comprehensive computing engineering project, system implementation, thesis, and defense.', grade: 'R', termTaken: '2026/1' },
  { code: 'ELC1012', title: 'UNIVERSITY ENGLISH II', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Advanced academic English writing and presentation skills.', grade: 'R', termTaken: '2026/1' }
];

export const ELECTIVE_COURSES: Course[] = [
  { code: 'COMP3122', title: 'INFORMATION SYSTEMS DEVELOPMENT', credits: 3.0, category: 'Elective', prerequisites: ['COMP2411'], semesterOffered: ['Term 2'], standardDescription: 'Enterprise IS architecture, web services, microservices integration, and enterprise system engineering.', grade: 'A-', termTaken: '2025/2' },
  { code: 'COMP4122', title: 'GAME DESIGN AND DEVELOPMENT', credits: 3.0, category: 'Elective', prerequisites: ['COMP2021'], semesterOffered: ['Term 1'], standardDescription: 'Game mechanics, physics engines, graphics shaders, audio integration, and Unity/Unreal scripting.', grade: 'A-', termTaken: '2025/1' },
  // Common Core List
  { code: 'COMP3911', title: 'SERVICE LEARNING', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Applying IT solutions for community empowerment and accessibility.', grade: 'A', termTaken: '2025/1' },
  { code: 'GUR1001', title: 'HEALTHY LIFESTYLE (PHYSICAL)', credits: 0.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Promoting physical well-being and a healthy lifestyle.', grade: 'P', termTaken: '2023/1' },
  { code: 'GUR1002', title: 'AIDA', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Artificial Intelligence and Data Analytics foundational concepts.', grade: 'B', termTaken: '2024/2' },
  { code: 'GUR1003', title: 'INNOVATION AND ENTREPRENEURSHIP', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Concepts and practices of innovation and technology entrepreneurship.', grade: 'B+', termTaken: '2024/2' },
  { code: 'ELC1011', title: 'UNIVERSITY ENGLISH I', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Fundamental academic English skills.', grade: 'B+', termTaken: '2023/1' },
  { code: 'CAR1001', title: 'AR (A): HUMAN NATURE, RELATIONS AND DEVELOPMENT', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Exploring human nature and developmental relationships.', grade: 'A-', termTaken: '2024/1' },
  { code: 'CAR1002', title: 'CAR (D): SCIENCE, TECHNOLOGY AND ENVIRONMENT', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Impact of science and technology on the environment.', grade: 'B', termTaken: '2025/1' },
  { code: 'CAR1003', title: 'CAR (M): CHINESE HISTORY AND CULTURE', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Overview of Chinese historical development and cultural heritage.', grade: 'B-', termTaken: '2023/2' },
  { code: 'CAR1004', title: 'CAR (N): CULTURES, ORGANISATIONS, SOCIETIES AND GLOBALISATION', credits: 3.0, category: 'Common Core', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Societal structures and the impact of globalization.', grade: 'B+', termTaken: '2025/2' },
  { code: 'COMP4011', title: 'THEORY OF COMPUTATION', credits: 3.0, category: 'Elective', prerequisites: ['COMP2012'], semesterOffered: ['Term 1'], standardDescription: 'Automata theory, formal languages, Turing machines, decidability, and computational complexity theory.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4121', title: 'E-COMMERCE TECHNOLOGY', credits: 3.0, category: 'Elective', prerequisites: ['COMP2322', 'COMP2411'], semesterOffered: ['Term 2'], standardDescription: 'E-commerce protocols, payment security, recommendation engines, and microservice marketplaces.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4123', title: 'BUSINESS PROCESS AND WORKFLOW MANAGEMENT', credits: 3.0, category: 'Elective', prerequisites: ['COMP2411'], semesterOffered: ['Term 1'], standardDescription: 'BPMN modeling, workflow execution engines, process mining, and enterprise automation.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4125', title: 'OPERATIONS RESEARCH AND LOGISTICS MANAGEMENT', credits: 3.0, category: 'Elective', prerequisites: ['AMA1104', 'COMP2011'], semesterOffered: ['Term 2'], standardDescription: 'Linear programming, network optimization models, queueing theory, and inventory supply chain management.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4127', title: 'INFORMATION SYSTEMS AUDIT', credits: 3.0, category: 'Elective', prerequisites: ['COMP2411', 'COMP3334'], semesterOffered: ['Term 1'], standardDescription: 'IS auditing standards, internal control evaluation, COBIT frameworks, and cybersecurity risk compliance.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4133', title: 'INFORMATION RETRIEVAL', credits: 3.0, category: 'Elective', prerequisites: ['COMP2011'], semesterOffered: ['Term 1'], standardDescription: 'Search engine indexing, vector space retrieval models, web crawling, TF-IDF, and learning-to-rank.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4135', title: 'KNOWLEDGE AND INFORMATION', credits: 3.0, category: 'Elective', prerequisites: ['COMP2411'], semesterOffered: ['Term 2'], standardDescription: 'Knowledge graphs, ontologies, semantic web protocols (RDF/SPARQL), and reasoning systems.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4136', title: 'DATA PROTECTION AND SECURITY', credits: 3.0, category: 'Elective', prerequisites: ['COMP3334'], semesterOffered: ['Term 2'], standardDescription: 'Data anonymization, differential privacy, zero-knowledge proofs, and secure multiparty computation.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4146', title: 'COMPUTATIONAL FINANCE', credits: 3.0, category: 'Elective', prerequisites: ['AMA1104', 'COMP2011'], semesterOffered: ['Term 1'], standardDescription: 'Monte Carlo option pricing, algorithmic trading systems, portfolio optimization, and quantitative risk models.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4322', title: 'INTERNETWORKING PROTOCOLS, SOFTWARE AND MANAGEMENT', credits: 3.0, category: 'Elective', prerequisites: ['COMP2322'], semesterOffered: ['Term 1'], standardDescription: 'BGP/OSPF routing protocols, Software-Defined Networking (SDN), network telemetry, and SNMP management.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4332', title: 'MOBILE SECURITY: PRINCIPLES AND PRACTICE', credits: 3.0, category: 'Elective', prerequisites: ['COMP2322', 'COMP3334'], semesterOffered: ['Term 2'], standardDescription: 'iOS/Android application sandboxing, mobile OS vulnerability analysis, reverse engineering, and app permissions.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4334', title: 'PRINCIPLES AND PRACTICE OF INTERNET SECURITY', credits: 3.0, category: 'Elective', prerequisites: ['COMP3334'], semesterOffered: ['Term 1'], standardDescription: 'TLS/SSL handshakes, PKI infrastructure, firewalls, intrusion detection systems (IDS), and DDoS mitigation.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4342', title: 'MOBILE COMPUTING', credits: 3.0, category: 'Elective', prerequisites: ['COMP2322'], semesterOffered: ['Term 2'], standardDescription: 'Mobile wireless networks (5G/6G), location-based services, mobile edge computing, and energy-aware systems.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4422', title: 'COMPUTER GRAPHICS', credits: 3.0, category: 'Elective', prerequisites: ['COMP2011'], semesterOffered: ['Term 1'], standardDescription: '3D transformation matrices, rasterization, ray tracing, OpenGL/WebGL graphics shaders, and illumination models.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4423', title: 'COMPUTER VISION', credits: 3.0, category: 'Elective', prerequisites: ['COMP2011'], semesterOffered: ['Term 1'], standardDescription: 'Image filtering, edge detection, feature extraction (SIFT/ORB), 3D stereo reconstruction, and object recognition.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4424', title: 'EXTENDED REALITY: THEORY AND PRACTICE', credits: 3.0, category: 'Elective', prerequisites: ['COMP3423'], semesterOffered: ['Term 2'], standardDescription: 'Augmented reality tracking, virtual reality head-mounted display interfaces, spatial audio, and 3D UI interaction.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4431', title: 'ARTIFICIAL INTELLIGENCE', credits: 3.0, category: 'Elective', prerequisites: ['COMP2011', 'AMA1104'], semesterOffered: ['Term 1'], standardDescription: 'State-space search, heuristic optimization, constraint satisfaction, game trees, and knowledge representation.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4432', title: 'MACHINE LEARNING', credits: 3.0, category: 'Elective', prerequisites: ['COMP2011', 'AMA1104'], semesterOffered: ['Term 2'], standardDescription: 'Supervised/unsupervised learning, decision trees, SVMs, neural networks, gradient descent, and cross-validation.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4433', title: 'DATA MINING AND DATA WAREHOUSING', credits: 3.0, category: 'Elective', prerequisites: ['COMP2411'], semesterOffered: ['Term 1'], standardDescription: 'Association rule mining (Apriori), k-means clustering, decision tree classification, and ETL data warehouses.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4434', title: 'BIG DATA ANALYTICS', credits: 3.0, category: 'Elective', prerequisites: ['COMP2411', 'COMP2011'], semesterOffered: ['Term 2'], standardDescription: 'Distributed data frameworks (Hadoop MapReduce, Apache Spark), HDFS, stream processing, and large-scale graph mining.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4436', title: 'ARTIFICIAL INTELLIGENCE OF THINGS', credits: 3.0, category: 'Elective', prerequisites: ['COMP2322'], semesterOffered: ['Term 1'], standardDescription: 'Edge AI inference, TinyML on microcontrollers, IoT sensor telemetry fusion, and low-power smart sensing.', grade: 'Not Taken', termTaken: '-' },
  { code: 'COMP4442', title: 'SERVICE AND CLOUD COMPUTING', credits: 3.0, category: 'Elective', prerequisites: ['COMP2322', 'COMP3211'], semesterOffered: ['Term 2'], standardDescription: 'IaaS/PaaS/SaaS architectures, Docker containerization, Kubernetes orchestration, serverless lambdas, and multi-cloud.', grade: 'Not Taken', termTaken: '-' },
  { code: 'DSAI4201', title: 'DATA PROTECTION AND SECURITY', credits: 3.0, category: 'Elective', prerequisites: [], semesterOffered: ['Term 1'], standardDescription: 'Data privacy principles, secure AI data pipelines, regulatory compliance, and encrypted data processing.', grade: 'Not Taken', termTaken: '-' },
  { code: 'DSAI4203', title: 'MACHINE LEARNING', credits: 3.0, category: 'Elective', prerequisites: [], semesterOffered: ['Term 2'], standardDescription: 'Foundational machine learning models, statistical learning theory, deep learning frameworks, and AI model evaluation.', grade: 'Not Taken', termTaken: '-' },
  { code: 'DSAI4204', title: 'DATA MINING AND DATA WAREHOUSING', credits: 3.0, category: 'Elective', prerequisites: [], semesterOffered: ['Term 1'], standardDescription: 'Advanced pattern discovery, multidimensional data cubes, outlier detection, and enterprise data mining.', grade: 'Not Taken', termTaken: '-' },
  { code: 'DSAI4205', title: 'BIG DATA ANALYTICS', credits: 3.0, category: 'Elective', prerequisites: [], semesterOffered: ['Term 2'], standardDescription: 'Scalable cloud data engineering, distributed graph algorithms, real-time analytics, and Spark pipelines.', grade: 'Not Taken', termTaken: '-' },
  { code: 'EIE3312', title: 'LINEAR SYSTEMS', credits: 3.0, category: 'Elective', prerequisites: [], semesterOffered: ['Term 1'], standardDescription: 'Signals and systems theory, Fourier transforms, Laplace transforms, Z-transforms, and linear system stability.', grade: 'Not Taken', termTaken: '-' },
  { code: 'MM2021', title: 'MANAGEMENT & ORGANISATION', credits: 3.0, category: 'Elective', prerequisites: [], semesterOffered: ['Term 1', 'Term 2'], standardDescription: 'Organizational behavior, strategic management, corporate leadership styles, and human resource management.', grade: 'Not Taken', termTaken: '-' }
];

export const COURSE_CATALOG: Course[] = [
  ...COMPULSORY_COURSES,
  ...ELECTIVE_COURSES
];

export const INITIAL_SEMESTER_PLANS: SemesterPlan[] = [
  {
    id: 'y1t1',
    label: '2023/1 (Year 1 Term 1)',
    year: 1,
    term: 'Term 1',
    isCompleted: true,
    courses: [
      COMPULSORY_COURSES.find(c => c.code === 'AMA1104')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP1002')!,
      ELECTIVE_COURSES.find(c => c.code === 'ELC1011')!,
      ELECTIVE_COURSES.find(c => c.code === 'GUR1001')!
    ]
  },
  {
    id: 'y1t2',
    label: '2023/2 (Year 1 Term 2)',
    year: 1,
    term: 'Term 2',
    isCompleted: true,
    courses: [
      COMPULSORY_COURSES.find(c => c.code === 'COMP1011')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP1411')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP1433')!,
      COMPULSORY_COURSES.find(c => c.code === 'CLC1101')!,
      ELECTIVE_COURSES.find(c => c.code === 'CAR1003')!
    ]
  },
  {
    id: 'y1s',
    label: '2023/3 (Year 1 Term 3)',
    year: 1,
    term: 'Term 3',
    isCompleted: true,
    courses: []
  },
  {
    id: 'y2t1',
    label: '2024/1 (Year 2 Term 1)',
    year: 2,
    term: 'Term 1',
    isCompleted: true,
    courses: [
      COMPULSORY_COURSES.find(c => c.code === 'COMP2011')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP2012')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP2021')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP2411')!,
      COMPULSORY_COURSES.find(c => c.code === 'GUR1004')!,
      ELECTIVE_COURSES.find(c => c.code === 'CAR1001')!
    ]
  },
  {
    id: 'y2t2',
    label: '2024/2 (Year 2 Term 2)',
    year: 2,
    term: 'Term 2',
    isCompleted: true,
    courses: [
      COMPULSORY_COURSES.find(c => c.code === 'COMP2322')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP2421')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP2432')!,
      ELECTIVE_COURSES.find(c => c.code === 'GUR1002')!,
      ELECTIVE_COURSES.find(c => c.code === 'GUR1003')!
    ]
  },
  {
    id: 'y2s',
    label: '2024/3 (Year 2 Term 3)',
    year: 2,
    term: 'Term 3',
    isCompleted: true,
    courses: []
  },
  {
    id: 'y3t1',
    label: '2025/1 (Year 3 Term 1)',
    year: 3,
    term: 'Term 1',
    isCompleted: true,
    courses: [
      COMPULSORY_COURSES.find(c => c.code === 'COMP3211')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP3423')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP3438')!,
      ELECTIVE_COURSES.find(c => c.code === 'COMP4122')!,
      ELECTIVE_COURSES.find(c => c.code === 'COMP3911')!,
      ELECTIVE_COURSES.find(c => c.code === 'CAR1002')!
    ]
  },
  {
    id: 'y3t2',
    label: '2025/2 (Year 3 Term 2)',
    year: 3,
    term: 'Term 2',
    isCompleted: true,
    courses: [
      COMPULSORY_COURSES.find(c => c.code === 'COMP3334')!,
      COMPULSORY_COURSES.find(c => c.code === 'COMP3511')!,
      ELECTIVE_COURSES.find(c => c.code === 'COMP3122')!,
      ELECTIVE_COURSES.find(c => c.code === 'CAR1004')!
    ]
  },
  {
    id: 'y3s',
    label: '2025/3 (Year 3 Term 3)',
    year: 3,
    term: 'Term 3',
    isCompleted: true,
    courses: []
  },
  {
    id: 'y4t1',
    label: '2026/1 (Year 4 Term 1)',
    year: 4,
    term: 'Term 1',
    isCurrent: true,
    courses: [
      COMPULSORY_COURSES.find(c => c.code === 'COMP4913')!,
      COMPULSORY_COURSES.find(c => c.code === 'ELC1012')!
    ]
  },
  {
    id: 'y4t2',
    label: '2026/2 (Year 4 Term 2)',
    year: 4,
    term: 'Term 2',
    isCompleted: false,
    courses: [
      ELECTIVE_COURSES.find(c => c.code === 'COMP4431')!,
      ELECTIVE_COURSES.find(c => c.code === 'COMP4432')!,
      ELECTIVE_COURSES.find(c => c.code === 'COMP4423')!
    ]
  },
  {
    id: 'y4s',
    label: '2026/3 (Year 4 Term 3)',
    year: 4,
    term: 'Term 3',
    isCompleted: false,
    courses: []
  }
];

export const MOCK_WIE_POSITIONS: WIEPosition[] = [
  {
    id: 'wie_01',
    company: 'TechScale Cloud Systems',
    role: 'Full-Stack Software Engineering Intern',
    industry: 'Enterprise Software / Web Architecture',
    location: 'Science Park Innovation Hub',
    duration: '6 Months (Full-Time)',
    stipend: 'HKD 21,000 / month',
    description: 'Work alongside lead software architects to design high-concurrency microservices, React frontends, and REST API gateways.',
    requiredSkills: ['JavaScript/TypeScript', 'React', 'Database Systems', 'Software Engineering'],
    prerequisiteCourseCodes: ['COMP3211', 'COMP2411'],
    type: 'Internship',
    logoBadge: '💻 TechScale'
  },
  {
    id: 'wie_02',
    company: 'Aether AI Interactive Labs',
    role: 'Human-Computer Interaction & AI UX Researcher',
    industry: 'AI Products & User Experience',
    location: 'Cyberport Innovation Center',
    duration: '6 Months (Full-Time)',
    stipend: 'HKD 20,500 / month',
    description: 'Build interactive prototypes for AI co-pilot tools, evaluate user cognitive load, and run usability benchmarking tests.',
    requiredSkills: ['HCI', 'User Research', 'Prototyping', 'Object-Oriented Programming'],
    prerequisiteCourseCodes: ['COMP3423', 'COMP2021'],
    type: 'Industry Research Attachment',
    logoBadge: '🎨 Aether'
  },
  {
    id: 'wie_03',
    company: 'CyberShield Systems Lab',
    role: 'Systems Programming & Security Analyst Intern',
    industry: 'Cybersecurity & Infrastructure',
    location: 'Kowloon Commerce Centre',
    duration: '6 Months (Full-Time)',
    stipend: 'HKD 22,000 / month',
    description: 'Audit Unix system calls, develop POSIX multithreaded network monitors, and perform vulnerability penetration testing.',
    requiredSkills: ['C Programming', 'Unix POSIX', 'Computer Networking', 'Systems Security'],
    prerequisiteCourseCodes: ['COMP3438', 'COMP3334'],
    type: 'Internship',
    logoBadge: '🛡️ CyberShield'
  }
];

export const MOCK_CAPSTONE_PROJECTS: CapstoneProject[] = [
  {
    id: 'cap_01',
    title: 'AI-Enhanced Interactive Workspace for Real-Time Human-Computer Collaboration',
    supervisor: 'Prof. David Lam (Director, Interactive Systems Laboratory)',
    department: 'Department of Computing',
    description: 'Design and evaluate an intelligent collaborative UI co-pilot that assists developers and designers in real-time context-aware workflows.',
    keyTech: ['Human Computer Interaction', 'TypeScript / React', 'System Architecture', 'AI Integration'],
    prerequisiteCourseCodes: ['COMP3423', 'COMP3211', 'COMP2021'],
    deliverables: 'Interactive web platform, empirical user testing report, and publishable conference paper.',
    difficulty: 'Advanced',
    capacity: '2 Students'
  },
  {
    id: 'cap_02',
    title: 'High-Performance System Kernel Extension for Distributed Database Isolation',
    supervisor: 'Dr. Raymond Lee (Associate Professor)',
    department: 'Department of Computing',
    description: 'Build low-level POSIX multithreaded kernel extensions and memory isolation layers for enterprise database transaction engines.',
    keyTech: ['System Programming', 'Operating Systems', 'C/C++', 'Database Systems'],
    prerequisiteCourseCodes: ['COMP3438', 'COMP2432', 'COMP2411'],
    deliverables: 'Low-level kernel module, benchmark test suite against standard Linux kernel, and technical thesis.',
    difficulty: 'Challenging',
    capacity: '2 Students'
  },
  {
    id: 'cap_03',
    title: 'Privacy-Preserving Multi-Tenant Cloud Architecture with Automated Compliance',
    supervisor: 'Prof. Helen Chen (Director, Security & Cloud Lab)',
    department: 'Department of Computing',
    description: 'Develop an automated compliance monitoring system enforcing data protection regulations (GDPR/PDPO) across distributed microservices.',
    keyTech: ['Computer Systems Security', 'Software Engineering', 'Legal Aspects & Ethics', 'Cloud Architecture'],
    prerequisiteCourseCodes: ['COMP3334', 'COMP3511', 'COMP3211'],
    deliverables: 'Deployed multi-tenant cloud testbed, automated policy checker, and security audit report.',
    difficulty: 'Advanced',
    capacity: '3 Students'
  }
];

export const SAMPLE_ADVISING_QUESTIONS = [
  "What electives should I choose in Year 4 Term 2 to build strong expertise in AI & Systems?",
  "How do my grades in COMP3423 (A) and COMP3211 (B+) position me for HCI & Software Capstone projects?",
  "What prerequisites do I need for COMP4432 Machine Learning and COMP4423 Computer Vision?",
  "How can I balance my credit load while working on my 6-credit COMP4913 Capstone Project?",
  "Which elective subjects from my remaining catalog best match my career goal in Software Engineering & AI?"
];
