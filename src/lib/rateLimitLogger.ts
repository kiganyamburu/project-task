/**
 * Rate limit violation logging utility
 * Provides structured logging for rate limit events
 */

export interface RateLimitViolation {
  timestamp: string;
  type: 'ip' | 'user' | 'both';
  identifier: string;
  userId?: string;
  path: string;
  method: string;
  userAgent?: string;
  limit: number;
  remaining: number;
  resetTime: string;
  retryAfter: number;
}

/**
 * Log a rate limit violation
 */
export function logRateLimitViolation(violation: RateLimitViolation): void {
  const logEntry = {
    event: 'rate_limit_violation',
    ...violation,
  };

  // Structured logging in JSON format for easy parsing
  console.warn(JSON.stringify(logEntry));

  // Also log a human-readable version for development
  const humanReadable = `[RATE LIMIT] ${violation.type.toUpperCase()} limit exceeded - ` +
    `Identifier: ${violation.identifier}${violation.userId ? `, User: ${violation.userId}` : ''} ` +
    `- Path: ${violation.method} ${violation.path} ` +
    `- Limit: ${violation.limit}, Remaining: ${violation.remaining} ` +
    `- Retry after: ${violation.retryAfter}s`;
  
  console.warn(humanReadable);
}

/**
 * Log a rate limit check (for monitoring purposes)
 * This can be used to track rate limit usage patterns
 */
export function logRateLimitCheck(
  type: 'ip' | 'user',
  identifier: string,
  path: string,
  method: string,
  remaining: number,
  limit: number
): void {
  // Only log if remaining is low (below 20% of limit) to reduce noise
  if (remaining < limit * 0.2) {
    const logEntry = {
      event: 'rate_limit_check',
      type,
      identifier,
      path,
      method,
      remaining,
      limit,
      timestamp: new Date().toISOString(),
    };

    console.info(JSON.stringify(logEntry));
  }
}



