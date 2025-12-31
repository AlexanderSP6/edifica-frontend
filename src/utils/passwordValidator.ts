// VALIDADOR DE CONTRASEÑAS  
// ===================================================================

export interface PasswordCriterion {
  met: boolean;
  label: string;
  key: string;
}

export const PASSWORD_REGEX = {
  minLength: /.{8,}/,
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  special: /[@$!%*?&#._-]/
} as const;

export const PASSWORD_CRITERIA_CONFIG = [
  { key: 'minLength', regex: PASSWORD_REGEX.minLength, label: 'Mínimo 8 caracteres' },
  { key: 'lowercase', regex: PASSWORD_REGEX.lowercase, label: 'Una letra minúscula' },
  { key: 'uppercase', regex: PASSWORD_REGEX.uppercase, label: 'Una letra MAYÚSCULA' },
  { key: 'number', regex: PASSWORD_REGEX.number, label: 'Un número' },
  { key: 'special', regex: PASSWORD_REGEX.special, label: 'Un carácter especial' }
] as const;

/**
 * Evalúa una contraseña y retorna los criterios cumplidos
 */
export const evaluatePassword = (password: string): PasswordCriterion[] => {
  return PASSWORD_CRITERIA_CONFIG.map(criterion => ({
    met: criterion.regex.test(password),
    label: criterion.label,
    key: criterion.key
  }));
};

/**
 * Calcula la fortaleza de la contraseña 
 */
export const calculatePasswordStrength = (password: string): number => {
  return evaluatePassword(password).filter(c => c.met).length;
};

/**
 * Valida si la contraseña cumple TODOS los requisitos
 */
export const isPasswordValid = (password: string): boolean => {
  return PASSWORD_CRITERIA_CONFIG.every(criterion => 
    criterion.regex.test(password)
  );
};


