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
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DomainIcon from '@mui/icons-material/Domain';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';
import BusinessIcon from '@mui/icons-material/Business';
import GavelIcon from '@mui/icons-material/Gavel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getRequests, updateRequestStep } from "../../services/api";

// Faculty Icon Config
const facultyConfig = {
    "คณะครุศาสตร์และการพัฒนามนุษย์": { icon: <SchoolIcon fontSize="large" />, color: "#0ea5e9" },
    "คณะศิลปศาสตร์และวิทยาศาสตร์": { icon: <ScienceIcon fontSize="large" />, color: "#10b981" },
    "คณะมนุษยศาสตร์และสังคมศาสตร์": { icon: <DomainIcon fontSize="large" />, color: "#8b5cf6" },
    "คณะบริหารธุรกิจและการบัญชี": { icon: <BusinessIcon fontSize="large" />, color: "#f59e0b" },
    "วิทยาลัยกฎหมายและการปกครอง": { icon: <GavelIcon fontSize="large" />, color: "#ef4444" },
    "คณะพยาบาลศาสตร์": { icon: <MedicalServicesIcon fontSize="large" />, color: "#ec4899" },
    "อื่นๆ": { icon: <DomainIcon fontSize="large" />, color: "#64748b" }
};

const statusConfig = {
    waiting: { label: "รอดำเนินการ", bg: "#fef3c7", color: "#d97706" },
    passed: { label: "อนุมัติ", bg: "#dcfce7", color: "#16a34a" },
    rejected: { label: "ไม่อนุมัติ", bg: "#fee2e2", color: "#dc2626" },
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

export default function OfficeLibrary() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [passDialogOpen, setPassDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [tempComment, setTempComment] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

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
        academicYear: request.academicYear || 'ไม่ระบุ',
        status: toUiStatus(request.steps?.library_check?.status),
        comment: request.steps?.library_check?.comment || '',
        submittedAt: request.steps?.library_check?.updatedAt || null,
        requestType: 'ห้องสมุด',
    });

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getRequests({ submittedOnly: true });
            setStudents(data.map(mapRequestToStudent));
        } catch (error) {
            console.error('Failed to fetch library requests:', error);
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
            setTempComment(student.comment || "");
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
                step: 'library_check',
                status: toStepStatus(status),
                comment,
                userId: currentUser?.id,
            });
            await fetchRequests();
        } catch (error) {
            console.error('Failed to update library step:', error);
        }
    };

    const handleSave = async () => {
        if (!tempComment.trim()) return;
        await updateStatus(selectedStudent.id, "rejected", tempComment);
        setDialogOpen(false);
    };

    const stats = useMemo(() => {
        return {
            total: students.length,
            waiting: students.filter(s => s.status === 'waiting').length,
            passed: students.filter(s => s.status === 'passed').length,
            rejected: students.filter(s => s.status === 'rejected').length
        };
    }, [students]);

    const THEME_GRADIENT = "linear-gradient(to right, #F1BA04, #F9C824, #F9DB76)";

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = student.name.includes(searchTerm) || student.studentId.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [students, searchTerm, statusFilter]);

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
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="800" color="#1e293b" gutterBottom>
                        หน่วยงาน: สำนักวิทยบริการ (Library)
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        ระบบจัดการการยืม-คืนห้องค้นคว้า และทรัพยากรห้องสมุด
                    </Typography>
                    {loading && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            กำลังโหลดข้อมูลคำร้อง...
                        </Typography>
                    )}
                </Box>

                <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }} >
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon={<LocalLibraryIcon fontSize="large" />}
                            title="คำร้องทั้งหมด"
                            count={stats.total}
                            color="#3b82f6"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon={<PendingActionsIcon fontSize="large" />}
                            title="รออนุมัติ"
                            count={stats.waiting}
                            color="#f59e0b"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon={<CheckCircleIcon fontSize="large" />}
                            title="อนุมัติแล้ว"
                            count={stats.passed}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon={<CancelIcon fontSize="large" />}
                            title="ไม่อนุมัติ"
                            count={stats.rejected}
                            color="#ef4444"
                        />
                    </Grid>
                </Grid>

                <Paper elevation={0} sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    bgcolor: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
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
                            <InputLabel>สถานะ</InputLabel>
                            <Select value={statusFilter} label="สถานะ" onChange={(e) => setStatusFilter(e.target.value)}>
                                <MenuItem value="all">ทั้งหมด</MenuItem>
                                <MenuItem value="passed">อนุมัติ</MenuItem>
                                <MenuItem value="waiting">รออนุมัติ</MenuItem>
                                <MenuItem value="rejected">ไม่อนุมัติ</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {!selectedFaculty ? (
                        <Grid container spacing={3}>
                            {Object.keys(groupedData).map(fac => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fac}>
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
                                        {Object.keys(groupedData[selectedFaculty][branch]).sort().reverse().map(year => {
                                            const studentsInYear = groupedData[selectedFaculty][branch][year];
                                            return (
                                                <Box key={year} sx={{ mb: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, pb: 0 }}>
                                                        <CalendarMonthIcon fontSize="small" sx={{ color: '#F9C824' }} />
                                                        <Typography variant="subtitle2" fontWeight="bold" color="#F9C824">ปีการศึกษา {year}</Typography>
                                                    </Box>

                                                    <TableContainer>
                                                        <Table size="small">
                                                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                                                <TableRow>
                                                                    <TableCell sx={{ fontWeight: 'bold' }}>รหัสนักศึกษา</TableCell>
                                                                    <TableCell sx={{ fontWeight: 'bold' }}>ชื่อ-นามสกุล</TableCell>
                                                                    <TableCell sx={{ fontWeight: 'bold' }}>ประเภทบริการ</TableCell>
                                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>วันที่ยื่น</TableCell>
                                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>ผ่าน &nbsp;&nbsp; ไม่ผ่าน</TableCell>
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
                                                                        <TableCell>{student.requestType}</TableCell>
                                                                        <TableCell align="center">
                                                                            <Chip label={statusConfig[student.status].label} size="small" sx={{ bgcolor: statusConfig[student.status].bg, color: statusConfig[student.status].color, fontWeight: 700, borderRadius: 1, fontSize: '0.75rem', height: 24 }} />
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                {formatSubmittedDate(student.submittedAt)}
                                                                            </Typography>
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
                                                                                    <Radio value="passed" size="small" disabled={student.status === "passed"} sx={{ p: 0.5, '&.Mui-checked': { color: '#10b981' } }} />
                                                                                    <Radio value="rejected" size="small" disabled={student.status === "passed"} sx={{ p: 0.5, '&.Mui-checked': { color: '#ef4444' } }} />
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
                        </Box>
                    )}
                    {Object.keys(groupedData).length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#f9fafb', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
                            <Typography color="text.secondary">ไม่พบข้อมูลคำร้องในขณะนี้</Typography>
                        </Box>
                    )}
                </Paper>
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>ระบุหมายเหตุ (ไม่อนุมัติ)</DialogTitle>
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
                        autoFocus margin="dense" label="เหตุผลที่ไม่ผ่าน / หมายเหตุ" fullWidth multiline rows={3}
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

            <Dialog open={passDialogOpen} onClose={() => setPassDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>ยืนยันการอนุมัติผ่าน</DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        คุณต้องการยืนยันให้ผ่านรายการนี้ใช่หรือไม่?
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
    );
}
