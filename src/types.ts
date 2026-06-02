/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type Priority = "urgent" | "high" | "medium" | "low";
export type UserRole = "Team Lead" | "Engineer" | "Designer" | "QA" | "PM";
export type AvatarSize = "sm" | "md" | "lg";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  initials: string;
  color: string;
  timezone: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[];
  statuses: TaskStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  labels: string[];
  dueDate: string | null; // YYYY-MM-DD
  order: number;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  mentions: string[];
  createdAt: string;
  edited: boolean;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  action: string; // e.g. "created task", "moved to In Review", "changed priority", "posted comment"
  timestamp: string;
}

export interface FilterState {
  assignees: string[]; // u-001, etc.
  priorities: Priority[];
  statuses: TaskStatus[];
  search: string;
}
