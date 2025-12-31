import { useState, useCallback, useMemo } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  LinearProgress,
  Chip,
  Typography,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  Info,
} from '@mui/icons-material';
import { useField } from 'formik';
import {
  evaluatePassword,
  calculatePasswordStrength,
  PasswordCriterion,
} from '../../utils/passwordValidator';


// INTERFACES Y TIPOS

interface PasswordStrengthInfo {
  score: number;           
  strength: string;       
  color: string;          
  criteria: PasswordCriterion[];
}

interface PasswordFieldProps {

  name: string;
  label: string;
  showStrengthBar?: boolean;
  showCriteria?: boolean;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  autoComplete?: string;
  size?: 'small' | 'medium';
  id?: string;
}


// FUNCIONES COMPLEMENTARIAS PARA EL CAMPO PASSWORD

/**
 * Determina la etiqueta y color de fortaleza según el score
 */
const getStrengthLabel = (score: number): { strength: string; color: string } => {
  if (score === 0) return { strength: '', color: '' };
  if (score <= 2) return { strength: 'Muy débil', color: '#f44336' }; // Rojo
  if (score === 3) return { strength: 'Débil', color: '#ff9800' };     // Naranja
  if (score === 4) return { strength: 'Moderada', color: '#ffeb3b' };  // Amarillo
  return { strength: 'Fuerte', color: '#4caf50' };                     // Verde
};

/**
 * Evalúa la contraseña y retorna información de fortaleza
 */
const evaluatePasswordStrength = (password: string): PasswordStrengthInfo => {
  if (!password || password.trim() === '') {
    return {
      score: 0,
      strength: '',
      color: '',
      criteria: [],
    };
  }

  const criteria = evaluatePassword(password);
  const strengthScore = calculatePasswordStrength(password);
  const scorePercentage = (strengthScore / 5) * 100;
  const { strength, color } = getStrengthLabel(strengthScore);

  return {
    score: scorePercentage,
    strength,
    color,
    criteria,
  };
};

// ===================================================================
// COMPONENTE PASSWORD
// ===================================================================

const PasswordField = ({
  name,
  label,
  showStrengthBar = false,
  showCriteria = false,
  required = false,
  placeholder,
  helperText,
  disabled = false,
  autoComplete = 'new-password',
  size = 'small',
  id,
}: PasswordFieldProps) => {

  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  // MEMOIZACIÓN DE FORTALEZA 

  const passwordStrength = useMemo(
    () => evaluatePasswordStrength(field.value || ''),
    [field.value]
  );

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);


  const hasError = meta.touched && Boolean(meta.error);
  const errorMessage = meta.touched && meta.error;
  const displayHelperText = errorMessage || helperText;


  const textFieldSx = useMemo(
    () => ({
      '& input::-ms-reveal': { display: 'none' },
      '& input::-ms-clear': { display: 'none' },
      '& input::-webkit-contacts-auto-fill-button': { display: 'none' },
      '& input::-webkit-credentials-auto-fill-button': { display: 'none' },
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover:not(.Mui-disabled)': {
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
        },
        '&.Mui-focused': {
          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.25)',
        },
        '&.Mui-error': {
          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
        },
      },
    }),
    []
  );


  return (
    <Box sx={{ width: '100%' }}>
      {/* CAMPO DE TEXTO */}
      <TextField
        {...field}
        id={id || `password-field-${name}`}
        fullWidth
        size={size}
        label={label}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        error={hasError}
        helperText={displayHelperText}
        disabled={disabled}
        required={required}
        inputProps={{
          maxLength: 250,
          autoComplete,
          'aria-label': label,
          'aria-required': required,
          'aria-invalid': hasError,
          'aria-describedby': showStrengthBar ? `${name}-strength-indicator` : undefined,
        }}
        sx={textFieldSx}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                <IconButton
                  onClick={handleTogglePassword}
                  edge="end"
                  size="small"
                  tabIndex={-1}
                  disabled={disabled}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  {showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />

      {/* INDICADOR DE FORTALEZA */}
      {showStrengthBar && field.value && (
        <Box
          id={`${name}-strength-indicator`}
          sx={{ mt: 2, mb: showCriteria ? 1 : 0 }}
          role="status"
          aria-live="polite"
        >
          {/* Barra de progreso + Chip */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={passwordStrength.score}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.grey[200],
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: passwordStrength.color || theme.palette.grey[400],
                    borderRadius: 4,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                }}
                aria-label={`Fortaleza de contraseña: ${passwordStrength.strength || 'Sin evaluar'}`}
              />
            </Box>
            {passwordStrength.strength && (
              <Chip
                label={passwordStrength.strength}
                size="small"
                sx={{
                  backgroundColor: passwordStrength.color,
                  color: 'white',
                  fontWeight: 600,
                  minWidth: 90,
                  transition: 'all 0.3s ease',
                  boxShadow: `0 2px 8px ${passwordStrength.color}40`,
                }}
              />
            )}
          </Box>

          {/* CRITERIOS DE VALIDACIÓN */}
          {showCriteria && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2,
                border: `1px solid ${theme.palette.grey[200]}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Info fontSize="small" sx={{ color: theme.palette.info.main }} />
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Requisitos de Seguridad
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {passwordStrength.criteria.map((criterion) => (
                  <Box
                    key={criterion.key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {criterion.met ? (
                      <CheckCircle
                        sx={{
                          fontSize: 16,
                          color: theme.palette.success.main,
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <Cancel
                        sx={{
                          fontSize: 16,
                          color: theme.palette.grey[400],
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: criterion.met
                          ? theme.palette.success.dark
                          : theme.palette.text.secondary,
                        fontWeight: criterion.met ? 600 : 400,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {criterion.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PasswordField;