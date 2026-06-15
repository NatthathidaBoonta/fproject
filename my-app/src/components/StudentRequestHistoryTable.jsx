import React from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { statusConfig } from '../constants/stepConfig';

export default function StudentRequestHistoryTable({
  submissionHistory = [],
  onViewDetail,
  canSubmitForReview,
  onSubmit,
  loading,
  currentRequest,
  shouldHideSubmitAction,
  submitButtonLabel,
  requestHintText,
  onDownloadPdf,
}) {
  const isCompleted = currentRequest?.status === 'Completed';

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography variant="h6" fontWeight="700" sx={{ color: '#0f172a' }}>
          ประวัติการยื่นคำร้อง
        </Typography>

        {isCompleted && (
          <Button
            variant="contained"
            color="success"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => onDownloadPdf(currentRequest)}
            sx={{
              bgcolor: '#16a34a',
              '&:hover': { bgcolor: '#15803d' },
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            ดาวน์โหลดใบรับรองสำเร็จ (PDF)
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>วันที่ยื่น</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>สถานะ</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>วันที่ตีกลับ</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>หมายเหตุ</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissionHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748b' }}>
                    ยังไม่มีประวัติการยื่นคำร้อง
                  </TableCell>
                </TableRow>
              ) : (
                submissionHistory.map((history) => {
                  const status = history.status || 'waiting';
                  const config = statusConfig[status] || statusConfig.waiting;
                  return (
                    <TableRow key={history.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>{history.date}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={config.label}
                          size="small"
                          sx={{
                            backgroundColor: config.bg,
                            color: config.text,
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            borderRadius: 1.5,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          color: status === 'rejected' ? '#dc2626' : 'text.secondary',
                          py: 1.5,
                        }}
                      >
                        {history.rejectedDate || '-'}
                      </TableCell>
                      <TableCell sx={{ minWidth: 240, color: 'text.primary', py: 1.5 }}>
                        {history.remark || '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Button
                          size="small"
                          onClick={() => onViewDetail(history)}
                          sx={{
                            color: '#064460',
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            bgcolor: '#eff6ff',
                            '&:hover': { bgcolor: '#dbeafe' },
                            borderRadius: 1.5,
                            px: 2,
                          }}
                        >
                          ดูรายละเอียด
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>

      {/* Action Buttons */}
      {!shouldHideSubmitAction && (
        <Box>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SendIcon />}
            onClick={onSubmit}
            disabled={!canSubmitForReview || loading}
            sx={{
              background: canSubmitForReview
                ? 'linear-gradient(135deg, #064460 0%, #095a80 100%)'
                : '#f1f5f9',
              color: canSubmitForReview ? 'white' : '#94a3b8',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 3,
              py: 1.5,
              boxShadow: canSubmitForReview ? '0 10px 20px rgba(6, 68, 96, 0.15)' : 'none',
              '&:hover': {
                background: canSubmitForReview
                  ? 'linear-gradient(135deg, #095a80 0%, #042d40 100%)'
                  : '#f1f5f9',
              },
            }}
          >
            {canSubmitForReview
              ? currentRequest?.status === 'Rejected'
                ? 'ยื่นใหม่ (เฉพาะส่วนที่ไม่ผ่าน)'
                : 'ส่งคำร้องไปยังหน่วยงานตรวจสอบ'
              : submitButtonLabel}
          </Button>
        </Box>
      )}

      <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mt: 1.5, pl: 1 }}>
        💡 {requestHintText}
      </Typography>
    </Box>
  );
}
