import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Container,
  Paper,
  Divider,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, getRequestById, updateRequestStep } from "../../services/api";

const stepLabels = {
  advisor: "ที่ปรึกษา",
  library_check: "ห้องสมุด",
  digital_exam_check: "สอบดิจิทัล",
  language_center: "ศูนย์ภาษา",
  registration: "ฝ่ายทะเบียน",
  activity_center: "ฝ่ายกิจกรรม",
};

const deptStepMap = {
  "ฝ่ายทะเบียน": "registration",
  "ฝ่ายศูนย์ภาษา": "language_center",
  "ศูนย์ภาษา": "language_center",
  "ฝ่ายกิจกรรม": "activity_center",
  "ฝ่ายวิทยบริการและเทคโนโลยี": "library_check",
};

const statusLabel = {
  waiting: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  approved: "ผ่าน",
  rejected: "ไม่ผ่าน",
};

const chipStyleByStatus = {
  approved: { bgcolor: '#dcfce7', color: '#166534' },
  rejected: { bgcolor: '#fee2e2', color: '#991b1b' },
  in_progress: { bgcolor: '#dbeafe', color: '#1d4ed8' },
  waiting: { bgcolor: '#fef9c3', color: '#854d0e' },
};

export default function OfficeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const currentStep = deptStepMap[currentUser?.deptName] || 'registration';
  const latestDocument = useMemo(() => {
    if (!Array.isArray(requestData?.documents) || requestData.documents.length === 0) {
      return null;
    }
    return requestData.documents[requestData.documents.length - 1];
  }, [requestData]);

  const getDocumentUrl = (document) => {
    if (!document?.url) return '';
    if (String(document.url).startsWith('http')) return document.url;
    return `${API_BASE_URL}${document.url}`;
  };

  const items = useMemo(() => {
    const steps = requestData?.steps || {};
    return Object.keys(stepLabels).map((stepKey) => ({
      key: stepKey,
      name: stepLabels[stepKey],
      status: steps?.[stepKey]?.status || 'waiting',
    }));
  }, [requestData]);

  const fetchRequest = async () => {
    try {
      const data = await getRequestById(id);
      setRequestData(data);
    } catch (error) {
      console.error('Failed to fetch request detail:', error);
      setDialogMessage('ไม่สามารถโหลดข้อมูลคำร้องได้');
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const updateOfficeStep = async (status, comment = '') => {
    setIsSubmitting(true);
    try {
      await updateRequestStep(id, {
        step: currentStep,
        status,
        comment,
        userId: currentUser?.id || 'office_system',
      });
      await fetchRequest();
      setDialogMessage(status === 'approved' ? 'อนุมัติสำเร็จ' : 'ปฏิเสธสำเร็จ');
      setDialogOpen(true);
    } catch (error) {
      console.error('Failed to update office step:', error);
      setDialogMessage('อัปเดตสถานะไม่สำเร็จ');
      setDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveClick = () => {
    setOpenApproveDialog(true);
  };

  const confirmApprove = () => {
    setOpenApproveDialog(false);
    updateOfficeStep('approved');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setDialogMessage("กรุณาใส่หมายเหตุเหตุผลที่ปฏิเสธ");
      setDialogOpen(true);
      return;
    }
    setOpenRejectDialog(false);
    updateOfficeStep('rejected', rejectReason.trim());
  };

  if (loading) {
    return <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>;
  }

  if (!requestData) {
    return <div>ไม่พบข้อมูลนักศึกษา</div>;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', pb: 10 }}>
      {/* Header */}
      <Box sx={{ py: 3, px: 4, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          onClick={() => navigate('/office')}
          startIcon={<ArrowBackIcon />}
          sx={{ color: '#64748b', textTransform: 'none', '&:hover': { bgcolor: '#f1f5f9' } }}
        >
          กลับหน้าแดชบอร์ด
        </Button>
        <Typography variant="h6" fontWeight="bold" color="#334155">
          รายละเอียดคำร้อง
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 350px' }, gap: 4 }}>

          {/* Main Content: Checklist */}
          <Box>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1e293b' }}>
                รายการตรวจสอบ
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {items.map((item, index) => (
                  <Box key={index} sx={{
                    p: 2,
                    borderRadius: 3,
                    bg: '#fff',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography sx={{ color: '#334155', fontWeight: 500 }}>{item.name}</Typography>
                    <Chip
                      label={statusLabel[item.status] || statusLabel.waiting}
                      size="small"
                      sx={{
                        ...(chipStyleByStatus[item.status] || chipStyleByStatus.waiting),
                        fontWeight: 700,
                        borderRadius: 1
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {latestDocument && (
                <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                  <Typography variant="body2" fontWeight="bold" color="#334155" sx={{ mb: 1 }}>
                    เอกสารที่นิสิตอัปโหลดล่าสุด
                  </Typography>
                  <Typography variant="caption" color="#64748b" sx={{ display: 'block', mb: 1.5 }}>
                    {latestDocument.originalName} • {new Date(latestDocument.uploadedAt).toLocaleDateString('th-TH')}
                  </Typography>
                  <Button
                    component="a"
                    href={getDocumentUrl(latestDocument)}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none', borderColor: '#16a34a', color: '#166534' }}
                  >
                    เปิดดูเอกสาร
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Office Action Section */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                ส่วนสำหรับเจ้าหน้าที่ ({stepLabels[currentStep]})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleApproveClick}
                  disabled={isSubmitting}
                  disableElevation
                  startIcon={<CheckCircleIcon />}
                  sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, borderRadius: 2, px: 3 }}
                >
                  อนุมัติคำร้อง
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={isSubmitting}
                  onClick={() => setOpenRejectDialog(true)}
                  startIcon={<CancelIcon />}
                  sx={{ borderRadius: 2, px: 3, borderColor: '#ef4444', color: '#ef4444' }}
                >
                  ปฏิเสธ / ส่งแก้ไข
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Sidebar: Student Info */}
          <Box>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white', position: 'sticky', top: 20 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 32 }}>
                  {(requestData.User?.name || '?').charAt(0)}
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="#1e293b">{requestData.User?.name || '-'}</Typography>
                <Typography variant="body2" color="#64748b">{requestData.studentId}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="#64748b">ประเภท</Typography>
                  <Typography variant="body2" fontWeight="600" color="#334155">ปกติ</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="#64748b">สถานะคำร้อง</Typography>
                  <Typography variant="body2" fontWeight="600" color="#334155">{requestData.status}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

        </Box>
      </Container>

      {/* Dialog สำหรับใส่หมายเหตุเมื่อปฏิเสธ */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>ปฏิเสธการอนุมัติ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="หมายเหตุ (บังคับ)"
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="กรุณาระบุเหตุผลที่ปฏิเสธ..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRejectDialog(false)} sx={{ color: '#64748b' }}>ยกเลิก</Button>
          <Button onClick={handleReject} variant="contained" color="error" disableElevation disabled={!rejectReason.trim() || isSubmitting}>
            ยืนยันปฏิเสธ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog สำหรับยืนยันการอนุมัติ */}
      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>ยืนยันการอนุมัติ</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            คุณต้องการอนุมัติคำร้องนี้ผ่านใช่หรือไม่?
          </Typography>
          <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, display: 'inline-block' }}>
            <Typography variant="subtitle2" color="text.secondary">
              รหัสนักศึกษา: <Typography component="span" fontWeight="bold" color="text.primary">{requestData?.studentId}</Typography>
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              ชื่อ-นามสกุล: <Typography component="span" fontWeight="bold" color="text.primary">{requestData?.User?.name || '-'}</Typography>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenApproveDialog(false)} sx={{ color: '#64748b' }}>ยกเลิก</Button>
          <Button onClick={confirmApprove} variant="contained" color="success" disableElevation disabled={isSubmitting} sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
            ยืนยันอนุมัติ
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
            แจ้งเตือน
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
            {dialogMessage}
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setDialogOpen(false);
              if (dialogMessage.includes("สำเร็จ")) {
                navigate("/office");
              }
            }}
            sx={{
              bgcolor: '#064460',
              color: 'white',
              borderRadius: 2,
              '&:hover': { bgcolor: '#04364e' }
            }}
          >
            ตกลง
          </Button>
        </Box>
      </Dialog>

    </Box>
  );
}
