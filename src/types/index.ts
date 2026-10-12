export type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  projectId?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold';
  contactIds: string[];
  createdAt: string;
};

export type ActionPoint = {
  id: string;
  title: string;
  projectId?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
};

export type PlannerEntry = {
  id: string;
  date: string;
  tasks: string[];
  notes?: string;
};

export type Learning = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  projectId?: string;
  createdAt: string;
};
