import React, { useState, useMemo, useEffect } from "react";
import {
  Box, Chip, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, TextField, InputAdornment, Grid, IconButton,
  Select, MenuItem, FormControl, InputLabel,
  Accordion, AccordionSummary, AccordionDetails,
  Card, CardContent, Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import InboxIcon from "@mui/icons-material/Inbox";
import SchoolIcon from "@mui/icons-material/School";
import { getRequests } from "../../services/api";

const THEME_GRADIENT = "linear-gradient(to right, #F1BA04, #F9C824, #F9DB76)";
const THEME_COLOR    = "#F9C824";

// สถานะที่ที่ปรึกษาเห็น = สถานะการอนุมัติของตัวเอง (grade_check)
const mapAdvisorStatus = (gradeCheckStatus) => {
  const s = String(gradeCheckStatus || "").toLowerCase();
  if (s === "approved")    return "approved";
  if (s === "rejected")    return "rejected";
  if (s === "in_progress") return "pending";
  return "pending";
};

const statusConfig = {
  pending:  { label: "รอการอนุมัติ",  bg: "#FFFBEB", color: "#B45309" },
  approved: { label: "อนุมัติแล้ว",   bg: "#ECFDF5", color: "#15803D" },
  rejected: { label: "ปฏิเสธ",        bg: "#FEF2F2", color: "#B91C1C" },
};

const StatCard = ({ icon, title, count, color }) => (
  <Card sx={{
    height: "100%", borderRadius: 4, border: "1px solid #f1f5f9",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)", transition: "all 0.3s ease",
    "&:hover": { transform: "translateY(-4px)", boxShadow: `0 10px 25px ${alpha(color, 0.2)}` },
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.1), color, display: "flex", mr: 2 }}>
          {icon}
        </Box>
        <Typography variant="body2" fontWeight="600" color="text.secondary">{title}</Typography>
      </Box>
      <Typography variant="h3" fontWeight="800" color="text.primary">{count}</Typography>
    </CardContent>
  </Card>
);

const DashboardSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 2, mb: 3 }} />
    {[1, 2].map((i) => (
      <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
    ))}
  </Box>
);

const EmptyState = ({ hasFilter }) => (
  <Box sx={{ textAlign: "center", py: 10 }}>
    <InboxIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
    <Typography variant="h6" fontWeight="600" color="#475569">
      {hasFilter ? "ไม่พบนักศึกษาที่ตรงกับเงื่อนไข" : "ยังไม่มีคำร้องในความดูแล"}
    </Typography>
    <Typography variant="body2" color="#94a3b8" sx={{ mt: 1 }}>
      {hasFilter ? "ลองปรับตัวกรองหรือคำค้นหาใหม่" : "คำร้องของนักศึกษาในที่ปรึกษาจะแสดงที่นี่"}
    </Typography>
  </Box>
);

export default function AdvisorDashboard() {
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter]     = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRequests();
        const mapped = data.map((r) => ({
          id:           r.id,
          studentId:    r.studentId,
          name:         r.User?.name    || "ไม่ทราบชื่อ",
          faculty:      r.User?.faculty || "ไม่ทราบคณะ",
          branch:       r.User?.branch  || "ไม่ทราบสาขา",
          academicYear: r.academicYear,
          // สถานะที่ปรึกษาดู = grade_check ของตัวเอง
          advisorStatus: mapAdvisorStatus(r.steps?.grade_check?.status),
        }));
        setStudents(mapped);
      } catch (err) {
        console.error("Failed to fetch advisor data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => ({
    total:    students.length,
    pending:  students.filter((s) => s.advisorStatus === "pending").length,
    approved: students.filter((s) => s.advisorStatus === "approved").length,
    rejected: students.filter((s) => s.advisorStatus === "rejected").length,
  }), [students]);

  const years = useMemo(() => {
    const u = [...new Set(students.map((s) => s.academicYear))];
    return u.sort((a, b) => b.localeCompare(a));
  }, [students]);

  const filtered = useMemo(() => students.filter((s) => {
    const matchSearch = s.name.includes(searchTerm) || s.studentId.includes(searchTerm);
    const matchStatus = statusFilter === "all" || s.advisorStatus === statusFilter;
    const matchYear   = yearFilter   === "all" || s.academicYear  === yearFilter;
    return matchSearch && matchStatus && matchYear;
  }), [students, searchTerm, statusFilter, yearFilter]);

  // จัดกลุ่มตาม คณะ / สาขา
  const grouped = useMemo(() => filtered.reduce((acc, s) => {
    const key = `${s.faculty} / ${s.branch}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {}), [filtered]);

  const sections    = Object.keys(grouped).sort();
  const hasFilter   = searchTerm !== "" || statusFilter !== "all" || yearFilter !== "all";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>

        {/* ─── Header ─── */}
        <Box sx={{ p: 4, borderBottom: "2px solid #e2e8f0" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="800" color="#1e293b" gutterBottom>
              รายชื่อนักศึกษาในที่ปรึกษา
            </Typography>
            <Typography variant="body2" color="#64748b">
              ตรวจสอบและอนุมัติให้นักศึกษายื่นคำร้องขอจบการศึกษา
            </Typography>
          </Box>

          {/* Stat Cards */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<GroupIcon fontSize="large" />}          title="ทั้งหมด"        count={stats.total}    color="#3b82f6" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<PendingActionsIcon fontSize="large" />} title="รอการอนุมัติ"   count={stats.pending}  color="#f59e0b" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<CheckCircleIcon fontSize="large" />}    title="อนุมัติแล้ว"    count={stats.approved} color="#10b981" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<CancelIcon fontSize="large" />}         title="ปฏิเสธ"         count={stats.rejected} color="#ef4444" />
              </Grid>
            </Grid>
          )}
        </Box>

        {/* ─── Filters + Table ─── */}
        <Box sx={{ p: 4 }}>
          {/* Filter Bar */}
          <Box sx={{ mb: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
              variant="outlined" size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
              }}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160, bgcolor: "white" }}>
                <InputLabel>สถานะการอนุมัติ</InputLabel>
                <Select value={statusFilter} label="สถานะการอนุมัติ" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="pending">รอการอนุมัติ</MenuItem>
                  <MenuItem value="approved">อนุมัติแล้ว</MenuItem>
                  <MenuItem value="rejected">ปฏิเสธ</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150, bgcolor: "white" }}>
                <InputLabel>ปีการศึกษา</InputLabel>
                <Select value={yearFilter} label="ปีการศึกษา" onChange={(e) => setYearFilter(e.target.value)}>
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Content */}
          {loading ? (
            <DashboardSkeleton />
          ) : sections.length === 0 ? (
            <EmptyState hasFilter={hasFilter} />
          ) : (
            sections.map((section) => (
              <Accordion key={section} defaultExpanded sx={{
                mb: 2, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0", borderRadius: "16px !important",
                overflow: "hidden", "&:before": { display: "none" },
              }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                  sx={{ background: THEME_GRADIENT, px: 3, "&.Mui-expanded": { borderBottom: "1px solid #e2e8f0" } }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <SchoolIcon sx={{ color: "white", fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: "white", fontWeight: 700, lineHeight: 1.2 }}>
                        {section.split(" / ")[0]}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
                        สาขา{section.split(" / ")[1]}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${grouped[section].length} คน`}
                      size="small"
                      sx={{ bgcolor: "white", color: THEME_COLOR, fontWeight: 700, ml: 1 }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#fafafa" }}>
                        <TableCell sx={{ fontWeight: "bold", color: "#475569", pl: 3, width: "25%" }}>รหัสนักศึกษา</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "#475569", width: "35%" }}>ชื่อ-นามสกุล</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "#475569", width: "15%" }}>ปีการศึกษา</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "#475569", width: "15%" }}>สถานะการอนุมัติ</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "#475569", textAlign: "center", pr: 3, width: "10%" }}>ดำเนินการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grouped[section].map((student, idx) => {
                        const cfg = statusConfig[student.advisorStatus];
                        return (
                          <TableRow
                            key={student.id}
                            hover
                            onClick={() => navigate(`/advisor/${student.id}`)}
                            sx={{
                              cursor: "pointer",
                              bgcolor: idx % 2 === 0 ? "#fafafa" : "white",
                              "&:hover": { bgcolor: "#f1f5f9" },
                              "&:last-child td": { border: 0 },
                            }}
                          >
                            <TableCell sx={{ pl: 3, color: "#334155", fontFamily: "monospace", fontSize: "0.85rem" }}>
                              {student.studentId}
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: "#0f172a", fontWeight: 500 }}>{student.name}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: "#475569" }}>{student.academicYear}</TableCell>
                            <TableCell>
                              <Chip
                                label={cfg.label}
                                size="small"
                                sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, borderRadius: "6px" }}
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", pr: 3 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); navigate(`/advisor/${student.id}`); }}
                                sx={{ color: "#64748b", "&:hover": { color: "#0f172a", bgcolor: "#f1f5f9" } }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
}
