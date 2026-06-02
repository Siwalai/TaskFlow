/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Project, Task, Comment, ActivityLog } from "../types";

// Initial mock data from the PRD
const INITIAL_USERS: User[] = [
  {
    id: "u-001",
    name: "Aria Chen",
    email: "aria@taskflow.io",
    role: "Team Lead",
    avatarUrl: null,
    initials: "AC",
    color: "#2563EB", // Primary Blue
    timezone: "Asia/Bangkok",
  },
  {
    id: "u-002",
    name: "Marcus Webb",
    email: "marcus@taskflow.io",
    role: "Engineer",
    avatarUrl: null, // PRD says "/avatars/marcus.jpg" but using null / initials is safer and consistently displays beautiful initials
    initials: "MW",
    color: "#7C3AED", // Indigo
    timezone: "Europe/London",
  },
  {
    id: "u-003",
    name: "Priya Nair",
    email: "priya@taskflow.io",
    role: "Designer",
    avatarUrl: null,
    initials: "PN",
    color: "#0891B2", // Cyan/Teal
    timezone: "Asia/Kolkata",
  },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p-001",
    name: "Website Redesign",
    description: "Revamp the marketing site for Q3 launch",
    color: "#2563EB",
    memberIds: ["u-001", "u-002", "u-003"],
    statuses: ["todo", "in_progress", "review", "done"],
    createdAt: "2026-04-10T09:00:00Z",
    updatedAt: "2026-05-28T14:22:00Z",
  },
  {
    id: "p-002",
    name: "Mobile App v2",
    description: "Feature parity with web app + offline support",
    color: "#7C3AED",
    memberIds: ["u-001", "u-002"],
    statuses: ["todo", "in_progress", "review", "done"],
    createdAt: "2026-05-01T08:00:00Z",
    updatedAt: "2026-05-30T10:00:00Z",
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "t-001",
    projectId: "p-001",
    title: "Design new homepage hero section",
    description: "Create 3 Figma variants for review by Friday",
    status: "in_progress",
    priority: "high",
    assigneeId: "u-003",
    labels: ["design", "frontend"],
    dueDate: "2026-06-06",
    order: 0,
    commentCount: 2,
    createdAt: "2026-05-20T10:00:00Z",
  },
  {
    id: "t-002",
    projectId: "p-001",
    title: "Set up CI/CD pipeline for staging",
    description: "Establish GitHub Actions workflows and configure continuous deployment to Cloud Run containers.",
    status: "todo",
    priority: "urgent",
    assigneeId: "u-002",
    labels: ["infra"],
    dueDate: "2026-06-03", // Very close, will flag as urgent or warning
    order: 0,
    commentCount: 1,
    createdAt: "2026-05-22T08:30:00Z",
  },
  {
    id: "t-003",
    projectId: "p-001",
    title: "Write copy for About Us page",
    description: "Tone: warm, professional. Max 300 words.",
    status: "todo",
    priority: "medium",
    assigneeId: "u-001",
    labels: ["content"],
    dueDate: "2026-06-10",
    order: 1,
    commentCount: 0,
    createdAt: "2026-05-23T11:00:00Z",
  },
  {
    id: "t-004",
    projectId: "p-001",
    title: "Accessibility audit on nav components",
    description: "Audit standard navigation wrappers, focus states, and aria roles for absolute compliance.",
    status: "review",
    priority: "high",
    assigneeId: "u-003",
    labels: ["a11y", "frontend"],
    dueDate: "2026-06-04",
    order: 0,
    commentCount: 0,
    createdAt: "2026-05-24T09:00:00Z",
  },
  {
    id: "t-005",
    projectId: "p-001",
    title: "Update favicon and social preview images",
    description: "Generate appropriate social tags and custom favicon.ico for proper rendering.",
    status: "done",
    priority: "low",
    assigneeId: "u-003",
    labels: ["design"],
    dueDate: "2026-05-30",
    order: 0,
    commentCount: 0,
    createdAt: "2026-05-25T14:00:00Z",
  },
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "c-001",
    taskId: "t-001",
    authorId: "u-002",
    body: "@Aria Chen can we push this to EOD Monday instead?",
    mentions: ["u-001"],
    createdAt: "2026-05-29T16:45:00Z",
    edited: false,
  },
  {
    id: "c-002",
    taskId: "t-001",
    authorId: "u-001",
    body: "Sure, that works. I'm excited about this design! I'll share the Figma link by then.",
    mentions: [],
    createdAt: "2026-05-29T17:02:00Z",
    edited: false,
  },
  {
    id: "c-003",
    taskId: "t-002",
    authorId: "u-001",
    body: "This blocks the staging deploy — marking as urgent.",
    mentions: ["u-002"],
    createdAt: "2026-05-30T09:15:00Z",
    edited: false,
  },
];

const INITIAL_ACTIVITY: ActivityLog[] = [
  {
    id: "act-001",
    taskId: "t-001",
    projectId: "p-001",
    userId: "u-003",
    action: "created task",
    timestamp: "2026-05-20T10:00:00Z",
  },
  {
    id: "act-002",
    taskId: "t-002",
    projectId: "p-001",
    userId: "u-002",
    action: "created task",
    timestamp: "2026-05-22T08:30:00Z",
  },
  {
    id: "act-003",
    taskId: "t-002",
    projectId: "p-001",
    userId: "u-001",
    action: "changed priority to urgent",
    timestamp: "2026-05-30T09:15:00Z",
  },
  {
    id: "act-004",
    taskId: "t-005",
    projectId: "p-001",
    userId: "u-003",
    action: "moved to done",
    timestamp: "2026-05-30T12:00:00Z",
  },
];

// LocalStorage helpers to allow dynamic modifications
function isStored(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

function getStoredJSON<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item) as T;
  } catch (e) {
    return defaultValue;
  }
}

function setStoredJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Global accessor functions
export const getStoredUsers = (): User[] => getStoredJSON("tf_users", INITIAL_USERS);
export const saveStoredUsers = (users: User[]): void => setStoredJSON("tf_users", users);

export const getStoredProjects = (): Project[] => getStoredJSON("tf_projects", INITIAL_PROJECTS);
export const saveStoredProjects = (projects: Project[]): void => setStoredJSON("tf_projects", projects);

export const getStoredTasks = (): Task[] => getStoredJSON("tf_tasks", INITIAL_TASKS);
export const saveStoredTasks = (tasks: Task[]): void => setStoredJSON("tf_tasks", tasks);

export const getStoredComments = (): Comment[] => getStoredJSON("tf_comments", INITIAL_COMMENTS);
export const saveStoredComments = (comments: Comment[]): void => setStoredJSON("tf_comments", comments);

export const getStoredActivity = (): ActivityLog[] => getStoredJSON("tf_activity", INITIAL_ACTIVITY);
export const saveStoredActivity = (activity: ActivityLog[]): void => setStoredJSON("tf_activity", activity);

// Current user is always Aria Chen (u-001) for this UI demo, configurable in Settings page!
export const getStoredCurrentUser = (): User => {
  const users = getStoredUsers();
  const currentId = localStorage.getItem("tf_current_user_id") || "u-001";
  return users.find((u) => u.id === currentId) || users[0] || INITIAL_USERS[0];
};

export const setCurrentUser = (userId: string): void => {
  localStorage.setItem("tf_current_user_id", userId);
};

// Activity logger helper
export const logActivity = (taskId: string, projectId: string, userId: string, action: string): void => {
  const currentLogs = getStoredActivity();
  const newLog: ActivityLog = {
    id: `act-${Date.now()}`,
    taskId,
    projectId,
    userId,
    action,
    timestamp: new Date().toISOString(),
  };
  saveStoredActivity([newLog, ...currentLogs].slice(0, 50)); // Keep last 50 activities
};
