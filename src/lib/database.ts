// Simple in-memory database for demo purposes
// In production, you would use a real database like PostgreSQL, MongoDB, etc.

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // In production, this would be hashed
  githubUsername?: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  timeCommitment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  estimatedHours: number;
  category: string;
  githubUrl?: string;
  createdAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// In-memory storage (replace with real database in production)
const users: User[] = [];
const projects: Project[] = [
  {
    id: '1',
    title: 'Todo App with React',
    description: 'Build a modern todo application using React and TypeScript',
    difficulty: 'beginner',
    technologies: ['React', 'TypeScript', 'CSS'],
    estimatedHours: 8,
    category: 'Frontend',
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'REST API with Node.js',
    description: 'Create a RESTful API using Node.js, Express, and MongoDB',
    difficulty: 'intermediate',
    technologies: ['Node.js', 'Express', 'MongoDB'],
    estimatedHours: 16,
    category: 'Backend',
    createdAt: new Date()
  },
  {
    id: '3',
    title: 'E-commerce Platform',
    description: 'Full-stack e-commerce platform with payment integration',
    difficulty: 'advanced',
    technologies: ['Next.js', 'PostgreSQL', 'Stripe'],
    estimatedHours: 40,
    category: 'Full Stack',
    createdAt: new Date()
  }
];
const sessions: UserSession[] = [];

// Database operations
export const db = {
  users: {
    create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
      const user: User = {
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.push(user);
      return user;
    },

    findByEmail: async (email: string): Promise<User | null> => {
      return users.find(user => user.email === email) || null;
    },

    findById: async (id: string): Promise<User | null> => {
      return users.find(user => user.id === id) || null;
    },

    update: async (id: string, updates: Partial<User>): Promise<User | null> => {
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) return null;
      
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date()
      };
      return users[userIndex];
    }
  },

  projects: {
    findAll: async (): Promise<Project[]> => {
      return projects;
    },

    findByDifficulty: async (difficulty: string): Promise<Project[]> => {
      return projects.filter(project => project.difficulty === difficulty);
    },

    findByTechnology: async (technology: string): Promise<Project[]> => {
      return projects.filter(project => 
        project.technologies.some(tech => 
          tech.toLowerCase().includes(technology.toLowerCase())
        )
      );
    },

    recommend: async (user: User): Promise<Project[]> => {
      // Simple recommendation logic based on user experience and goals
      let recommendedProjects = projects.filter(project => {
        // Match difficulty level
        if (user.experience === 'beginner' && project.difficulty !== 'advanced') {
          return true;
        }
        if (user.experience === 'intermediate') {
          return true;
        }
        if (user.experience === 'advanced') {
          return true;
        }
        return false;
      });

      // Filter by time commitment
      const [minHours, maxHours] = user.timeCommitment.split('-').map(h => parseInt(h.replace('+', '')));
      recommendedProjects = recommendedProjects.filter(project => {
        if (maxHours) {
          return project.estimatedHours >= minHours && project.estimatedHours <= maxHours;
        }
        return project.estimatedHours >= minHours;
      });

      return recommendedProjects.slice(0, 5); // Return top 5 recommendations
    }
  },

  sessions: {
    create: async (userId: string): Promise<UserSession> => {
      const session: UserSession = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        token: Math.random().toString(36).substr(2, 32),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdAt: new Date()
      };
      sessions.push(session);
      return session;
    },

    findByToken: async (token: string): Promise<UserSession | null> => {
      const session = sessions.find(s => s.token === token);
      if (!session || session.expiresAt < new Date()) {
        return null;
      }
      return session;
    },

    delete: async (token: string): Promise<void> => {
      const index = sessions.findIndex(s => s.token === token);
      if (index !== -1) {
        sessions.splice(index, 1);
      }
    }
  }
};

// Utility functions
export const hashPassword = async (password: string): Promise<string> => {
  // In production, use bcrypt or similar
  return `hashed_${password}`;
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  // In production, use bcrypt compare
  return hashedPassword === `hashed_${password}`;
};
