import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export type ConfirmDialogSeverity = 'warning' | 'error' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  severity?: ConfirmDialogSeverity;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  showAlert?: boolean;
  alertMessage?: string;
  children?: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  severity = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  showAlert = true,
  alertMessage,
  children,
}) => {
  // Configuración de colores e iconos según severidad
  const severityConfig = {
    warning: {
      color: '#ff9800',
      bgColor: '#fff3e0',
      borderColor: '#ff9800',
      icon: <WarningAmberIcon sx={{ fontSize: 32 }} />,
      buttonColor: 'warning' as const,
    },
    error: {
      color: '#f44336',
      bgColor: '#ffebee',
      borderColor: '#f44336',
      icon: <ErrorOutlineIcon sx={{ fontSize: 32 }} />,
      buttonColor: 'error' as const,
    },
    info: {
      color: '#2196f3',
      bgColor: '#e3f2fd',
      borderColor: '#2196f3',
      icon: <InfoIcon sx={{ fontSize: 32 }} />,
      buttonColor: 'info' as const,
    },
    success: {
      color: '#4caf50',
      bgColor: '#e8f5e9',
      borderColor: '#4caf50',
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />,
      buttonColor: 'success' as const,
    },
  };

  const config = severityConfig[severity];

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleConfirm = () => {
    if (!loading) onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{
      timeout: 0  
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: `2px solid ${config.borderColor}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pt: 4,
          pb: 2,
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: config.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 2,
          }}
        >
          {React.cloneElement(config.icon, { sx: { fontSize: 32, color: config.color } })}
        </Box>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
        {description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {description}
          </Typography>
        )}

        {children && (
          <Box sx={{ mt: 2 }}>
            {children}
          </Box>
        )}

        {showAlert && alertMessage && (
          <Alert severity={severity} sx={{ mt: 2, textAlign: 'left' }}>
            {alertMessage}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          sx={{
            textTransform: 'none',
            px: 4,
            color: 'text.secondary',
            borderColor: '#e0e0e0',
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={config.buttonColor}
          disabled={loading}
          sx={{
            textTransform: 'none',
            px: 4,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> : null}
          {loading ? 'Procesando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;