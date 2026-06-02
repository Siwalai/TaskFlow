/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Project, Task, Comment, ActivityLog, Priority, TaskStatus, UserRole } from "../types";
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredProjects,
  saveStoredProjects,
  getStoredTasks,
  saveStoredTasks,
  getStoredComments,
  saveStoredComments,
  getStoredActivity,
  saveStoredActivity,
  getStoredCurrentUser,
  logActivity,
} from "../data/mockData";

interface TaskFlowContextType {
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  activity: ActivityLog[];
  currentUser: User;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Crucial Task Methods
  createTask: (taskData: {
    title: string;
    description: string | null;
    projectId: string;
    assigneeId: string | null;
    priority: Priority;
    dueDate: string | null;
    labels: string[];
    status: TaskStatus;
  }) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;

  // Project Methods
  createProject: (name: string, description: string, color: string) => boolean;
  updateProjectMembers: (projectId: string, memberIds: string[]) => void;

  // Team / User Methods
  addTeamMember: (memberData: { name: string; email: string; role: UserRole; timezone: string; color: string }) => void;

  // Comment Methods
  addComment: (taskId: string, body: string, mentions: string[]) => void;
  deleteComment: (commentId: string) => void;

  // Settings Methods
  updateProfile: (name: string, role: string, timezone: string, color: string) => void;
  switchUser: (userId: string) => void;

  // Theme settings
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const TaskFlowContext = createContext<TaskFlowContextType | undefined>(undefined);

export const useTaskFlow = () => {
  const context = useContext(TaskFlowContext);
  if (!context) {
    throw new Error("useTaskFlow must be used within a TaskFlowProvider");
  }
  return context;
};

export const TaskFlowProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [currentUser, setLocalCurrentUser] = useState<User>({} as User);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("tf_theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("tf_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Initialize data on mount
  useEffect(() => {
    setUsers(getStoredUsers());
    setProjects(getStoredProjects());
    setTasks(getStoredTasks());
    setComments(getStoredComments());
    setActivity(getStoredActivity());
    setLocalCurrentUser(getStoredCurrentUser());
  }, []);

  // Update localStorage when local state changes
  const updateUsersState = (newUsers: User[]) => {
    setUsers(newUsers);
    saveStoredUsers(newUsers);
  };

  const updateProjectsState = (newProjects: Project[]) => {
    setProjects(newProjects);
    saveStoredProjects(newProjects);
  };

  const updateTasksState = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveStoredTasks(newTasks);
  };

  const updateCommentsState = (newComments: Comment[]) => {
    setComments(newComments);
    saveStoredComments(newComments);
  };

  const syncActivityState = () => {
    setActivity(getStoredActivity());
  };

  // Create Task Flow (with simulated 800ms loading shimmer and full error resilience)
  const createTask = async (taskData: {
    title: string;
    description: string | null;
    projectId: string;
    assigneeId: string | null;
    priority: Priority;
    dueDate: string | null;
    labels: string[];
    status: TaskStatus;
  }): Promise<boolean> => {
    // Generate new client UUID
    const newId = `t-${Date.now()}`;
    const newTask: Task = {
      id: newId,
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      assigneeId: taskData.assigneeId,
      labels: taskData.labels,
      dueDate: taskData.dueDate,
      order: tasks.filter((t) => t.projectId === taskData.projectId && t.status === taskData.status).length,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Simulate network latency as specified for visual shimmers
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextTasks = [...tasks, newTask];
        updateTasksState(nextTasks);
        logActivity(newId, taskData.projectId, currentUser.id, "created task");
        syncActivityState();
        resolve(true);
      }, 500); // 500ms shimmer effect
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const next = { ...t, ...updates };
        // Log individual field changes beautifully
        if (updates.priority && updates.priority !== t.priority) {
          logActivity(taskId, t.projectId, currentUser.id, `changed priority to ${updates.priority}`);
        }
        if (updates.title && updates.title !== t.title) {
          logActivity(taskId, t.projectId, currentUser.id, "renamed task");
        }
        if (updates.assigneeId !== undefined && updates.assigneeId !== t.assigneeId) {
          const newAssignee = users.find((u) => u.id === updates.assigneeId);
          const name = newAssignee ? newAssignee.name : "unassigned";
          logActivity(taskId, t.projectId, currentUser.id, `assigned task to ${name}`);
        }
        return next;
      }
      return t;
    });
    updateTasksState(updatedTasks);
    syncActivityState();
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (!taskToDelete) return;
    const remainingTasks = tasks.filter((t) => t.id !== taskId);
    updateTasksState(remainingTasks);
    logActivity(taskId, taskToDelete.projectId, currentUser.id, "deleted task");
    syncActivityState();
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;
    if (targetTask.status === newStatus) return;

    const formattedStatusLabel = newStatus.replace("_", " ");
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    });

    updateTasksState(updatedTasks);
    logActivity(taskId, targetTask.projectId, currentUser.id, `moved to ${formattedStatusLabel}`);
    syncActivityState();
  };

  const createProject = (name: string, description: string, color: string): boolean => {
    // Check uniqueness
    const exists = projects.some((p) => p.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (exists) {
      return false; // Violates client validation constraint
    }

    const newProj: Project = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      color,
      memberIds: [currentUser.id],
      statuses: ["todo", "in_progress", "review", "done"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateProjectsState([...projects, newProj]);
    return true;
  };

  const updateProjectMembers = (projectId: string, memberIds: string[]) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          memberIds,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    updateProjectsState(updatedProjects);
    logActivity("", projectId, currentUser.id, "updated project members");
    syncActivityState();
  };

  const addTeamMember = (memberData: { name: string; email: string; role: UserRole; timezone: string; color: string }) => {
    const nextId = `u-${Date.now()}`;
    const initials = memberData.name
      .split(" ")
      .map((n) => n ? n[0] : "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

    const newUser: User = {
      id: nextId,
      name: memberData.name.trim(),
      email: memberData.email.trim(),
      role: memberData.role,
      avatarUrl: null,
      initials,
      color: memberData.color,
      timezone: memberData.timezone,
    };

    const nextUsers = [...users, newUser];
    updateUsersState(nextUsers);
    
    logActivity("", "", currentUser.id, `added team member ${memberData.name}`);
    syncActivityState();
  };

  const addComment = (taskId: string, body: string, mentions: string[]) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      taskId,
      authorId: currentUser.id,
      body,
      mentions,
      createdAt: new Date().toISOString(),
      edited: false,
    };

    const nextComments = [...comments, newComment];
    updateCommentsState(nextComments);

    // Update comment counter in task
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, commentCount: t.commentCount + 1 };
      }
      return t;
    });
    updateTasksState(updatedTasks);

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      logActivity(taskId, task.projectId, currentUser.id, "posted comment");
      syncActivityState();
    }
  };

  const deleteComment = (commentId: string) => {
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;

    const remaining = comments.filter((c) => c.id !== commentId);
    updateCommentsState(remaining);

    // Decrement comment counter
    const updatedTasks = tasks.map((t) => {
      if (t.id === target.taskId) {
        return { ...t, commentCount: Math.max(0, t.commentCount - 1) };
      }
      return t;
    });
    updateTasksState(updatedTasks);
  };

  const updateProfile = (name: string, role: string, timezone: string, color: string) => {
    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "U";
        return { ...u, name, role: role as any, timezone, color, initials };
      }
      return u;
    });

    updateUsersState(updatedUsers);
    const updatedSelf = updatedUsers.find((u) => u.id === currentUser.id);
    if (updatedSelf) {
      setLocalCurrentUser(updatedSelf);
    }
  };

  const switchUser = (userId: string) => {
    localStorage.setItem("tf_current_user_id", userId);
    const usersList = getStoredUsers();
    const newUser = usersList.find((u) => u.id === userId) || usersList[0];
    setLocalCurrentUser(newUser);
  };

  return (
    <TaskFlowContext.Provider
      value={{
        users,
        projects,
        tasks,
        comments,
        activity,
        currentUser,
        activeTaskId,
        setActiveTaskId,
        isSearchOpen,
        setIsSearchOpen,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        createProject,
        updateProjectMembers,
        addTeamMember,
        addComment,
        deleteComment,
        updateProfile,
        switchUser,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </TaskFlowContext.Provider>
  );
};
