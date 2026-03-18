import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupIcon from '@mui/icons-material/Group';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import { getRequests } from "../../services/api";

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

export default function AdvisorDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const navigate = useNavigate();

  const fetchAdvisorData = async () => {
    try {
      const data = await getRequests();
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
        items: []
      }));
      setStudents(mapped);
    } catch (error) {
      console.error("Failed to fetch advisor data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisorData();
  }, []);

  // Use Admin Color Palette
  const THEME_COLOR = "#F9C824";
  const THEME_GRADIENT = "linear-gradient(to right, #F1BA04, #F9C824, #F9DB76)";

  // Stats for the summary cards
  const stats = useMemo(() => {
    return {
      total: students.length,
      waiting: students.filter(s => s.status === 'waiting').length,
      passed: students.filter(s => s.status === 'passed').length
    };
  }, [students]);

  // Extract unique academic years for the filter dropdown
  const years = useMemo(() => {
    const uniqueYears = [...new Set(students.map(s => s.academicYear))];
    return uniqueYears.sort((a, b) => b.localeCompare(a));
  }, [students]);

  // Filtered Data
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm) || student.studentId.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesYear = yearFilter === 'all' || student.academicYear === yearFilter;
    return matchesSearch && matchesStatus && matchesYear;
  });

  // Group by Student ID Prefix (Year) - e.g. "66..."
  const groupedStudents = useMemo(() => {
    return filteredStudents.reduce((groups, student) => {
      // Extract prefix from student ID (first 2 chars)
      const prefix = student.studentId ? student.studentId.substring(0, 2) : "Unknown";
      const groupKey = `${prefix}xxxxxxxxx`; // Label as "66xxxxxxxxx"

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(student);
      return groups;
    }, {});
  }, [filteredStudents]);

  const sortedSections = Object.keys(groupedStudents).sort();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', bgcolor: '#ffffff' }}>

          {/* Top Section: Header & Stats */}
          <Box sx={{ p: 4, borderBottom: '2px solid #e2e8f0' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="800" color="#1e293b" gutterBottom>
                ระบบติดตามและตรวจสอบสถานะนักศึกษาในที่ปรึกษา
              </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<GroupIcon fontSize="large" />}
                  title="นักศึกษาทั้งหมด"
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
                  count={students.filter(s => s.status === 'rejected').length}
                  color="#ef4444" // Red
                />
              </Grid>
            </Grid>
          </Box>

          {/* Filters & Table */}
          <Box sx={{ p: 4 }}>
            {/* Filter Bar */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="ค้นหาชื่อ หรือ รหัสนักศึกษา..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1, boxShadow: 1, minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, minWidth: { xs: '100%', md: 'auto' } }}>
                <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
                  <InputLabel>สถานะ</InputLabel>
                  <Select
                    value={statusFilter}
                    label="สถานะ"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    <MenuItem value="passed">ผ่าน</MenuItem>
                    <MenuItem value="waiting">รอดำเนินการ</MenuItem>
                    <MenuItem value="rejected">ไม่ผ่าน</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
                  <InputLabel>ปีการศึกษา</InputLabel>
                  <Select
                    value={yearFilter}
                    label="ปีการศึกษา"
                    onChange={(e) => setYearFilter(e.target.value)}
                  >
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    {years.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* List of Sections */}
            {sortedSections.length > 0 ? (
              sortedSections.map(section => (
                <Accordion key={section} defaultExpanded sx={{
                  mb: 2,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px !important',
                  overflow: 'hidden',
                  '&:before': { display: 'none' }
                }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                    sx={{
                      background: THEME_GRADIENT,
                      color: 'white',
                      px: 3,
                      borderBottom: '1px solid #f1f5f9',
                      '&.Mui-expanded': { borderBottom: '1px solid #e2e8f0' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={`รหัส ${section}`}
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            bgcolor: 'white',
                            color: THEME_COLOR,
                            height: 32
                          }}
                        />
                        <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                          ({groupedStudents[section].length} คน)
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 0 }}>
                    <Table>
                      <TableHead sx={{ bgcolor: 'white' }}>
                        <TableRow>
                          <TableCell width="30%" sx={{ fontWeight: 'bold', color: '#475569', pl: 3 }}>รหัสนักศึกษา</TableCell>
                          <TableCell width="35%" sx={{ fontWeight: 'bold', color: '#475569' }}>ชื่อ-นามสกุล</TableCell>
                          <TableCell width="20%" sx={{ fontWeight: 'bold', color: '#475569' }}>สถานะ</TableCell>
                          <TableCell width="15%" sx={{ fontWeight: 'bold', color: '#475569', textAlign: 'center', pr: 3 }}>จัดการ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedStudents[section].map((student, index) => (
                          <TableRow
                            key={student.id}
                            hover
                            onClick={() => navigate(`/advisor/${student.id}`)}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              bgcolor: index % 2 === 0 ? '#fafafa' : 'white',
                              cursor: 'pointer', // Add cursor pointer
                              transition: 'background-color 0.2s', // Smooth transition
                              '&:hover': { bgcolor: '#f1f5f9' } // Hover effect
                            }}
                          >
                            <TableCell sx={{ pl: 3, color: '#334155' }}>{student.studentId}</TableCell>
                            <TableCell>
                              <Typography sx={{ color: '#0f172a', fontWeight: 500 }}>{student.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={statusConfig[student.status].label}
                                size="small"
                                sx={{
                                  bgcolor: statusConfig[student.status].bg,
                                  color: statusConfig[student.status].color,
                                  fontWeight: 600,
                                  borderRadius: '6px'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', pr: 3 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/advisor/${student.id}`);
                                }}
                                sx={{ color: '#64748b', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
                <Typography variant="h6">ไม่พบข้อมูลนักศึกษา</Typography>
                <Typography variant="body2">ลองปรับตัวกรองหรือคำค้นหาใหม่</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
