import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { NextRequest, NextResponse } from 'next/server';
import { logRateLimitViolation, logRateLimitCheck } from '@/lib/rateLimitLogger';

// Note: verifyAuth is not imported here because it uses firebase-admin
// which doesn't work in Edge runtime (middleware). User-based rate limiting
// should be done in API routes, not middleware.

/**
 * Rate limit configurations for different endpoint types
 * Format: { points: max requests, duration: time window in seconds }
 */
export const RATE_LIMIT_CONFIG = {
  // Strict limits for authentication endpoints (prevent brute force)
  auth: {
    points: 5,      // 5 requests
    duration: 15 * 60, // per 15 minutes
  },
  // Moderate limits for general API endpoints
  general: {
    points: 100,    // 100 requests
    duration: 15 * 60, // per 15 minutes
  },
  // Stricter limits for resource-intensive endpoints
  resourceIntensive: {
    points: 20,     // 20 requests
    duration: 15 * 60, // per 15 minutes
  },
} as const;

// Create IP-based rate limiter instances
const authLimiterIP = new RateLimiterMemory({
  points: RATE_LIMIT_CONFIG.auth.points,
  duration: RATE_LIMIT_CONFIG.auth.duration,
});

const generalLimiterIP = new RateLimiterMemory({
  points: RATE_LIMIT_CONFIG.general.points,
  duration: RATE_LIMIT_CONFIG.general.duration,
});

const resourceIntensiveLimiterIP = new RateLimiterMemory({
  points: RATE_LIMIT_CONFIG.resourceIntensive.points,
  duration: RATE_LIMIT_CONFIG.resourceIntensive.duration,
});

// Create user-based rate limiter instances
// User-based limits are typically more generous since users are authenticated
const authLimiterUser = new RateLimiterMemory({
  points: RATE_LIMIT_CONFIG.auth.points * 2, // 10 requests per 15 minutes for authenticated users
  duration: RATE_LIMIT_CONFIG.auth.duration,
});

const generalLimiterUser = new RateLimiterMemory({
  points: RATE_LIMIT_CONFIG.general.points * 2, // 200 requests per 15 minutes for authenticated users
  duration: RATE_LIMIT_CONFIG.general.duration,
});

const resourceIntensiveLimiterUser = new RateLimiterMemory({
  points: RATE_LIMIT_CONFIG.resourceIntensive.points * 2, // 40 requests per 15 minutes for authenticated users
  duration: RATE_LIMIT_CONFIG.resourceIntensive.duration,
});

/**
 * Get the client identifier (IP address) from the request
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  // Use the first IP from x-forwarded-for if available
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Fallback to other headers
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Last resort: use a default identifier
  // In production, you might want to log this case
  return 'unknown';
}

/**
 * Determine which IP-based rate limiter to use based on the endpoint path
 */
function getIPRateLimiterForPath(pathname: string): RateLimiterMemory {
  // Auth endpoints (login, signup) - strictest limits
  if (pathname.startsWith('/api/auth/')) {
    return authLimiterIP;
  }
  
  // Resource-intensive endpoints (recommendations with AI, etc.)
  if (pathname.startsWith('/api/projects/recommendations')) {
    return resourceIntensiveLimiterIP;
  }
  
  // Default to general limiter for all other endpoints
  return generalLimiterIP;
}

/**
 * Determine which user-based rate limiter to use based on the endpoint path
 */
function getUserRateLimiterForPath(pathname: string): RateLimiterMemory {
  // Auth endpoints (login, signup) - strictest limits
  if (pathname.startsWith('/api/auth/')) {
    return authLimiterUser;
  }
  
  // Resource-intensive endpoints (recommendations with AI, etc.)
  if (pathname.startsWith('/api/projects/recommendations')) {
    return resourceIntensiveLimiterUser;
  }
  
  // Default to general limiter for all other endpoints
  return generalLimiterUser;
}

/**
 * Get rate limit configuration for a path
 */
function getRateLimitConfigForPath(pathname: string): { points: number; duration: number } {
  if (pathname.startsWith('/api/auth/')) {
    return RATE_LIMIT_CONFIG.auth;
  }
  
  if (pathname.startsWith('/api/projects/recommendations')) {
    return RATE_LIMIT_CONFIG.resourceIntensive;
  }
  
  return RATE_LIMIT_CONFIG.general;
}

/**
 * Add rate limit headers to the response
 */
function addRateLimitHeaders(
  response: NextResponse,
  rateLimiterRes: RateLimiterRes | null,
  config: { points: number; duration: number }
): void {
  if (rateLimiterRes) {
    response.headers.set('X-RateLimit-Limit', config.points.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimiterRes.remainingPoints.toString());
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
  } else {
    // If rate limit was exceeded, still set headers
    response.headers.set('X-RateLimit-Limit', config.points.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
  }
}

/**
 * Check rate limit for a request (both IP-based and user-based if authenticated)
 * Returns null if allowed, or a NextResponse with 429 status if rate limited
 */
export async function checkRateLimit(
  request: NextRequest
): Promise<{ allowed: true; response: NextResponse } | { allowed: false; response: NextResponse }> {
  const pathname = request.nextUrl.pathname;
  
  // Skip rate limiting for OPTIONS requests (CORS preflight)
  if (request.method === 'OPTIONS') {
    return {
      allowed: true,
      response: NextResponse.next(),
    };
  }
  
  // Only rate limit API routes
  if (!pathname.startsWith('/api/')) {
    return {
      allowed: true,
      response: NextResponse.next(),
    };
  }
  
  const config = getRateLimitConfigForPath(pathname);
  const ipIdentifier = getClientIdentifier(request);
  const userAgent = request.headers.get('user-agent') || undefined;
  
  // Note: User-based authentication is skipped in middleware because:
  // 1. Middleware runs in Edge runtime which doesn't support firebase-admin
  // 2. User-based rate limiting should be done in API routes instead
  // This middleware only performs IP-based rate limiting
  const userId: string | undefined = undefined;
  
  // Check IP-based rate limit first
  const ipLimiter = getIPRateLimiterForPath(pathname);
  let ipResult: RateLimiterRes | null = null;
  let ipViolated = false;
  
  try {
    ipResult = await ipLimiter.consume(ipIdentifier);
    logRateLimitCheck('ip', ipIdentifier, pathname, request.method, ipResult.remainingPoints, config.points);
  } catch (rateLimiterRes) {
    ipViolated = true;
    const res = rateLimiterRes as RateLimiterRes;
    
    // Log IP-based violation
    logRateLimitViolation({
      timestamp: new Date().toISOString(),
      type: 'ip',
      identifier: ipIdentifier,
      userId,
      path: pathname,
      method: request.method,
      userAgent,
      limit: config.points,
      remaining: 0,
      resetTime: new Date(Date.now() + res.msBeforeNext).toISOString(),
      retryAfter: Math.ceil(res.msBeforeNext / 1000),
    });
    
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(res.msBeforeNext / 1000),
      },
      { status: 429 }
    );
    
    addRateLimitHeaders(errorResponse, res, config);
    errorResponse.headers.set('Retry-After', Math.ceil(res.msBeforeNext / 1000).toString());
    
    return {
      allowed: false,
      response: errorResponse,
    };
  }
  
  // Note: User-based rate limiting is skipped in middleware (Edge runtime)
  // User-based rate limiting can be implemented in individual API routes if needed
  
  // IP check passed - use IP-based headers
  const response = NextResponse.next();
  if (ipResult) {
    addRateLimitHeaders(response, ipResult, config);
  }
  
  return {
    allowed: true,
    response,
  };
}

