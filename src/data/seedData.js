// Initial seed users: 2 Admins and 5 Students
export const initialUsers = [
  { id: 'admin-1', name: 'Dr. Sarah Jenkins', role: 'admin' },
  { id: 'admin-2', name: 'Prof. Alan Turing', role: 'admin' },
  { id: 'student-1', name: 'Alex Johnson', role: 'student' },
  { id: 'student-2', name: 'Beatriz Morales', role: 'student' },
  { id: 'student-3', name: 'Charlie Chen', role: 'student' },
  { id: 'student-4', name: 'Divya Patel', role: 'student' },
  { id: 'student-5', name: 'Ethan Wright', role: 'student' },
]

// 8 assignments with a mix of past and future dates, assigned to all or selected students
export const initialAssignments = [
  {
    id: 'assign-1',
    title: 'CS101: Introduction to Algorithms',
    description: 'Implement binary search and bubble sort in JavaScript. Write test cases for edge cases.',
    dueDate: '2026-10-15',
    driveLink: 'https://drive.google.com/drive/folders/cs101-algo',
    createdBy: 'admin-1',
    assignedTo: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'],
  },
  {
    id: 'assign-2',
    title: 'Web Dev: Responsive Portfolio',
    description: 'Build a mobile-first personal portfolio website using semantic HTML and Tailwind CSS.',
    dueDate: '2026-10-25',
    driveLink: 'https://drive.google.com/drive/folders/web-portfolio',
    createdBy: 'admin-1',
    assignedTo: ['student-1', 'student-2', 'student-3'],
  },
  {
    id: 'assign-3',
    title: 'Database: Normalization Exercise',
    description: 'Normalize an unnormalized school registration schema up to Third Normal Form (3NF).',
    dueDate: '2026-11-10',
    driveLink: 'https://drive.google.com/drive/folders/db-normalization',
    createdBy: 'admin-1',
    assignedTo: ['student-1', 'student-3', 'student-5'],
  },
  {
    id: 'assign-4',
    title: 'React Fundamentals: Todo App',
    description: 'Create a state-managed Todo list with add, remove, and filter operations in React.',
    dueDate: '2026-11-28',
    driveLink: 'https://drive.google.com/drive/folders/react-todo',
    createdBy: 'admin-1',
    assignedTo: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'],
  },
  {
    id: 'assign-5',
    title: 'Theory of Computation: Finite Automata',
    description: 'Design DFA and NFA for language recognition over {0,1} accepting strings ending in 01.',
    dueDate: '2026-10-20',
    driveLink: 'https://drive.google.com/drive/folders/theory-dfa',
    createdBy: 'admin-2',
    assignedTo: ['student-1', 'student-2', 'student-4'],
  },
  {
    id: 'assign-6',
    title: 'Operating Systems: Process Scheduling',
    description: 'Simulate First-Come-First-Served (FCFS) and Shortest Job First (SJF) scheduling policies.',
    dueDate: '2026-11-18',
    driveLink: 'https://drive.google.com/drive/folders/os-scheduling',
    createdBy: 'admin-2',
    assignedTo: ['student-2', 'student-4', 'student-5'],
  },
  {
    id: 'assign-7',
    title: 'Computer Networks: Packet Sniffer Analysis',
    description: 'Analyze HTTP vs HTTPS traffic captured using Wireshark and answer the questionnaire.',
    dueDate: '2026-12-05',
    driveLink: 'https://drive.google.com/drive/folders/networks-wireshark',
    createdBy: 'admin-2',
    assignedTo: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'],
  },
  {
    id: 'assign-8',
    title: 'AI Ethics: Case Study Essay',
    description: 'Submit a 2-page essay discussing bias mitigation techniques in LLMs and AI hiring tools.',
    dueDate: '2026-12-15',
    driveLink: 'https://drive.google.com/drive/folders/ai-ethics-essay',
    createdBy: 'admin-2',
    assignedTo: ['student-3', 'student-5'],
  },
]

// Pre-filled submissions for existing assignments
export const initialSubmissions = [
  {
    assignmentId: 'assign-1',
    studentId: 'student-1',
    status: 'Submitted',
    submittedAt: '2026-10-14T10:15:00.000Z',
  },
  {
    assignmentId: 'assign-1',
    studentId: 'student-2',
    status: 'Submitted',
    submittedAt: '2026-10-14T16:20:00.000Z',
  },
  {
    assignmentId: 'assign-1',
    studentId: 'student-3',
    status: 'Submitted',
    submittedAt: '2026-10-15T09:00:00.000Z',
  },
  {
    assignmentId: 'assign-2',
    studentId: 'student-1',
    status: 'Submitted',
    submittedAt: '2026-10-24T18:45:00.000Z',
  },
  {
    assignmentId: 'assign-5',
    studentId: 'student-2',
    status: 'Submitted',
    submittedAt: '2026-10-19T11:30:00.000Z',
  },
]

