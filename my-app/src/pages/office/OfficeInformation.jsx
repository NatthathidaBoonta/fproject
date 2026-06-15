import React, { useEffect, useState, useMemo } from "react";
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DomainIcon from '@mui/icons-material/Domain';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';
import BusinessIcon from '@mui/icons-material/Business';
import GavelIcon from '@mui/icons-material/Gavel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getRequests, updateRequestStep } from "../../services/api";

// Faculty Icon Config
const facultyConfig = {
    "คณะครุศาสตร์และการพัฒนุษย์": { icon: <SchoolIcon fontSize="large" />, color: "#0ea5e9" },
    "คณะศิลปศาสตร์และวิทยาศาสตร์": { icon: <ScienceIcon fontSize="large" />, color: "#10b981" },
    "คณะมนุษยศาสตร์และสังคมศาสตร์": { icon: <DomainIcon fontSize="large" />, color: "#8b5cf6" },
    "คณะบริหารธุรกิจและการบัญชี": { icon: <BusinessIcon fontSize="large" />, color: "#f59e0b" },
    "วิทยาลัยกฎหมายและการปกครอง": { icon: <GavelIcon fontSize="large" />, color: "#ef4444" },
    "คณะพยาบาลศาสตร์": { icon: <MedicalServicesIcon fontSize="large" />, color: "#ec4899" },
    "อื่นๆ": { icon: <DomainIcon fontSize="large" />, color: "#64748b" }
};

const statusConfig = {
    waiting: { label: "รอดำเนินการ", bg: "#fef3c7", color: "#d97706" },
    passed: { label: "ผ่านเกณฑ์", bg: "#dcfce7", color: "#16a34a" },
    rejected: { label: "ไม่ผ่านเกณฑ์", bg: "#fee2e2", color: "#dc2626" },
};

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

export default function OfficeInformation() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [passDialogOpen, setPassDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [tempComment, setTempComment] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [loading, setLoading] = useState(true);

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }, []);

    const toUiStatus = (stepStatus) => {
        if (stepStatus === 'approved') return 'passed';
        if (stepStatus === 'rejected') return 'rejected';
        return 'waiting';
    };

    const toStepStatus = (uiStatus) => {
        if (uiStatus === 'passed') return 'approved';
        if (uiStatus === 'rejected') return 'rejected';
        return 'waiting';
    };

    const formatSubmittedDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('th-TH');
    };

    const mapRequestToStudent = (request) => ({
        id: request.id,
        studentId: request.studentId,
        name: request.User?.name || 'ไม่ทราบชื่อ',
        faculty: request.User?.faculty || 'อื่นๆ',
        branch: request.User?.branch || 'สาขาทั่วไป',
        digitalStatus: toUiStatus(request.steps?.digital_exam_check?.status),
        digitalComment: request.steps?.digital_exam_check?.comment || '',
        submittedAt: request.steps?.digital_exam_check?.updatedAt || null,
    });

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getRequests({ submittedOnly: true });
            setStudents(data.map(mapRequestToStudent));
        } catch (error) {
            console.error('Failed to fetch digital exam requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRadioChange = (student, value) => {
        if (value === "rejected") {
            setSelectedStudent(student);
            setTempComment(student.digitalComment || "");
            setDialogOpen(true);
        } else if (value === "passed") {
            setSelectedStudent(student);
            setPassDialogOpen(true);
        }
    };

    const handleConfirmPass = async () => {
        if (!selectedStudent) return;
        await updateStatus(selectedStudent.id, "passed", "");
        setPassDialogOpen(false);
    };

    const updateStatus = async (id, status, comment) => {
        try {
            await updateRequestStep(id, {
                step: 'digital_exam_check',
                status: toStepStatus(status),
                comment,
                userId: currentUser?.id,
            });
            await fetchRequests();
        } catch (error) {
            console.error('Failed to update digital exam step:', error);
        }
    };

    const handleSave = async () => {
        if (!tempComment.trim()) return;
        await updateStatus(selectedStudent.id, "rejected", tempComment);
        setDialogOpen(false);
    };

    const THEME_GRADIENT = "linear-gradient(to right, #F1BA04, #F9C824, #F9DB76)";

    const stats = useMemo(() => {
        return {
            total: students.length,
            waiting: students.filter(s => s.digitalStatus === 'waiting').length,
            passed: students.filter(s => s.digitalStatus === 'passed').length,
            rejected: students.filter(s => s.digitalStatus === 'rejected').length
        };
    }, [students]);

    const groupedData = useMemo(() => {
        const groups = {};
        students.forEach(student => {
            const fac = student.faculty || 'อื่นๆ';
            const branch = student.branch || 'สาขาทั่วไป';
            if (!groups[fac]) groups[fac] = {};
            if (!groups[fac][branch]) groups[fac][branch] = [];
            groups[fac][branch].push(student);
        });
        return groups;
    }, [students]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: 3 }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Typography variant="h4" fontWeight="800" mb={4}>งานเทคโนโลยีสารสนเทศ (สอบดิจิทัล)</Typography>
                {loading && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        กำลังโหลดข้อมูลคำร้อง...
                    </Typography>
                )}

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon={<PeopleIcon fontSize="large" />}
                            title="นักศึกษาทั้งหมด"
                            count={stats.total}
                            color="#3b82f6"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon={<PendingActionsIcon fontSize="large" />}
                            title="รอดำเนินการ"
                            count={stats.waiting}
                            color="#f59e0b"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon={<CheckCircleIcon fontSize="large" />}
                            title="ผ่านเกณฑ์"
                            count={stats.passed}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon={<CancelIcon fontSize="large" />}
                            title="ไม่ผ่านเกณฑ์"
                            count={stats.rejected}
                            color="#ef4444"
                        />
                    </Grid>
                </Grid>

                {!selectedFaculty ? (
                    <Grid container spacing={3}>
                        {Object.keys(groupedData).map(fac => (
                            <Grid item xs={12} sm={6} md={4} key={fac}>
                                <Card
                                    onClick={() => setSelectedFaculty(fac)}
                                    sx={{
                                        cursor: 'pointer',
                                        height: '100%',
                                        borderRadius: 4,
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: `0 12px 30px ${alpha(facultyConfig[fac]?.color || '#64748b', 0.15)}`,
                                            borderColor: facultyConfig[fac]?.color
                                        },
                                        border: '2px solid transparent',
                                        bgcolor: 'white'
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                        <Box sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            bgcolor: alpha(facultyConfig[fac]?.color || '#64748b', 0.1),
                                            color: facultyConfig[fac]?.color || '#64748b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 3
                                        }}>
                                            {facultyConfig[fac]?.icon || <DomainIcon fontSize="large" />}
                                        </Box>
                                        <Typography variant="h6" fontWeight="800" color="#1e293b" gutterBottom>
                                            {fac}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {Object.keys(groupedData[fac]).length} สาขาวิชา
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => setSelectedFaculty(null)}
                            sx={{ mb: 3, fontWeight: 'bold' }}
                        >
                            กลับไปเลือกคณะ
                        </Button>

                        <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: alpha(facultyConfig[selectedFaculty]?.color || '#64748b', 0.05), borderLeft: `6px solid ${facultyConfig[selectedFaculty]?.color || '#64748b'}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ color: facultyConfig[selectedFaculty]?.color || '#64748b' }}>
                                    {facultyConfig[selectedFaculty]?.icon}
                                </Box>
                                <Typography variant="h5" fontWeight="800">{selectedFaculty}</Typography>
                            </Box>
                        </Paper>

                        {Object.keys(groupedData[selectedFaculty]).sort().map(branch => (
                            <Accordion key={branch} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px !important', overflow: 'hidden', mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#334155">{branch}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0, bgcolor: 'white' }}>
                                    <TableContainer>
                                        <Table>
                                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>รหัสนักศึกษา</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>ชื่อ-นามสกุล</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>วันที่ยื่น</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>ผ่าน &nbsp;&nbsp; ไม่ผ่าน</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {groupedData[selectedFaculty][branch].map(s => (
                                                    <TableRow key={s.id}>
                                                        <TableCell>{s.studentId}</TableCell>
                                                        <TableCell>{s.name}</TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={statusConfig[s.digitalStatus].label} sx={{ bgcolor: statusConfig[s.digitalStatus].bg, color: statusConfig[s.digitalStatus].color, fontWeight: 700, borderRadius: 1, fontSize: '0.75rem' }} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatSubmittedDate(s.submittedAt)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <RadioGroup
                                                                row
                                                                value={s.digitalStatus}
                                                                onChange={(e) => handleRadioChange(s, e.target.value)}
                                                                sx={{ justifyContent: 'center', gap: 4 }}
                                                            >
                                                                <Radio value="passed" size="small" disabled={s.digitalStatus === "passed"} sx={{ p: 0.5, '&.Mui-checked': { color: '#10b981' } }} />
                                                                <Radio value="rejected" size="small" disabled={s.digitalStatus === "passed"} sx={{ p: 0.5, '&.Mui-checked': { color: '#ef4444' } }} />
                                                            </RadioGroup>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}


                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>ระบุเหตุผลที่ไม่ผ่านเกณฑ์การสอบดิจิทัล</DialogTitle>
                    <DialogContent>
                        {selectedStudent && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    รหัสนักศึกษา: <Typography component="span" fontWeight="bold" color="text.primary">{selectedStudent.studentId}</Typography>
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    ชื่อ-นามสกุล: <Typography component="span" fontWeight="bold" color="text.primary">{selectedStudent.name}</Typography>
                                </Typography>
                            </Box>
                        )}
                        <TextField
                            autoFocus margin="dense" label="หมายเหตุ" fullWidth multiline rows={3}
                            value={tempComment} onChange={(e) => setTempComment(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleSave} variant="contained" color="error" disabled={!tempComment.trim()}>บันทึก</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={passDialogOpen} onClose={() => setPassDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>ยืนยันการอนุมัติผ่านเกณฑ์</DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            คุณต้องการยืนยันให้ผ่านเกณฑ์รายการนี้ใช่หรือไม่?
                        </Typography>
                        {selectedStudent && (
                            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, display: 'inline-block' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    รหัสนักศึกษา: <Typography component="span" fontWeight="bold" color="text.primary">{selectedStudent.studentId}</Typography>
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    ชื่อ-นามสกุล: <Typography component="span" fontWeight="bold" color="text.primary">{selectedStudent.name}</Typography>
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setPassDialogOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleConfirmPass} variant="contained" color="success">ยืนยัน</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}
