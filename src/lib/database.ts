// Complete replacement: clean in-memory DB implementation
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // In production, store a hashed password
  githubUsername?: string;
  experience: "beginner" | "intermediate" | "advanced";
  goals: string[];
  timeCommitment: string; // e.g. "5-10" or "10+"
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
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

// Very small hashing placeholders. Replace with bcrypt in production.
export const hashPassword = async (password: string): Promise<string> => {
  return `hashed_${password}`;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return hashedPassword === `hashed_${password}`;
};

const users: User[] = [];
const projects: Project[] = [
  {
    id: "1",
    title: "Todo App with React",
    description: "Build a modern todo application using React and TypeScript",
    difficulty: "beginner",
    technologies: ["React", "TypeScript", "CSS"],
    estimatedHours: 8,
    category: "Frontend",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "REST API with Node.js",
    description: "Create a RESTful API using Node.js, Express, and MongoDB",
    difficulty: "intermediate",
    technologies: ["Node.js", "Express", "MongoDB"],
    estimatedHours: 16,
    category: "Backend",
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "E-commerce Platform",
    description: "Full-stack e-commerce platform with payment integration",
    difficulty: "advanced",
    technologies: ["Next.js", "PostgreSQL", "Stripe"],
    estimatedHours: 40,
    category: "Full Stack",
    createdAt: new Date(),
  },
];
const sessions: UserSession[] = [];

export const db = {
  users: {
    create: async (
      userData: Omit<User, "id" | "createdAt" | "updatedAt">
    ): Promise<User> => {
      const user: User = {
        ...userData,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(user);
      return user;
    },

    findByEmail: async (email: string): Promise<User | null> => {
      return users.find((u) => u.email === email) || null;
    },

    findById: async (id: string): Promise<User | null> => {
      return users.find((u) => u.id === id) || null;
    },

    update: async (
      id: string,
      updates: Partial<User>
    ): Promise<User | null> => {
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...updates, updatedAt: new Date() };
      return users[idx];
    },
  },

  projects: {
    findAll: async (): Promise<Project[]> => {
      return projects;
    },

    findByDifficulty: async (difficulty: string): Promise<Project[]> => {
      return projects.filter((p) => p.difficulty === difficulty);
    },

    findByTechnology: async (technology: string): Promise<Project[]> => {
      return projects.filter((p) =>
        p.technologies.some((t) =>
          t.toLowerCase().includes(technology.toLowerCase())
        )
      );
    },

    recommend: async (user: User): Promise<Project[]> => {
      // Basic rule-based recommendations
      let recommended = projects.filter((p) => {
        if (user.experience === "beginner") return p.difficulty !== "advanced";
        return true;
      });

      // Time commitment filter (e.g. "5-10" or "10+")
      const parts = user.timeCommitment
        .split("-")
        .map((s) => s.replace("+", ""));
      const min = parseInt(parts[0]) || 0;
      const max = parts[1] ? parseInt(parts[1]) : undefined;

      recommended = recommended.filter((p) => {
        if (!isFinite(p.estimatedHours)) return false;
        if (typeof max === "number")
          return p.estimatedHours >= min && p.estimatedHours <= max;
        return p.estimatedHours >= min;
      });

      return recommended.slice(0, 5);
    },
  },

  sessions: {
    create: async (userId: string): Promise<UserSession> => {
      const session: UserSession = {
        id: Math.random().toString(36).substring(2, 9),
        userId,
        token: Math.random().toString(36).substring(2, 32),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };
      sessions.push(session);
      return session;
    },

    findByToken: async (token: string): Promise<UserSession | null> => {
      const s = sessions.find((x) => x.token === token);
      if (!s || s.expiresAt < new Date()) return null;
      return s;
    },

    delete: async (token: string): Promise<void> => {
      const idx = sessions.findIndex((s) => s.token === token);
      if (idx !== -1) sessions.splice(idx, 1);
    },
  },
};
