import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ProgressTimeline from './ProgressTimeline';
import { STEP_LABELS } from '../constants/stepConfig';
import { API_BASE_URL } from '../services/api';

/**
 * StudentRequestDetailModal
 * Displays detailed request information including:
 * - Visual timeline of workflow steps
 * - Document upload history
 * - Student information
 * - Overall request status
 */
function StudentRequestDetailModal({ open, onClose, request }) {
  if (!request) return null;

  const formatThaiDateTime = (dateString) => {
    if (!dateString) return '-';
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
      return '-';
    }
  };

  const getDocumentUrl = (document) => {
    if (!document?.url) return '';
    if (String(document.url).startsWith('http')) return document.url;
    return `${API_BASE_URL}${document.url}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: '#FACC15',
      'In Progress': '#3b82f6',
      Completed: '#16a34a',
      Rejected: '#dc2626',
    };
    return colors[status] || '#64748b';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      Pending: '#fef3c7',
      'In Progress': '#dbeafe',
      Completed: '#dcfce7',
      Rejected: '#fee2e2',
    };
    return colors[status] || '#f1f5f9';
  };

  // Map request steps to timeline format
  const timelineSteps = Object.entries(request?.steps || {})
    .filter(([key]) => STEP_LABELS[key])
    .map(([key, value]) => ({
      key,
      status: value?.status || 'waiting',
      comment: value?.comment || '',
      updatedAt: value?.updatedAt || null,
    }));

  // Documents organized by type
  const generalDocuments = (request?.documents || []).filter(
    (doc) => !doc?.documentType || doc.documentType === 'general'
  );
  const internshipDocuments = (request?.documents || []).filter(
    (doc) => doc?.documentType === 'internship_receipt'
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          pb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
          รายละเอียดคำร้องขอจบการศึกษา
        </Typography>
        <Button onClick={onClose} size="small" sx={{ minWidth: 'auto' }}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 300px' }, gap: 3 }}>
          {/* Main Content */}
          <Box>
            {/* Progress Timeline */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
              <ProgressTimeline steps={timelineSteps} variant="vertical" />
            </Paper>

            {/* Documents Section */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
                เอกสารที่อัปโหลด
              </Typography>

              {/* General Documents */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#475569' }}>
                  เอกสารทั่วไป ({generalDocuments.length})
                </Typography>
                {generalDocuments.length > 0 ? (
                  <TableContainer sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>ชื่อไฟล์</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>วันที่อัปโหลด</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                            ดาวน์โหลด
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {generalDocuments.map((doc) => (
                          <TableRow key={doc.id || doc.fileName}>
                            <TableCell sx={{ color: '#334155', fontSize: '14px' }}>
                              {doc.originalName}
                            </TableCell>
                            <TableCell sx={{ color: '#64748b', fontSize: '14px' }}>
                              {formatThaiDateTime(doc.uploadedAt)}
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                component="a"
                                href={getDocumentUrl(doc)}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                startIcon={<DownloadIcon />}
                                sx={{
                                  textTransform: 'none',
                                  fontSize: '12px',
                                  color: '#3b82f6',
                                }}
                              >
                                ดู
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    ยังไม่มีเอกสารทั่วไป
                  </Typography>
                )}
              </Box>

              {/* Internship Documents */}
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#475569' }}>
                  สลิปค่าออกฝึก ({internshipDocuments.length})
                </Typography>
                {internshipDocuments.length > 0 ? (
                  <TableContainer sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>ชื่อไฟล์</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>วันที่อัปโหลด</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                            ดาวน์โหลด
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {internshipDocuments.map((doc) => (
                          <TableRow key={doc.id || doc.fileName}>
                            <TableCell sx={{ color: '#334155', fontSize: '14px' }}>
                              {doc.originalName}
                            </TableCell>
                            <TableCell sx={{ color: '#64748b', fontSize: '14px' }}>
                              {formatThaiDateTime(doc.uploadedAt)}
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                component="a"
                                href={getDocumentUrl(doc)}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                startIcon={<DownloadIcon />}
                                sx={{
                                  textTransform: 'none',
                                  fontSize: '12px',
                                  color: '#3b82f6',
                                }}
                              >
                                ดู
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    ยังไม่มีสลิปค่าออกฝึก
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Sidebar: Request Info */}
          <Box>
            <Paper
              elevation={0}
              sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', position: 'sticky', top: 20 }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
                ข้อมูลคำร้อง
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                  สถานะ
                </Typography>
                <Chip
                  label={request.status}
                  sx={{
                    backgroundColor: getStatusBgColor(request.status),
                    color: getStatusColor(request.status),
                    fontWeight: 600,
                    border: `1.5px solid ${getStatusColor(request.status)}`,
                  }}
                />
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    ปีการศึกษา
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#334155' }}>
                    {request.academicYear || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    ภาคเรียน
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#334155' }}>
                    {request.semester || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    วันที่ยื่น
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#334155' }}>
                    {formatThaiDateTime(request.createdAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    อัปเดตล่าสุด
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#334155' }}>
                    {formatThaiDateTime(request.updatedAt)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    ความก้าวหน้า
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={`${timelineSteps.filter((s) => s.status === 'approved').length} อนุมัติ`}
                      size="small"
                      sx={{ backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 600 }}
                    />
                    <Chip
                      label={`${timelineSteps.filter((s) => s.status === 'rejected').length} ปฏิเสธ`}
                      size="small"
                      sx={{ backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#64748b' }} fullWidth>
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StudentRequestDetailModal;
