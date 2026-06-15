import React from 'react';
import { Box, Typography, Tooltip, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LoopIcon from '@mui/icons-material/Loop';
import { motion } from 'framer-motion';
import { STEP_LABELS, statusConfig } from '../constants/stepConfig';

export default function ProgressTimeline({ steps = [], variant = 'vertical' }) {
  const getStepIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />;
      case 'rejected':
        return <CancelIcon sx={{ color: '#dc2626', fontSize: 22 }} />;
      case 'in_progress':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <LoopIcon sx={{ color: '#3b82f6', fontSize: 22 }} />
          </motion.div>
        );
      default:
        return <HourglassEmptyIcon sx={{ color: '#94a3b8', fontSize: 22 }} />;
    }
  };

  const getStepBorderColor = (status) => {
    switch (status) {
      case 'approved':
        return '#16a34a';
      case 'rejected':
        return '#dc2626';
      case 'in_progress':
        return '#3b82f6';
      default:
        return '#cbd5e1';
    }
  };

  const getStepBgColor = (status) => {
    switch (status) {
      case 'approved':
        return '#f0fdf4';
      case 'rejected':
        return '#fef2f2';
      case 'in_progress':
        return '#eff6ff';
      default:
        return '#f8fafc';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  if (variant === 'compact') {
    // Horizontal or compact visual progress line
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', overflowX: 'auto', py: 2, px: 1 }}>
        {steps.map((step, idx) => {
          const config = statusConfig[step.status] || statusConfig.waiting;
          const label = STEP_LABELS[step.key] || step.key;
          return (
            <React.Fragment key={step.key}>
              <Tooltip
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="caption" display="block" fontWeight="bold">
                      {label} ({config.label})
                    </Typography>
                    {step.comment && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, color: '#fca5a5' }}>
                        เหตุผล: {step.comment}
                      </Typography>
                    )}
                    {step.updatedAt && (
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                        อัปเดต: {formatDateTime(step.updatedAt)}
                      </Typography>
                    )}
                  </Box>
                }
                arrow
              >
                <Box
                  component={motion.div}
                  whileHover={{ scale: 1.1 }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 70,
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: getStepBgColor(step.status),
                      border: `2px solid ${getStepBorderColor(step.status)}`,
                      boxShadow: step.status === 'in_progress' ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none',
                    }}
                  >
                    {getStepIcon(step.status)}
                  </Box>
                  <Typography
                    variant="caption"
                    fontWeight="600"
                    sx={{
                      mt: 1,
                      textAlign: 'center',
                      fontSize: '0.7rem',
                      color: step.status === 'waiting' ? 'text.secondary' : 'text.primary',
                      maxWidth: 80,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </Tooltip>
              {idx < steps.length - 1 && (
                <Box
                  sx={{
                    flexGrow: 1,
                    height: 3,
                    minWidth: 20,
                    mx: 0.5,
                    bgcolor: step.status === 'approved' ? '#16a34a' : '#e2e8f0',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    );
  }

  // Detailed Vertical Timeline
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1e293b', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        สถานะการตรวจสอบรายแผนก ({steps.filter(s => s.status === 'approved').length}/{steps.length} ผ่าน)
      </Typography>

      <Box sx={{ position: 'relative', pl: 3.5, '&::before': { content: '""', position: 'absolute', left: 11, top: 12, bottom: 12, width: 2, bgcolor: '#e2e8f0' } }}>
        {steps.map((step, idx) => {
          const config = statusConfig[step.status] || statusConfig.waiting;
          const label = STEP_LABELS[step.key] || step.key;
          const isLast = idx === steps.length - 1;

          return (
            <Box
              key={step.key}
              component={motion.div}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              sx={{
                position: 'relative',
                pb: isLast ? 0 : 3,
              }}
            >
              {/* Step indicator circle */}
              <Box
                sx={{
                  position: 'absolute',
                  left: -28,
                  top: 0,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  border: `2px solid ${getStepBorderColor(step.status)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                {getStepIcon(step.status)}
              </Box>

              {/* Step content */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: getStepBgColor(step.status),
                  border: `1px solid ${getStepBorderColor(step.status)}22`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="700" color="#334155">
                      {label}
                    </Typography>
                    {step.comment && (
                      <Typography variant="body2" sx={{ mt: 0.5, color: step.status === 'rejected' ? '#b91c1c' : '#475569', bgcolor: step.status === 'rejected' ? '#fef2f2' : '#f8fafc', p: 1, borderRadius: 1.5, borderLeft: `3px solid ${getStepBorderColor(step.status)}` }}>
                        💬 {step.comment}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Chip
                      label={config.label}
                      size="small"
                      sx={{
                        bgcolor: config.bg,
                        color: config.text,
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                    {step.updatedAt && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(step.updatedAt)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
