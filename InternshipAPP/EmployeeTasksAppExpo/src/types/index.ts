export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  assigned_to?: number;
  title: string;
  description?: string;
  status: 'in_progress' | 'future' | 'completed';
  progress: number;
  created_at: string;
  updated_at: string;
  user?: User;
  assignedTo?: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  errors?: Record<string, string[]>;
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  data?: Task | Task[];
  errors?: Record<string, string[]>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'admin' | 'manager' | 'employee';
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'in_progress' | 'future' | 'completed';
  progress?: number;
  assigned_to?: number;
}

export interface AssignTaskData {
  title: string;
  description?: string;
  assigned_to: number;
  status?: 'in_progress' | 'future' | 'completed';
  progress?: number;
}

export interface Chat {
  id: number;
  user_id: number;
  message: string;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface CreateChatData {
  message: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'in_progress' | 'future' | 'completed';
  progress?: number;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  TaskForm: { task?: Task };
  TaskDetail: { taskId: number };
  AssignTask: undefined;
  NoteForm: { note?: Note };
};

export type MainTabParamList = {
  Team: undefined;
  TaskList: undefined;
  Notes: undefined;
  Chat: undefined;
  Profile: undefined;
};