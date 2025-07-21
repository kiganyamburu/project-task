import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { ApiResponse, ProjectRecommendation } from '@/types/api';
import { Project } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const skillLevel = searchParams.get('skillLevel');
    const interests = searchParams.get('interests')?.split(',') || [];
    const limit = parseInt(searchParams.get('limit') || '5');

    let recommendations: ProjectRecommendation[] = [];

    if (userId) {
      // Get personalized recommendations for logged-in user
      const user = await db.users.findById(userId);
      if (user) {
        const projects = await db.projects.recommend(user);
        recommendations = projects.map((project: Project, index: number) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          difficulty: project.difficulty,
          technologies: project.technologies,
          estimatedHours: project.estimatedHours,
          category: project.category,
          matchScore: 95 - (index * 5), // Mock match score
          reasons: [`Matches your ${user.experience} level`, `Aligns with your interests`]
        }));
      }
    } else {
      // Get general recommendations based on skill level
      const experience = skillLevel || 'beginner';
      const allProjects = await db.projects.findAll();
      
      // Filter projects based on skill level
      const filteredProjects = allProjects.filter((project: Project) => {
        if (experience === 'beginner' && project.difficulty !== 'advanced') {
          return true;
        }
        if (experience === 'intermediate') {
          return true;
        }
        if (experience === 'advanced') {
          return true;
        }
        return false;
      });
      
      recommendations = filteredProjects.map((project: Project, index: number) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        difficulty: project.difficulty,
        technologies: project.technologies,
        estimatedHours: project.estimatedHours,
        category: project.category,
        matchScore: 90 - (index * 5), // Mock match score
        reasons: [`Perfect for ${experience} level`, `Popular project type`]
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        projects: recommendations.slice(0, limit),
        totalCount: recommendations.length,
        matchingCriteria: skillLevel ? [skillLevel, ...interests] : ['general']
      }
    } as ApiResponse<{
      projects: ProjectRecommendation[];
      totalCount: number;
      matchingCriteria: string[];
    }>);

  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillLevel, interests, preferredTechnologies } = body;

    // Get recommendations based on provided criteria
    const userLevel = skillLevel || 'beginner';
    const allProjects = await db.projects.findAll();
    
    const recommendations: ProjectRecommendation[] = allProjects
      .filter((project: Project) => {
        // Filter by skill level
        if (userLevel === 'beginner' && project.difficulty !== 'advanced') {
          return true;
        }
        if (userLevel === 'intermediate') {
          return true;
        }
        if (userLevel === 'advanced') {
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
        matchScore: 95 - (index * 5),
        reasons: [`Matches ${userLevel} level`, `Uses preferred technologies`]
      }));

    return NextResponse.json({
      success: true,
      data: {
        projects: recommendations.slice(0, 10),
        totalCount: recommendations.length,
        matchingCriteria: [userLevel, ...(interests || []), ...(preferredTechnologies || [])]
      }
    } as ApiResponse<{
      projects: ProjectRecommendation[];
      totalCount: number;
      matchingCriteria: string[];
    }>);

  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse, { status: 500 });
  }
}
