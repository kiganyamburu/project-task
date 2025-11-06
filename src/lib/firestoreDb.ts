import { firestore } from "./firestore";
import { v4 as uuidv4 } from "uuid";

// Lightweight Firestore-backed DB adapter matching the shape used in the app.
// Uses ISO strings for date storage and converts back to Date objects on reads.

export const db = {
  users: {
    create: async (userData: any) => {
      const id = uuidv4();
      const now = new Date().toISOString();
      const data = { ...userData, id, createdAt: now, updatedAt: now };
      await firestore.collection("users").doc(id).set(data);
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    },

    findByEmail: async (email: string) => {
      const q = await firestore
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();
      if (q.empty) return null;
      const doc = q.docs[0].data();
      return {
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      };
    },

    findById: async (id: string) => {
      const snap = await firestore.collection("users").doc(id).get();
      if (!snap.exists) return null;
      const doc = snap.data() as any;
      return {
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      };
    },

    update: async (id: string, updates: Partial<any>) => {
      updates.updatedAt = new Date().toISOString();
      await firestore.collection("users").doc(id).set(updates, { merge: true });
      const snap = await firestore.collection("users").doc(id).get();
      const doc = snap.data() as any;
      return {
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      };
    },
  },

  projects: {
    findAll: async () => {
      const q = await firestore
        .collection("projects")
        .orderBy("createdAt", "desc")
        .get();
      return q.docs.map((d) => {
        const data = d.data() as any;
        return { ...data, createdAt: new Date(data.createdAt) };
      });
    },

    findByDifficulty: async (difficulty: string) => {
      const q = await firestore
        .collection("projects")
        .where("difficulty", "==", difficulty)
        .get();
      return q.docs.map((d) => ({
        ...d.data(),
        createdAt: new Date((d.data() as any).createdAt),
      }));
    },

    findByTechnology: async (technology: string) => {
      const q = await firestore.collection("projects").get();
      return q.docs
        .map((d) => d.data() as any)
        .filter(
          (p) =>
            p.technologies &&
            p.technologies.some((t: string) =>
              t.toLowerCase().includes(technology.toLowerCase())
            )
        )
        .map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) }));
    },

    recommend: async (user: any) => {
      // Implement same simple recommendation logic as the in-memory adapter.
      let recommendedProjects = await db.projects.findAll();
      recommendedProjects = recommendedProjects.filter((project: any) => {
        if (user.experience === "beginner" && project.difficulty !== "advanced")
          return true;
        if (user.experience === "intermediate") return true;
        if (user.experience === "advanced") return true;
        return false;
      });

      const [minHours, maxHours] = (user.timeCommitment || "0+")
        .split("-")
        .map((h: string) => parseInt(h.replace("+", "")) || 0);
      recommendedProjects = recommendedProjects.filter((project: any) => {
        if (Number.isFinite(maxHours) && maxHours > 0) {
          return (
            project.estimatedHours >= minHours &&
            project.estimatedHours <= maxHours
          );
        }
        return project.estimatedHours >= minHours;
      });

      return recommendedProjects.slice(0, 5);
    },
  },

  sessions: {
    create: async (userId: string) => {
      const id = uuidv4();
      const token = uuidv4();
      const now = new Date().toISOString();
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
      const session = { id, userId, token, expiresAt, createdAt: now };
      await firestore.collection("sessions").doc(id).set(session);
      return {
        ...session,
        expiresAt: new Date(session.expiresAt),
        createdAt: new Date(session.createdAt),
      };
    },

    findByToken: async (token: string) => {
      const q = await firestore
        .collection("sessions")
        .where("token", "==", token)
        .limit(1)
        .get();
      if (q.empty) return null;
      const doc = q.docs[0].data() as any;
      if (new Date(doc.expiresAt) < new Date()) return null;
      return {
        ...doc,
        expiresAt: new Date(doc.expiresAt),
        createdAt: new Date(doc.createdAt),
      };
    },

    delete: async (token: string) => {
      const q = await firestore
        .collection("sessions")
        .where("token", "==", token)
        .limit(1)
        .get();
      if (q.empty) return;
      await q.docs[0].ref.delete();
    },
  },
};

// Utility functions similar to previous implementation
export const hashPassword = async (password: string): Promise<string> => {
  return `hashed_${password}`;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return hashedPassword === `hashed_${password}`;
};
