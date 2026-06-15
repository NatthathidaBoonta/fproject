import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  IconButton,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DomainIcon from '@mui/icons-material/Domain';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupIcon from '@mui/icons-material/Group';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getRequests } from "../../services/api";
import { exportToCSV } from "../../services/csvExport";


const mapOverallStatusToUi = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'completed') return 'passed';
  if (normalized === 'rejected') return 'rejected';
  return 'waiting';
};

const statusConfig = {
  waiting: { label: "รอดำเนินการ", bg: "#FFFBEB", color: "#B45309" }, // Amber
  passed: { label: "ผ่าน", bg: "#ECFDF5", color: "#15803D" }, // Green
  rejected: { label: "ไม่ผ่าน", bg: "#FEF2F2", color: "#B91C1C" }, // Red
};

// Reusable StatCard Component
const StatCard = ({ icon, title, count, color }) => (
  <Card sx={{
    height: '100%',
    borderRadius: 4,
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: `0 10px 25px ${alpha(color, 0.2)}`
    },
    position: 'relative',
    overflow: 'hidden'
  }}>
    <Box sx={{
      position: 'absolute',
      top: -10,
      right: -10,
      width: 100,
      height: 100,
      borderRadius: '50%',
      bgcolor: alpha(color, 0.1),
      zIndex: 0
    }} />
    <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: alpha(color, 0.1),
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2
        }}>
          {icon}
        </Box>
        <Typography variant="body2" fontWeight="600" color="text.secondary">{title}</Typography>
      </Box>
      <Typography variant="h3" fontWeight="800" color="text.primary">
        {count}
      </Typography>
    </CardContent>
  </Card>
);

export default function OfficeDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tempComment, setTempComment] = useState("");

  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const data = await getRequests({ submittedOnly: true });
      // Map backend model to component state structure
      const mapped = data.map(r => ({
        id: r.id,
        studentId: r.studentId,
        name: r.User?.name || "ไม่ทราบชื่อ",
        faculty: r.User?.faculty || "ไม่ทราบคณะ",
        branch: r.User?.branch || "ไม่ทราบสาขา",
        academicYear: r.academicYear,
        status: mapOverallStatusToUi(r.status),
        date: new Date(r.createdAt).toLocaleDateString('th-TH'),
        steps: r.steps
      }));
      setStudents(mapped);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleExportReport = () => {
    exportToCSV(filteredStudents, `รายงานภาพรวมคำร้องขอจบ_${statusFilter || 'ทั้งหมด'}.csv`);
  };


  const handleRadioChange = (student, value) => {
    // This dashboard is an overview, detailed actions are in sub-pages
    // but we can allow navigation or quick updates if needed.
    navigate(`/office/${student.id}`);
  };

  const handleSave = () => {
    if (!tempComment.trim()) return;
    updateStatus(selectedStudent.id, "rejected", tempComment);
    setDialogOpen(false);
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: students.length,
      waiting: students.filter(s => s.status === 'waiting').length,
      passed: students.filter(s => s.status === 'passed').length,
      rejected: students.filter(s => s.status === 'rejected').length
    };
  }, [students]);

  // Use Admin Color Palette
  const THEME_GRADIENT = "linear-gradient(to right, #F1BA04, #F9C824, #F9DB76)";

  // Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.includes(searchTerm) || student.studentId.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  // Grouping Logic: Faculty -> Branch -> Academic Year -> Students
  const groupedData = useMemo(() => {
    const groups = {};
    filteredStudents.forEach(student => {
      const fac = student.faculty || 'อื่นๆ';
      const branch = student.branch || 'สาขาทั่วไป';
      const year = student.academicYear || 'ไม่ระบุ';

      if (!groups[fac]) groups[fac] = {};
      if (!groups[fac][branch]) groups[fac][branch] = {};
      if (!groups[fac][branch][year]) groups[fac][branch][year] = [];

      groups[fac][branch][year].push(student);
    });

    return groups;
  }, [filteredStudents]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffffff', p: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="800" color="#1e293b" gutterBottom>
            ระบบบริหารจัดการและตรวจสอบคำร้องของนักศึกษา
          </Typography>
        </Box>

        {/* Agency Selection Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" color="#1e293b" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DomainIcon color="primary" /> เลือกหน่วยงานที่ต้องการจัดการ
          </Typography>
          <Grid container spacing={2}>
            {[
              { title: "งานกิจกรรมนักศึกษา", path: "/office/eventh", icon: <CalendarMonthIcon />, color: "#3b82f6" },
              { title: "งานทะเบียนและวัดผล", path: "/office/registration", icon: <CheckCircleIcon />, color: "#10b981" },
              { title: "ศูนย์ภาษา", path: "/office/language", icon: <GroupIcon />, color: "#8b5cf6" },
              { title: "งานประชาสัมพันธ์", path: "/office/information", icon: <PendingActionsIcon />, color: "#f59e0b" },
              { title: "สำนักวิทยบริการ", path: "/office/library", icon: <DomainIcon />, color: "#64748b" },
            ].map((agency) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={agency.path}>
                <Card
                  onClick={() => navigate(agency.path)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      borderColor: agency.color
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ color: agency.color, mb: 1 }}>{agency.icon}</Box>
                    <Typography variant="body2" fontWeight="bold">{agency.title}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Stats Grid - Using reusable component */}
        <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }} >
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<GroupIcon fontSize="large" />}
              title="คำร้องทั้งหมด (ภาพรวม)"
              count={stats.total}
              color="#3b82f6" // Blue
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<PendingActionsIcon fontSize="large" />}
              title="รอตรวจสอบ"
              count={stats.waiting}
              color="#f59e0b" // Amber
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<CheckCircleIcon fontSize="large" />}
              title="อนุมัติแล้ว"
              count={stats.passed}
              color="#10b981" // Emerald
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<CancelIcon fontSize="large" />}
              title="ไม่ผ่าน"
              count={stats.rejected}
              color="#ef4444" // Red
            />
          </Grid>
        </Grid>

        {/* Main Content Area */}
        <Paper elevation={0} sx={{
          p: 3,
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          bgcolor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Filters */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="ค้นหาชื่อ หรือ รหัสนักศึกษา..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1, minWidth: 250, maxWidth: 400 }}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>สถานะคำร้อง</InputLabel>
              <Select value={statusFilter} label="สถานะคำร้อง" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="passed">ผ่าน</MenuItem>
                <MenuItem value="waiting">รอดำเนินการ</MenuItem>
                <MenuItem value="rejected">ไม่ผ่าน</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportReport}
              sx={{ borderRadius: 2, height: 40 }}
            >
              ส่งออกรายงาน CSV
            </Button>
          </Box>


          {/* Render Grouping: Faculty > Branch > Year */}
          {Object.keys(groupedData).length > 0 ? (
            Object.keys(groupedData).sort().map(faculty => (
              <Box key={faculty} sx={{ mb: 3 }}>
                <Accordion elevation={0} sx={{
                  border: '1px solid #e2e8f0', borderRadius: '16px !important', overflow: 'hidden', mb: 1,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  '&:before': { display: 'none' }
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{
                    background: THEME_GRADIENT,
                    color: 'white',
                    minHeight: 56,
                    '& .MuiAccordionSummary-content': { my: 1 }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DomainIcon />
                      <Typography variant="h6" fontWeight="bold">{faculty}</Typography>
                      <Chip
                        label={`${Object.values(groupedData[faculty]).reduce((acc, branch) => acc + Object.values(branch).flat().length, 0)} คน`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                      />
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 2, bgcolor: '#f8fafc' }}>
                    {/* Iterate Branches */}
                    {Object.keys(groupedData[faculty]).sort().map(branch => (
                      <Accordion key={branch} elevation={0} sx={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px !important',
                        overflow: 'hidden',
                        mb: 2,
                        '&:before': { display: 'none' }
                      }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'white', borderBottom: '1px solid #f1f5f9' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="#334155">{branch}</Typography>
                            <Chip
                              label={`${Object.values(groupedData[faculty][branch]).flat().length} คน`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, borderColor: '#cbd5e1' }}
                            />
                          </Box>
                        </AccordionSummary>

                        <AccordionDetails sx={{ p: 2, bgcolor: 'white' }}>
                          {/* Iterate Academic Years (Sorted Descending) */}
                          {Object.keys(groupedData[faculty][branch]).sort().reverse().map(year => {
                            const studentsInYear = groupedData[faculty][branch][year];
                            return (
                              <Box key={year} sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                  <CalendarMonthIcon fontSize="small" sx={{ color: '#F9C824' }} />
                                  <Typography variant="subtitle2" fontWeight="bold" color="#F9C824">ปีการศึกษา {year}</Typography>
                                  <Typography variant="caption" color="text.secondary">({studentsInYear.length} รายการ)</Typography>
                                </Box>

                                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                                  <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                      <TableRow>
                                        <TableCell width="15%" sx={{ fontWeight: 'bold', color: '#475569' }}>รหัสนักศึกษา</TableCell>
                                        <TableCell width="25%" sx={{ fontWeight: 'bold', color: '#475569' }}>ชื่อ-นามสกุล</TableCell>
                                        {/* Removed Branch Column as it's grouped */}
                                        <TableCell width="15%" align="center" sx={{ fontWeight: 'bold', color: '#475569' }}>สถานะ</TableCell>
                                        <TableCell width="25%" align="center" sx={{ fontWeight: 'bold', color: '#475569' }}>ผ่าน &nbsp;&nbsp; ไม่ผ่าน</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {studentsInYear.map((student) => (
                                        <TableRow
                                          key={student.id}
                                          hover
                                          onClick={() => navigate(`/office/${student.id}`)}
                                          sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            bgcolor: 'white',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s',
                                            '&:hover': { bgcolor: '#f1f5f9' }
                                          }}
                                        >
                                          <TableCell>{student.studentId}</TableCell>
                                          <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                              <Avatar sx={{ width: 28, height: 28, bgcolor: '#e0f7fa', color: '#064460', fontSize: 12 }}>{student.name[0]}</Avatar>
                                              <Typography variant="body2" fontWeight="500" color="#1e293b">{student.name}</Typography>
                                            </Box>
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip label={statusConfig[student.status].label} size="small" sx={{ bgcolor: statusConfig[student.status].bg, color: statusConfig[student.status].color, fontWeight: 700, borderRadius: 1, fontSize: '0.75rem', height: 24 }} />
                                          </TableCell>
                                          <TableCell align="center">
                                            <Box onClick={(e) => e.stopPropagation()}>
                                              <RadioGroup
                                                row
                                                name={`status-group-${student.id}`}
                                                value={student.status}
                                                onChange={(e) => handleRadioChange(student, e.target.value)}
                                                sx={{ justifyContent: 'center', gap: 4 }}
                                              >
                                                <Radio value="passed" size="small" sx={{ p: 0.5, '&.Mui-checked': { color: '#10b981' } }} />
                                                <Radio value="rejected" size="small" sx={{ p: 0.5, '&.Mui-checked': { color: '#ef4444' } }} />
                                              </RadioGroup>
                                            </Box>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            );
                          })}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#f9fafb', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
              <Typography color="text.secondary">ไม่พบข้อมูลคำร้องในขณะนี้</Typography>
            </Box>
          )}
        </Paper>
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>ระบุหมายเหตุ (ไม่ผ่าน)</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" label="หมายเหตุ / ทวนสอบ" fullWidth multiline rows={3}
            variant="outlined"
            value={tempComment} onChange={(e) => setTempComment(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleSave} variant="contained" color="error" disabled={!tempComment.trim()}>บันทึกรายการ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
