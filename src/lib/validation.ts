export interface PasswordValidationResult {
  isValid: boolean;
  lengthValid: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  onlyEnglishAlphanumeric: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const lengthValid = password.length >= 8 && password.length <= 20;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const onlyEnglishAlphanumeric = /^[a-zA-Z0-9]+$/.test(password);

  const errors: string[] = [];
  if (!lengthValid) errors.push('8-20 characters long');
  if (!hasUpper) errors.push('At least one uppercase English letter (A-Z)');
  if (!hasLower) errors.push('At least one lowercase English letter (a-z)');
  if (!hasDigit) errors.push('At least one English digit (0-9)');
  if (!onlyEnglishAlphanumeric && password.length > 0) errors.push('Only English letters and numbers (no spaces, special characters, or non-English text)');

  const isValid = lengthValid && hasUpper && hasLower && hasDigit && onlyEnglishAlphanumeric;

  return {
    isValid,
    lengthValid,
    hasUpper,
    hasLower,
    hasDigit,
    onlyEnglishAlphanumeric,
    errors,
  };
}

export function validateGmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim());
}
