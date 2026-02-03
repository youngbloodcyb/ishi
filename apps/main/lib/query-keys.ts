/**
 * Centralized react-query keys for the application.
 * Use these instead of hardcoding query key strings.
 *
 * Query keys follow a hierarchical structure:
 * - Base keys are arrays with a single string identifier
 * - Parameterized keys are functions that return arrays
 */

export const QUERY_KEYS = {
  // ============================================
  // User/Auth Queries
  // ============================================
  USER: {
    /** Current user profile */
    profile: ["user", "profile"] as const,
  },

  // ============================================
  // Organization Queries
  // ============================================
  ORGANIZATION: {
    /** Organization members */
    members: ["organization", "members"] as const,
  },
} as const;
