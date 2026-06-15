import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import { motion } from 'framer-motion';
import { statusConfig } from '../constants/stepConfig';

export default function TaskCard({
  task,
  onViewDetail,
  onUploadClick,
  onViewFileClick,
  latestDocument,
  getDocumentUrl,
}) {
  const status = task.status || 'waiting';
  const config = statusConfig[status] || statusConfig.waiting;

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(6, 68, 96, 0.08)' }}
      sx={{
        height: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: status === 'rejected' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(226, 232, 240, 0.8)',
        transition: 'all 0.2s',
      }}
    >
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyBetween: 'space-between', '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="700" color="text.primary">
            {task.name}
          </Typography>
          <Chip
            label={config.label}
            size="small"
            sx={{
              backgroundColor: config.bg,
              color: config.text,
              fontWeight: 800,
              fontSize: '0.72rem',
              height: 24,
              borderRadius: 1.5,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 'auto' }}>
          <Button
            size="small"
            startIcon={<InfoIcon />}
            onClick={() => onViewDetail(task)}
            sx={{
              color: '#064460',
              fontWeight: 600,
              fontSize: '0.8rem',
              p: 0,
              minWidth: 'auto',
              backgroundColor: 'transparent',
              '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
            }}
          >
            ดูรายละเอียด
          </Button>

          {task.uploadable && (!task.fileUploaded || status === 'rejected') && (
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<CloudUploadIcon />}
              onClick={() => onUploadClick(task)}
              sx={{
                ml: 'auto',
                fontWeight: 700,
                fontSize: '0.75rem',
                py: 0.5,
                px: 1.5,
                borderRadius: 2,
              }}
            >
              {task.fileUploaded ? 'อัปโหลดใหม่' : 'อัปโหลด'}
            </Button>
          )}

          {task.uploadable && task.fileUploaded && latestDocument && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              startIcon={<VisibilityIcon />}
              component="a"
              href={getDocumentUrl(latestDocument)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ml: task.status === 'rejected' ? 0 : 'auto',
                fontWeight: 700,
                fontSize: '0.75rem',
                py: 0.5,
                px: 1.5,
                borderRadius: 2,
              }}
            >
              {task.id === 7 ? 'ดูสลิป' : 'ดูไฟล์'}
            </Button>
          )}
        </Box>

        {task.uploadable && status === 'rejected' && (
          <Typography
            variant="caption"
            sx={{
              mt: 1.5,
              color: 'error.main',
              fontWeight: 600,
              display: 'block',
            }}
          >
            ❌ {task.id === 7
              ? 'สลิปค่าออกฝึกไม่ผ่านการตรวจสอบ กรุณาอัปโหลดไฟล์ใหม่'
              : 'ไฟล์ไม่ผ่านการตรวจสอบ กรุณาอัปโหลดไฟล์ใหม่'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
