import { firestore } from "./firestore";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { handleFirestoreOperation } from "./firestoreErrors";

// Lightweight Firestore-backed DB adapter matching the shape used in the app.
// Uses ISO strings for date storage and converts back to Date objects on reads.

// Type exports to match database.ts interface
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Hashed password
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

// Firestore document types (with ISO string dates for storage)
interface UserDocument {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  githubUsername?: string;
  experience: "beginner" | "intermediate" | "advanced";
  goals: string[];
  timeCommitment: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

interface ProjectDocument {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  technologies: string[];
  estimatedHours: number;
  category: string;
  githubUrl?: string;
  createdAt: string; // ISO string
}

interface UserSessionDocument {
  id: string;
  userId: string;
  token: string;
  expiresAt: string; // ISO string
  createdAt: string; // ISO string
}

export const db = {
  users: {
    create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
      return handleFirestoreOperation(async () => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const data: UserDocument = { ...userData, id, createdAt: now, updatedAt: now };
        await firestore.collection("users").doc(id).set(data);
        return {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        };
      }, 'users.create');
    },

    findByEmail: async (email: string): Promise<User | null> => {
      return handleFirestoreOperation(async () => {
        const q = await firestore
          .collection("users")
          .where("email", "==", email)
          .limit(1)
          .get();
        if (q.empty) return null;
        const doc = q.docs[0].data() as UserDocument;
        return {
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        };
      }, 'users.findByEmail');
    },

    findById: async (id: string): Promise<User | null> => {
      return handleFirestoreOperation(async () => {
        const snap = await firestore.collection("users").doc(id).get();
        if (!snap.exists) return null;
        const doc = snap.data() as UserDocument;
        return {
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        };
      }, 'users.findById');
    },

    update: async (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> => {
      return handleFirestoreOperation(async () => {
        const updateData: Partial<UserDocument> = {
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await firestore.collection("users").doc(id).set(updateData, { merge: true });
        const snap = await firestore.collection("users").doc(id).get();
        if (!snap.exists) return null;
        const doc = snap.data() as UserDocument;
        return {
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        };
      }, 'users.update');
    },
  },

  projects: {
    findAll: async (): Promise<Project[]> => {
      return handleFirestoreOperation(async () => {
        const q = await firestore
          .collection("projects")
          .orderBy("createdAt", "desc")
          .get();
        return q.docs.map((d) => {
          const data = d.data() as ProjectDocument;
          return { ...data, createdAt: new Date(data.createdAt) };
        });
      }, 'projects.findAll');
    },

    findByDifficulty: async (difficulty: string): Promise<Project[]> => {
      return handleFirestoreOperation(async () => {
        const q = await firestore
          .collection("projects")
          .where("difficulty", "==", difficulty)
          .get();
        return q.docs.map((d) => {
          const data = d.data() as ProjectDocument;
          return {
            ...data,
            createdAt: new Date(data.createdAt),
          };
        });
      }, 'projects.findByDifficulty');
    },

    findByTechnology: async (technology: string): Promise<Project[]> => {
      return handleFirestoreOperation(async () => {
        const q = await firestore.collection("projects").get();
        return q.docs
          .map((d) => d.data() as ProjectDocument)
          .filter(
            (p) =>
              p.technologies &&
              p.technologies.some((t: string) =>
                t.toLowerCase().includes(technology.toLowerCase())
              )
          )
          .map((p) => ({ ...p, createdAt: new Date(p.createdAt) }));
      }, 'projects.findByTechnology');
    },

    recommend: async (user: User): Promise<Project[]> => {
      // Implement same simple recommendation logic as the in-memory adapter.
      // This wraps the findAll call with error handling
      return handleFirestoreOperation(async () => {
        let recommendedProjects = await db.projects.findAll();
        recommendedProjects = recommendedProjects.filter((project: Project) => {
          if (user.experience === "beginner" && project.difficulty !== "advanced")
            return true;
          if (user.experience === "intermediate") return true;
          if (user.experience === "advanced") return true;
          return false;
        });

        const [minHours, maxHours] = (user.timeCommitment || "0+")
          .split("-")
          .map((h: string) => parseInt(h.replace("+", "")) || 0);
        recommendedProjects = recommendedProjects.filter((project: Project) => {
          if (Number.isFinite(maxHours) && maxHours > 0) {
            return (
              project.estimatedHours >= minHours &&
              project.estimatedHours <= maxHours
            );
          }
          return project.estimatedHours >= minHours;
        });

        return recommendedProjects.slice(0, 5);
      }, 'projects.recommend');
    },
  },

  sessions: {
    create: async (userId: string): Promise<UserSession> => {
      return handleFirestoreOperation(async () => {
        const id = uuidv4();
        const token = uuidv4();
        const now = new Date().toISOString();
        const expiresAt = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();
        const session: UserSessionDocument = { id, userId, token, expiresAt, createdAt: now };
        await firestore.collection("sessions").doc(id).set(session);
        return {
          ...session,
          expiresAt: new Date(session.expiresAt),
          createdAt: new Date(session.createdAt),
        };
      }, 'sessions.create');
    },

    findByToken: async (token: string): Promise<UserSession | null> => {
      return handleFirestoreOperation(async () => {
        const q = await firestore
          .collection("sessions")
          .where("token", "==", token)
          .limit(1)
          .get();
        if (q.empty) return null;
        const doc = q.docs[0].data() as UserSessionDocument;
        if (new Date(doc.expiresAt) < new Date()) return null;
        return {
          ...doc,
          expiresAt: new Date(doc.expiresAt),
          createdAt: new Date(doc.createdAt),
        };
      }, 'sessions.findByToken');
    },

    delete: async (token: string): Promise<void> => {
      return handleFirestoreOperation(async () => {
        const q = await firestore
          .collection("sessions")
          .where("token", "==", token)
          .limit(1)
          .get();
        if (q.empty) return;
        await q.docs[0].ref.delete();
      }, 'sessions.delete');
    },
  },
};

// Secure password hashing using bcryptjs
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
