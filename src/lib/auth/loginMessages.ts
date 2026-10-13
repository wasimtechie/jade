/** Client-safe login failure codes and copy (no server/DB imports). */

export const LOGIN_FAILURE_CODES = [
  "INVALID_CREDENTIALS",
  "ACCOUNT_SUSPENDED",
  "ROLE_MISMATCH",
  "RATE_LIMITED",
] as const;

export type LoginFailureCode = (typeof LOGIN_FAILURE_CODES)[number];

export const LOGIN_FAILURE_MESSAGES: Record<LoginFailureCode, string> = {
  INVALID_CREDENTIALS:
    "Invalid email or password. Please check your details and try again.",
  ACCOUNT_SUSPENDED:
    "You're suspended by Admin. Contact Jade Host admin to regain access.",
  ROLE_MISMATCH:
    "The selected role does not match your account. Choose the correct role and try again.",
  RATE_LIMITED:
    "Too many login attempts. Please wait 15 minutes and try again.",
};
