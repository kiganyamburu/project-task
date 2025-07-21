// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  githubUsername?: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  timeCommitment: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    experience: string;
    goals: string[];
  };
  token: string;
}

// Project types
export interface ProjectRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  technologies: string[];
  estimatedHours: number;
  category: string;
  matchScore?: number;
  reasons?: string[];
}

// User profile types
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  githubUsername?: string;
  experience: string;
  goals: string[];
  timeCommitment: string;
  createdAt: string;
}

// GitHub integration types
export interface GitHubProfile {
  username: string;
  publicRepos: number;
  followers: number;
  following: number;
  languages: string[];
  recentActivity: {
    commits: number;
    repositories: string[];
  };
}
