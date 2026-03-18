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
import DescriptionIcon from '@mui/icons-material/Description';
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, getRequestById, updateRequestStep } from "../../services/api";

const stepLabels = {
  advisor: "ที่ปรึกษา",
  grade_check: "เกรด",
  file_check: "ตรวจสอบไฟล์",
  tuition_check: "ค่าลงทะเบียนเรียน",
  internship_fee_check: "ค่าออกฝึก",
  library_check: "ห้องสมุด",
  activity_general_check: "กิจกรรมกลาง",
  activity_faculty_check: "กิจกรรมคณะ",
  digital_exam_check: "สอบดิจิทัล",
  language_center: "ศูนย์ภาษา",
};

const workflowOrder = [
  'file_check',
  'tuition_check',
  'grade_check',
  'internship_fee_check',
  'library_check',
  'activity_general_check',
  'activity_faculty_check',
  'digital_exam_check',
  'language_center',
  'advisor',
];

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

const getDocumentUrl = (document) => {
  if (!document?.url) return '';
  if (String(document.url).startsWith('http')) return document.url;
  return `${API_BASE_URL}${document.url}`;
};

const formatThaiDateTime = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdvisorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
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

  const fetchRequest = async () => {
    try {
      const data = await getRequestById(id);
      setRequestData(data);
    } catch (error) {
      console.error('Failed to fetch request detail:', error);
      if (error?.response?.status === 404) {
        setDialogMessage('ไม่พบข้อมูลคำร้องนี้ (อาจเป็นลิงก์เก่าหลังรีสตาร์ทระบบ)');
      } else if (error?.response?.status === 403) {
        setDialogMessage('ไม่มีสิทธิ์เข้าดูคำร้องนี้ กรุณาเข้าสู่ระบบใหม่');
      } else {
        setDialogMessage('ไม่สามารถโหลดข้อมูลคำร้องได้');
      }
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const items = useMemo(() => {
    const steps = requestData?.steps || {};
    return workflowOrder.filter((stepKey) => stepLabels[stepKey]).map((stepKey) => ({
      key: stepKey,
      name: stepLabels[stepKey],
      status: steps?.[stepKey]?.status || 'waiting',
      comment: steps?.[stepKey]?.comment || '',
      updatedAt: steps?.[stepKey]?.updatedAt || null,
    }));
  }, [requestData]);

  const generalDocuments = useMemo(() => {
    const documents = Array.isArray(requestData?.documents) ? requestData.documents : [];
    return documents.filter((document) => {
      const type = String(document?.documentType || '').trim().toLowerCase();
      return type === '' || type === 'general';
    });
  }, [requestData]);

  const internshipReceiptDocuments = useMemo(() => {
    const documents = Array.isArray(requestData?.documents) ? requestData.documents : [];
    return documents.filter((document) =>
      String(document?.documentType || '').trim().toLowerCase() === 'internship_receipt'
    );
  }, [requestData]);

  const updateAdvisorStep = async (status, comment = '') => {
    const actorUserId = currentUser?.id;
    if (!actorUserId) {
      setDialogMessage('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      setDialogOpen(true);
      return;
    }
    if (!['Advisor', 'Admin'].includes(String(currentUser?.role || ''))) {
      setDialogMessage('บัญชีนี้ไม่มีสิทธิ์อัปเดตผลตรวจของอาจารย์ที่ปรึกษา');
      setDialogOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateRequestStep(id, {
        step: 'grade_check',
        status,
        comment,
        userId: actorUserId,
      });
      await fetchRequest();
      setDialogMessage(status === 'approved' ? 'อนุมัติสำเร็จ' : 'ปฏิเสธสำเร็จ');
      setDialogOpen(true);
    } catch (error) {
      console.error('Failed to update advisor step:', error);
      setDialogMessage('อัปเดตสถานะไม่สำเร็จ');
      setDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
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
          onClick={() => navigate('/advisor')}
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
                    display: 'grid',
                    gap: 1
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
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
                    <Typography variant="caption" color="#64748b">
                      อัปเดตล่าสุด: {formatThaiDateTime(item.updatedAt)}
                    </Typography>
                    {item.comment ? (
                      <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 500 }}>
                        หมายเหตุ: {item.comment}
                      </Typography>
                    ) : null}
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
                ไฟล์ที่นักศึกษาอัปโหลด
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 2, bgcolor: '#f8fafc' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#334155', fontWeight: 700 }}>
                    ดูสลิปค่าออกฝึก
                  </Typography>
                  {internshipReceiptDocuments.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[...internshipReceiptDocuments].reverse().map((doc) => (
                        <Box
                          key={doc.id || doc.fileName}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                            p: 1.5,
                            border: '1px solid #e2e8f0',
                            borderRadius: 2,
                            bgcolor: '#ffffff'
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: '#0f172a', fontWeight: 600 }} noWrap>
                              {doc.originalName || 'สลิปค่าออกฝึก'}
                            </Typography>
                            <Typography variant="caption" color="#64748b">
                              อัปโหลดเมื่อ: {formatThaiDateTime(doc.uploadedAt)}
                            </Typography>
                          </Box>
                          <Button
                            component="a"
                            href={getDocumentUrl(doc)}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<DescriptionIcon fontSize="small" />}
                            sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                          >
                            ดูสลิป
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="#64748b">ยังไม่มีสลิปค่าออกฝึก</Typography>
                  )}
                </Box>

                <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 2, bgcolor: '#f8fafc' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#334155', fontWeight: 700 }}>
                    ดูเอกสารทั่วไป
                  </Typography>
                  {generalDocuments.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[...generalDocuments].reverse().map((doc) => (
                        <Box
                          key={doc.id || doc.fileName}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                            p: 1.5,
                            border: '1px solid #e2e8f0',
                            borderRadius: 2,
                            bgcolor: '#ffffff'
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: '#0f172a', fontWeight: 600 }} noWrap>
                              {doc.originalName || 'เอกสารทั่วไป'}
                            </Typography>
                            <Typography variant="caption" color="#64748b">
                              อัปโหลดเมื่อ: {formatThaiDateTime(doc.uploadedAt)}
                            </Typography>
                          </Box>
                          <Button
                            component="a"
                            href={getDocumentUrl(doc)}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<DescriptionIcon fontSize="small" />}
                            sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                          >
                            ดูเอกสาร
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="#64748b">ยังไม่มีเอกสารทั่วไป</Typography>
                  )}
                </Box>
              </Box>
            </Paper>

            {/* Advisor Action Section */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ส่วนสำหรับอาจารย์ที่ปรึกษา</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => updateAdvisorStep('approved')}
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
                <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: '#e0f7fa', color: '#064460', fontSize: 32 }}>
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
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="#64748b">ปีการศึกษา</Typography>
                  <Typography variant="body2" fontWeight="600" color="#334155">{requestData.academicYear || '-'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="#64748b">ภาคเรียน</Typography>
                  <Typography variant="body2" fontWeight="600" color="#334155">{requestData.semester || '-'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="#64748b">คณะ</Typography>
                  <Typography variant="body2" fontWeight="600" color="#334155">{requestData.User?.faculty || '-'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="#64748b">สาขา</Typography>
                  <Typography variant="body2" fontWeight="600" color="#334155">{requestData.User?.branch || '-'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="#64748b">วันที่ยื่น</Typography>
                  <Typography variant="body2" fontWeight="600" color="#334155">{formatThaiDateTime(requestData.createdAt)}</Typography>
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
          <Button
            onClick={() => {
              if (!rejectReason.trim()) {
                setDialogMessage("กรุณากรอกหมายเหตุ");
                setDialogOpen(true);
                return;
              }
              setOpenRejectDialog(false);
              updateAdvisorStep('rejected', rejectReason.trim());
            }}
            variant="contained"
            color="error"
            disableElevation
            disabled={isSubmitting}
          >
            ยืนยันปฏิเสธ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generic Message Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          if (dialogMessage.includes("สำเร็จ") || dialogMessage.includes("ไม่พบข้อมูลคำร้อง") || dialogMessage.includes("ไม่มีสิทธิ์")) {
            navigate("/advisor");
          }
        }}
        fullWidth
        maxWidth="xs"
      >
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
                navigate("/advisor");
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
    </Box >
  );
}
