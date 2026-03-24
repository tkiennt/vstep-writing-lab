// Define simple role types
export type Role = 'guest' | 'user' | 'teacher' | 'admin';

export interface RouteConfig {
  path: string;
  roles: Role[];
}

export const APP_ROUTES: RouteConfig[] = [
  // Public
  { path: '/', roles: ['guest', 'user', 'teacher', 'admin'] },
  { path: '/login', roles: ['guest'] },
  { path: '/practice-list', roles: ['guest', 'user', 'teacher', 'admin'] },

  // Private (User)
  { path: '/dashboard', roles: ['user', 'teacher', 'admin'] },
  { path: '/writing-editor', roles: ['user', 'teacher', 'admin'] }, // expects /:id
  { path: '/results', roles: ['user', 'teacher', 'admin'] }, // expects /:id

  // Management (Teacher)
  { path: '/teacher/topics', roles: ['teacher', 'admin'] },
  { path: '/teacher/resources', roles: ['teacher', 'admin'] },
  { path: '/teacher/system-prompt', roles: ['teacher', 'admin'] },

  // System (Admin)
  { path: '/admin/dashboard', roles: ['admin'] },
  { path: '/admin/user-management', roles: ['admin'] },
  { path: '/admin/ai-import', roles: ['admin'] },
];
