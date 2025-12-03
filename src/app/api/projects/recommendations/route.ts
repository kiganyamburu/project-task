import { NextRequest, NextResponse } from "next/server";
import { db, Project } from "@/lib/firestoreDb";
import { ApiResponse, ProjectRecommendation } from "@/types/api";
import { callGemini } from "@/lib/gemini";
import { requireAuth } from "@/lib/authMiddleware";
import { formatFirestoreError, isRetryableError } from "@/lib/firestoreErrors";
import { validateQueryParams, projectRecommendationsQuerySchema, ProjectRecommendationsQuery } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    // Validate query parameters
    const validationResult = validateQueryParams<ProjectRecommendationsQuery>(request, projectRecommendationsQuerySchema);
    
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { userId, skillLevel, interests: interestsParam, limit } = validationResult.data;
    const interests = typeof interestsParam === 'string' 
      ? interestsParam.split(",").map(i => i.trim()).filter(i => i.length > 0)
      : [];

    let recommendations: ProjectRecommendation[] = [];

    if (userId) {
      // Require authentication for personalized recommendations
      const authResult = await requireAuth(request);
      if (authResult instanceof NextResponse) {
        return authResult; // Return error response
      }

      const { user } = authResult;
      
      // Verify the userId matches the authenticated user
      if (user.id !== userId) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized: userId does not match authenticated user",
          } as ApiResponse,
          { status: 403 }
        );
      }

      // Fetch full user from database for recommendations (recommend requires full User type)
      const fullUser = await db.users.findById(user.id);
      if (!fullUser) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          } as ApiResponse,
          { status: 404 }
        );
      }

      // Get personalized recommendations for authenticated user
      const projects = await db.projects.recommend(fullUser);
      recommendations = projects.map((project: Project, index: number) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        difficulty: project.difficulty,
        technologies: project.technologies,
        estimatedHours: project.estimatedHours,
        category: project.category,
        matchScore: 95 - index * 5, // Mock match score
        reasons: [
          `Matches your ${user.experience} level`,
          `Aligns with your interests`,
        ],
      }));
    } else {
      // Get general recommendations based on skill level
      const experience = skillLevel || "beginner";
      
      try {
        const allProjects = await db.projects.findAll();

        // Filter projects based on skill level
        const filteredProjects = allProjects.filter((project: Project) => {
          if (experience === "beginner" && project.difficulty !== "advanced") {
            return true;
          }
          if (experience === "intermediate") {
            return true;
          }
          if (experience === "advanced") {
            return true;
          }
          return false;
        });

        recommendations = filteredProjects.map(
          (project: Project, index: number) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            difficulty: project.difficulty,
            technologies: project.technologies,
            estimatedHours: project.estimatedHours,
            category: project.category,
            matchScore: 90 - index * 5, // Mock match score
            reasons: [`Perfect for ${experience} level`, `Popular project type`],
          })
        );
      } catch (error: unknown) {
        // Graceful degradation: return empty recommendations with error message
        console.error("Failed to fetch projects from Firestore:", error);
        return NextResponse.json({
          success: true,
          data: {
            projects: [],
            totalCount: 0,
            matchingCriteria: [experience],
            warning: isRetryableError(error) 
              ? "Service temporarily unavailable. Please try again in a moment."
              : formatFirestoreError(error),
          },
        } as ApiResponse<{
          projects: ProjectRecommendation[];
          totalCount: number;
          matchingCriteria: string[];
          warning?: string;
        }>);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        projects: recommendations.slice(0, limit),
        totalCount: recommendations.length,
        matchingCriteria: skillLevel ? [skillLevel, ...interests] : ["general"],
      },
    } as ApiResponse<{
      projects: ProjectRecommendation[];
      totalCount: number;
      matchingCriteria: string[];
    }>);
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
}

import { validateRequestBody, projectRecommendationsSchema, ProjectRecommendationsRequest } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validationResult = await validateRequestBody<ProjectRecommendationsRequest>(request, projectRecommendationsSchema);
    
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { skillLevel, interests, preferredTechnologies, userId, limit } = validationResult.data;

    // If userId is provided, require authentication and verify match
    let authenticatedUser = null;
    if (userId) {
      const authResult = await requireAuth(request);
      if (authResult instanceof NextResponse) {
        return authResult; // Return error response
      }
      const { user } = authResult;
      authenticatedUser = user;
      
      // Verify the userId matches the authenticated user
      if (user.id !== userId) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized: userId does not match authenticated user",
          } as ApiResponse,
          { status: 403 }
        );
      }
    }

    // Get recommendations based on provided criteria
    const userLevel = skillLevel || "beginner";
    
    let allProjects: Project[] = [];
    try {
      allProjects = await db.projects.findAll();
    } catch (error: unknown) {
      // Graceful degradation: return empty recommendations with error message
      console.error("Failed to fetch projects from Firestore:", error);
      return NextResponse.json({
        success: true,
        data: {
          projects: [],
          totalCount: 0,
          matchingCriteria: [userLevel, ...(interests || []), ...(preferredTechnologies || [])],
          warning: isRetryableError(error)
            ? "Service temporarily unavailable. Please try again in a moment."
            : formatFirestoreError(error),
        },
      } as ApiResponse<{
        projects: ProjectRecommendation[];
        totalCount: number;
        matchingCriteria: string[];
        warning?: string;
      }>);
    }

    let recommendations: ProjectRecommendation[] = allProjects
      .filter((project: Project) => {
        // Filter by skill level
        if (userLevel === "beginner" && project.difficulty !== "advanced") {
          return true;
        }
        if (userLevel === "intermediate") {
          return true;
        }
        if (userLevel === "advanced") {
          return true;
        }
        return false;
      })
      .filter((project: Project) => {
        // Filter by preferred technologies if provided
        if (preferredTechnologies && preferredTechnologies.length > 0) {
          return project.technologies.some((tech: string) =>
            preferredTechnologies.includes(tech)
          );
        }
        return true;
      })
      .map((project: Project, index: number) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        difficulty: project.difficulty,
        technologies: project.technologies,
        estimatedHours: project.estimatedHours,
        category: project.category,
        matchScore: 95 - index * 5,
        reasons: [`Matches ${userLevel} level`, `Uses preferred technologies`],
      }));

    // If Gemini is configured, ask the LLM to rank and provide reasons.
    try {
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_URL) {
        const prompt = `You are an assistant that ranks developer projects given user preferences.\nUser preferences: skillLevel=${userLevel}, interests=${JSON.stringify(
          interests || []
        )}, preferredTechnologies=${JSON.stringify(
          preferredTechnologies || []
        )}.\nProjects: ${JSON.stringify(
          recommendations.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            technologies: p.technologies,
            difficulty: p.difficulty,
          }))
        )}\n\nReturn a JSON array of objects with keys: id, score (0-100), reasons (array of short strings). Only return valid JSON.`;

        const llmText = await callGemini(prompt, { maxTokens: 400 });
        if (llmText) {
          try {
            // Extract first JSON-looking substring in case the model adds explanation text.
            const jsonMatch = llmText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            const parsed = jsonMatch
              ? JSON.parse(jsonMatch[0])
              : JSON.parse(llmText);
            if (Array.isArray(parsed)) {
              const idToProject = new Map(
                recommendations.map((r) => [String(r.id), r])
              );
              const merged: ProjectRecommendation[] = [];
              for (const item of parsed) {
                const base = idToProject.get(String(item.id));
                if (base) {
                  merged.push({
                    ...base,
                    matchScore:
                      typeof item.score === "number"
                        ? item.score
                        : base.matchScore,
                    reasons: Array.isArray(item.reasons)
                      ? item.reasons
                      : base.reasons,
                  });
                }
              }
              // Append leftover projects not present in LLM result
              const leftovers = recommendations.filter(
                (r) => !merged.find((m) => m.id === r.id)
              );
              recommendations = [...merged, ...leftovers];
            }
          } catch (e) {
            // If parsing fails, continue with rule-based recommendations
            // eslint-disable-next-line no-console
            console.warn(
              "Failed to parse Gemini response for recommendations:",
              e
            );
          }
        }
      }
    } catch (err) {
      // If Gemini call throws unexpectedly, fallback gracefully
      // eslint-disable-next-line no-console
      console.error("Gemini integration error:", err);
    }

    return NextResponse.json({
      success: true,
      data: {
        projects: recommendations.slice(0, limit || 10),
        totalCount: recommendations.length,
        matchingCriteria: [
          userLevel,
          ...(interests || []),
          ...(preferredTechnologies || []),
        ],
      },
    } as ApiResponse<{
      projects: ProjectRecommendation[];
      totalCount: number;
      matchingCriteria: string[];
    }>);
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
