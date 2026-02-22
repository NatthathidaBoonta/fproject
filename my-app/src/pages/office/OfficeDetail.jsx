import React, { useState } from "react";
import {
  Typography,
  Avatar,
  Box,
  Button,
  Chip,
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

const mockStudents = [
  {
    id: 1,
    name: "ณัฏฐธิดา บุญทา",
    studentId: "6610014114",
    type: "ปกติ",
    status: "กำลังศึกษา",
    items: [
      "โครงสร้างหลักสูตร",
      "ห้องสมุด",
      "กิจกรรม",
      "สอบดิจิทัล",
      "สอบอังกฤษ",
      "เอกสารที่อัปโหลด",
      "ชำระค่าออกฝึก",
    ],
  },
];

const StatusChip = ({ label, color }) => (
  <Chip label={label} sx={{ backgroundColor: color, color: "#000" }} />
);

export default function OfficeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const student = mockStudents.find((s) => s.id === Number(id));
  const [officeStatus, setOfficeStatus] = useState("waiting");
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    setOfficeStatus("passed");
    alert("อนุมัติสำเร็จ");
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert("กรุณาใส่หมายเหตุเหตุผลที่ปฏิเสธ");
      return;
    }
    setOfficeStatus("rejected");
    setOpenRejectDialog(false);
    alert(`ปฏิเสธสำเร็จ\nหมายเหตุ: ${rejectReason}`);
  };

  if (!student) {
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
                {student.items.map((item, index) => (
                  <Box key={index} sx={{
                    p: 2,
                    borderRadius: 3,
                    bg: '#fff',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography sx={{ color: '#334155', fontWeight: 500 }}>{item}</Typography>
                    <Chip label="ผ่าน" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, borderRadius: 1 }} />
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Office Action Section */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ส่วนสำหรับเจ้าหน้าที่</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleApprove}
                  disableElevation
                  startIcon={<CheckCircleIcon />}
                  sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, borderRadius: 2, px: 3 }}
                >
                  อนุมัติคำร้อง
                </Button>
                <Button
                  variant="outlined"
                  color="error"
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
                  {student.name.charAt(0)}
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="#1e293b">{student.name}</Typography>
                <Typography variant="body2" color="#64748b">{student.studentId}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="#64748b">ประเภท</Typography>
                  <Typography variant="body2" fontWeight="600" color="#334155">{student.type}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="#64748b">สถานะการศึกษา</Typography>
                  <Typography variant="body2" fontWeight="600" color="#334155">{student.status}</Typography>
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
          <Button onClick={handleReject} variant="contained" color="error" disableElevation disabled={!rejectReason.trim()}>
            ยืนยันปฏิเสธ
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
