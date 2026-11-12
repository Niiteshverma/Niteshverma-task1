// Initial seed data for Round 2: 2 Professors, 6 Students, 4 Courses, Assignments, Groups, and Acknowledgements

export const initialUsers = [
  // 2 Professors
  {
    id: 'prof-1',
    name: 'Dr. Ritesh Verma',
    email: 'ritesh@gmail.com',
    password: 'password123',
    role: 'professor',
  },
  {
    id: 'prof-2',
    name: 'Prof. Anil Rawat',
    email: 'anil@gmail.com',
    password: 'password123',
    role: 'professor',
  },

  // 6 Students
  {
    id: 'student-1',
    name: 'Priya Verma',
    email: 'priya@gmail.com',
    password: 'password123',
    role: 'student',
  },
  {
    id: 'student-2',
    name: 'Ashish',
    email: 'ashish@gmail.com',
    password: 'password123',
    role: 'student',
  },
  {
    id: 'student-3',
    name: 'Rohit Verma',
    email: 'rohit@gmail.com',
    password: 'password123',
    role: 'student',
  },
  {
    id: 'student-4',
    name: 'Divya Patel',
    email: 'student4@demo.com',
    password: 'password123',
    role: 'student',
  },
  {
    id: 'student-5',
    name: 'Sagar',
    email: 'sagar@gmail.com',
    password: 'password123',
    role: 'student',
  },
  {
    id: 'student-6',
    name: 'Manav',
    email: 'manav@gmail.com',
    password: 'password123',
    role: 'student',
  },
]

export const initialCourses = [
  {
    id: 'course-1',
    name: 'Web Architecture & Frontend Systems',
    code: 'CS301',
    professorId: 'prof-1',
    studentIds: ['student-1', 'student-2', 'student-3', 'student-4'],
  },
  {
    id: 'course-2',
    name: 'Algorithms & Advanced Computing',
    code: 'CS401',
    professorId: 'prof-1',
    studentIds: ['student-1', 'student-3', 'student-5', 'student-6'],
  },
  {
    id: 'course-3',
    name: 'Database Engineering & Distributed Stores',
    code: 'CS305',
    professorId: 'prof-2',
    studentIds: ['student-2', 'student-4', 'student-5', 'student-6'],
  },
  {
    id: 'course-4',
    name: 'Cloud Infrastructure & Microservices',
    code: 'CS450',
    professorId: 'prof-2',
    studentIds: ['student-1', 'student-2', 'student-5', 'student-6'],
  },
]

export const initialAssignments = [
  // Course 1 assignments 
  {
    id: 'assign-1',
    courseId: 'course-1',
    title: 'Responsive Portfolio & Design System',
    description: 'Implement a mobile-first personal portfolio following atomic design principles with accessible semantic markup.',
    deadline: '2026-10-25T23:59:00.000Z',
    oneDriveLink: 'https://onedrive.live.com/portfolio-specs',
    submissionType: 'individual',
    createdAt: '2026-10-10T10:00:00.000Z',
  },
  {
    id: 'assign-2',
    courseId: 'course-1',
    title: 'Collaborative Component Library',
    description: 'Design and publish a cohesive set of reusable React UI components including Buttons, Modals, and Form controls.',
    deadline: '2026-11-20T23:59:00.000Z',
    oneDriveLink: 'https://onedrive.live.com/component-library',
    submissionType: 'group',
    createdAt: '2026-10-15T11:00:00.000Z',
  },
  {
    id: 'assign-3',
    courseId: 'course-1',
    title: 'Accessibility (a11y) & ARIA Audit',
    description: 'Audit a web application using screen readers, ensure WCAG 2.1 AA compliance, and document remediation steps.',
    deadline: '2026-11-10T23:59:00.000Z',
    oneDriveLink: 'https://onedrive.live.com/a11y-audit',
    submissionType: 'individual',
    createdAt: '2026-10-20T09:00:00.000Z',
  },

  // Course 2 assignments 
  {
    id: 'assign-4',
    courseId: 'course-2',
    title: 'Dynamic Programming & Memoization Lab',
    description: 'Solve sequence alignment and knapsack variations using top-down memoization and bottom-up tabulation.',
    deadline: '2026-10-28T23:59:00.000Z',
    oneDriveLink: 'https://onedrive.live.com/dp-lab',
    submissionType: 'individual',
    createdAt: '2026-10-12T14:00:00.000Z',
  },
  {
    id: 'assign-5',
    courseId: 'course-2',
    title: 'Distributed Graph Processing Engine',
    description: 'Develop a Pregel-inspired vertex-centric computation model to run PageRank on large synthetic graphs.',
    deadline: '2026-11-28T23:59:00.000Z',
    oneDriveLink: 'https://onedrive.live.com/graph-engine',
    submissionType: 'group',
    createdAt: '2026-10-18T16:00:00.000Z',
  },

  // Course 3 assignments 
  {
    id: 'assign-6',
    courseId: 'course-3',
    title: 'Schema Normalization (3NF & BCNF)',
    description: 'Decompose complex real-world schemas up to Boyce-Codd Normal Form while ensuring dependency preservation.',
    deadline: '2026-10-31T23:59:00.000Z',
    oneDriveLink: 'https://onedrive.live.com/normalization-exercise',
    submissionType: 'group',
    createdAt: '2026-10-15T12:00:00.000Z',
  },
  {
    id: 'assign-7',
    courseId: 'course-3',
    title: 'Query Optimizer Indexing Benchmark',
    description: 'Benchmark B-Tree vs Hash index scan performance across 10 million simulated relational rows.',
    deadline: '2026-11-24T23:59:00.000Z',
    oneDriveLink: 'https://onedrive.live.com/indexing-benchmark',
    submissionType: 'individual',
    createdAt: '2026-10-22T15:00:00.000Z',
  },

  // Course 4 assignments (Prof Turing)
  {
    id: 'assign-8',
    courseId: 'course-4',
    title: 'Raft Consensus Protocol Implementation',
    description: 'Implement leader election and log replication with heartbeats in an asynchronous network simulator.',
    deadline: '2026-12-05T23:59:00.000Z',
    oneDriveLink: 'https://onedrive.live.com/raft-protocol',
    submissionType: 'individual',
    createdAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'assign-9',
    courseId: 'course-4',
    title: 'Kubernetes Microservices Deployment',
    description: 'Construct Helm charts and define horizontal pod autoscalers for a multi-tier microservice architecture.',
    deadline: '2026-12-15T23:59:00.000Z',
    oneDriveLink: 'https://onedrive.live.com/k8s-deployment',
    submissionType: 'group',
    createdAt: '2026-11-02T11:00:00.000Z',
  },
]

export const initialGroups = [
  // Groups for Course 1
  {
    id: 'group-1',
    courseId: 'course-1',
    name: 'Frontend Pioneers',
    leaderId: 'student-1',
    memberIds: ['student-1', 'student-2'],
  },
  {
    id: 'group-2',
    courseId: 'course-1',
    name: 'UI Architects',
    leaderId: 'student-3',
    memberIds: ['student-3', 'student-4'],
  },

  // Group for Course 3
  {
    id: 'group-3',
    courseId: 'course-3',
    name: 'Data Sharding Titans',
    leaderId: 'student-5',
    memberIds: ['student-5', 'student-6'],
  },
]

export const initialAcknowledgements = [
  // Individual acknowledgement on assign-1 
  {
    id: 'ack-1',
    assignmentId: 'assign-1',
    studentId: 'student-1',
    groupId: null,
    acknowledgedBy: 'student-1',
    acknowledgedAt: '2026-10-22T14:30:00.000Z',
  },

  // Group acknowledgement on assign-6 for group-3
  {
    id: 'ack-2',
    assignmentId: 'assign-6',
    studentId: null,
    groupId: 'group-3',
    acknowledgedBy: 'student-5',
    acknowledgedAt: '2026-10-29T18:20:00.000Z',
  },
]
