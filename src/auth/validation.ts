const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address";
  return undefined;
}

/** Mirrors the backend rule: 8–72 characters with at least one letter and one number. */
export function validatePassword(password: string): string | undefined {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 72) return "Password must be at most 72 characters";
  if (!/[A-Za-z]/.test(password)) return "Password must contain at least one letter";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  return undefined;
}

export const PASSWORD_HINT = "At least 8 characters with a letter and a number.";

/** Mirrors the backend rule: 3–40 lowercase letters, numbers, ".", "_" or "-", starting and ending with a letter or number. */
export function validateUsername(username: string): string | undefined {
  const value = username.trim().toLowerCase();
  if (!value) return "Username is required";
  if (value.length < 3) return "Username must be at least 3 characters";
  if (value.length > 40) return "Username must be at most 40 characters";
  if (!/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/.test(value)) {
    return "Use lowercase letters, numbers, dots, dashes or underscores, starting and ending with a letter or number";
  }
  return undefined;
}

export const USERNAME_HINT = "Lowercase letters, numbers, dots, dashes or underscores.";
