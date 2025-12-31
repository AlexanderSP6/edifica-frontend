import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Lock,
  Close,
  ContentCopy,
  CheckCircle,
  Visibility,
  VisibilityOff,
  Warning, 
  Info,
} from '@mui/icons-material';
import { resetUserPassword } from '../services/userService';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    iduser: number;
    usuario: string;
    nombres: string;
    appaterno: string;
    apmaterno?: string;
    password_reset_required?: boolean;        
    password_expires_at?: string | null;      
  } | null;
  onSuccess?: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onClose,
  user,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await resetUserPassword(user.iduser);

      if (response.data.status) {
        setTemporaryPassword(response.data.data.temporary_password);
        setExpiresAt(response.data.data.expires_at);
        setSuccess(true);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Error al resetear la contraseña'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setTemporaryPassword('');
    setExpiresAt('');
    setError('');
    setCopied(false);
    setShowPassword(false);
    onClose();
  };
  if (!user) return null;

  const fullName = `${user.nombres} ${user.appaterno}${user.apmaterno ? ' ' + user.apmaterno : ''}`;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#e74c3c', color: 'white', pb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Lock />
            <Typography variant="h6" fontWeight="600">
              Resetear Contraseña
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        
        {!success ? (
          // Confirmación antes de resetear
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Alert 
              severity="warning" 
              icon={<Warning />}
              sx={{ mb: 3, bgcolor: '#fff3cd', color: '#856404' }}
            >
              <Typography variant="body2" fontWeight="600" gutterBottom>
                ¿Está seguro de resetear la contraseña?
              </Typography>
              <Typography variant="caption">
                Esta acción generará una nueva contraseña temporal que expirará en 7 días.
              </Typography>
            </Alert>
           
              {user.password_reset_required && (
              <Alert 
          severity="info" 
          icon={<Info />}
          sx={{ 
            mb: 3, 
            bgcolor: '#e3f2fd', 
            color: '#0d47a1',
            border: '1px solid #90caf9'
          }}
        >
          <Typography variant="body2" fontWeight="600" gutterBottom>
          Este usuario ya tiene una contraseña temporal activa
          </Typography>
          <Typography variant="caption">
            Si generas una nueva, la contraseña anterior quedará invalidada.
            El usuario deberá usar la nueva contraseña temporal.
          </Typography>
        </Alert>
      )}
            <Box 
              sx={{ 
                bgcolor: '#f8f9fa', 
                p: 2.5, 
                borderRadius: 2,
                border: '1px solid #dee2e6'
              }}
            >
              <Typography variant="caption" color="#7f8c8d" fontWeight="700" textTransform="uppercase">
                Usuario
              </Typography>
              <Typography variant="body1" fontWeight="600" color="#2c3e50" mt={0.5}>
                {user.usuario}
              </Typography>

              <Typography variant="caption" color="#7f8c8d" fontWeight="700" textTransform="uppercase" mt={2} display="block">
                Nombre Completo
              </Typography>
              <Typography variant="body1" fontWeight="600" color="#2c3e50" mt={0.5}>
                {fullName}
              </Typography>
            </Box>

            <Box mt={2.5}>
              <Typography variant="body2" color="#7f8c8d">
                El usuario deberá cambiar esta contraseña en su próximo inicio de sesión.
              </Typography>
            </Box>
          </Box>
        ) : (
          // Mostrar contraseña generada
          <Box>
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ mb: 3, bgcolor: '#d5f4e6', color: '#27ae60' }}
            >
              <Typography variant="body2" fontWeight="600">
                ¡Contraseña reseteada correctamente!
              </Typography>
            </Alert>

            <Box 
              sx={{ 
                bgcolor: '#fff3cd', 
                p: 3, 
                borderRadius: 2,
                border: '2px solid #f39c12'
              }}
            >
              <Typography variant="subtitle2" fontWeight="700" color="#856404" gutterBottom>
                Contraseña Temporal Generada
              </Typography>
              
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={temporaryPassword}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    bgcolor: 'white'
                  }
                }}
                sx={{ my: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                onClick={handleCopyPassword}
                sx={{
                  bgcolor: copied ? '#27ae60' : '#34495e',
                  color: 'white',
                  '&:hover': { bgcolor: copied ? '#229954' : '#2c3e50' },
                  fontWeight: 600
                }}
              >
                {copied ? 'Copiado' : 'Copiar Contraseña'}
              </Button>
            </Box>

            <Box 
              sx={{ 
                mt: 2.5, 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                border: '1px solid #dee2e6'
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="body2" fontWeight="600" color="#2c3e50">
                  Información importante:
                </Typography>
              </Box>
              
              <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                <Typography component="li" variant="body2" color="#7f8c8d" mb={0.5}>
                  Esta contraseña expira el: <strong>{new Date(expiresAt).toLocaleDateString('es-BO', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</strong>
                </Typography>
                <Typography component="li" variant="body2" color="#7f8c8d" mb={0.5}>
                  El usuario <strong>debe cambiarla</strong> en su próximo inicio de sesión
                </Typography>
                <Typography component="li" variant="body2" color="#7f8c8d">
                  Entregue esta contraseña de forma segura al usuario
                </Typography>
              </Box>
            </Box>

            <Box mt={2}>
              <Chip
                label={`Usuario: ${user.usuario}`}
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip
                label="Válida por 7 días"
                sx={{ bgcolor: '#f39c12', color: 'white' }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
        {!success ? (
          <>
            <Button
              onClick={handleClose}
              disabled={loading}
              sx={{
                color: '#7f8c8d',
                '&:hover': { bgcolor: '#ecf0f1' }
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleReset}
              disabled={loading}
              sx={{
                bgcolor: '#e74c3c',
                color: 'white',
                '&:hover': { bgcolor: '#c0392b' },
                '&:disabled': { bgcolor: '#bdc3c7' },
                px: 3,
                fontWeight: 600
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Resetear Contraseña'}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              bgcolor: '#27ae60',
              color: 'white',
              '&:hover': { bgcolor: '#229954' },
              px: 3,
              fontWeight: 600
            }}
          >
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordModal;