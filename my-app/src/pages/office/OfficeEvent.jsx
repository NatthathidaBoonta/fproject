import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Radio,
    RadioGroup,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Tabs,
    Tab,
    Card,
    CardContent,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DomainIcon from '@mui/icons-material/Domain';
import EventIcon from '@mui/icons-material/Event';
import GroupsIcon from '@mui/icons-material/Groups';
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
import Paper from '@mui/material/Paper';
import { getRequests, updateRequestStep } from "../../services/api";

// Stat Card Component
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
    passed: { label: "ผ่าน", bg: "#dcfce7", color: "#16a34a" },
    rejected: { label: "ไม่ผ่าน", bg: "#fee2e2", color: "#dc2626" },
};

export default function OfficeEventh() {
    const [students, setStudents] = useState([]);
    const [tabValue, setTabValue] = useState(0);
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

    const mapRequestToStudent = (request) => {
        const generalStatus = toUiStatus(request.steps?.activity_general_check?.status);
        const facultyStatus = toUiStatus(request.steps?.activity_faculty_check?.status);
        const generalComment = request.steps?.activity_general_check?.comment || '';
        const facultyComment = request.steps?.activity_faculty_check?.comment || '';
        return {
            id: request.id,
            studentId: request.studentId,
            name: request.User?.name || 'ไม่ทราบชื่อ',
            faculty: request.User?.faculty || 'อื่นๆ',
            branch: request.User?.branch || 'สาขาทั่วไป',
            statusGeneral: generalStatus,
            statusFaculty: facultyStatus,
            commentGeneral: generalComment,
            commentFaculty: facultyComment,
            submittedAtGeneral: request.steps?.activity_general_check?.updatedAt || null,
            submittedAtFaculty: request.steps?.activity_faculty_check?.updatedAt || null,
        };
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getRequests({ submittedOnly: true });
            setStudents(data.map(mapRequestToStudent));
        } catch (error) {
            console.error('Failed to fetch activity requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRadioChange = (student, field, value) => {
        if (value === "rejected") {
            setSelectedStudent({ student, field });
            setTempComment(tabValue === 0 ? student.commentGeneral : student.commentFaculty);
            setDialogOpen(true);
        } else if (value === "passed") {
            setSelectedStudent({ student, field });
            setPassDialogOpen(true);
        }
    };

    const handleConfirmPass = async () => {
        if (!selectedStudent) return;
        await updateStudentStatus(selectedStudent.student.id, selectedStudent.field, "passed", "");
        setPassDialogOpen(false);
    };

    const updateStudentStatus = async (id, field, status, comment) => {
        const commentField = field === "statusGeneral" ? "commentGeneral" : "commentFaculty";
        const stepKey = field === "statusGeneral" ? 'activity_general_check' : 'activity_faculty_check';
        try {
            await updateRequestStep(id, {
                step: stepKey,
                status: toStepStatus(status),
                comment,
                userId: currentUser?.id || 'office_activity',
            });
            await fetchRequests();
        } catch (error) {
            console.error('Failed to update activity step:', error);
            setStudents(prev => prev.map(s =>
                s.id === id ? { ...s, [field]: status, [commentField]: comment } : s
            ));
        }
    };

    const handleSaveComment = async () => {
        if (!tempComment.trim()) return;
        await updateStudentStatus(selectedStudent.student.id, selectedStudent.field, "rejected", tempComment);
        setDialogOpen(false);
    };

    const THEME_GRADIENT = "linear-gradient(to right, #F1BA04, #F9C824, #F9DB76)";

    const stats = useMemo(() => {
        const field = tabValue === 0 ? "statusGeneral" : "statusFaculty";
        return {
            total: students.length,
            waiting: students.filter(s => s[field] === 'waiting').length,
            passed: students.filter(s => s[field] === 'passed').length,
            rejected: students.filter(s => s[field] === 'rejected').length
        };
    }, [students, tabValue]);

    const filteredData = useMemo(() => {
        const groups = {};
        students.forEach(s => {
            const fac = s.faculty || 'อื่นๆ';
            const branch = s.branch || 'สาขาทั่วไป';
            if (!groups[fac]) groups[fac] = {};
            if (!groups[fac][branch]) groups[fac][branch] = [];
            groups[fac][branch].push(s);
        });
        return groups;
    }, [students]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: 3 }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Typography variant="h4" fontWeight="800" mb={4}>งานกิจกรรมนักศึกษา</Typography>
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
                            title="ผ่านกิจกรรม"
                            count={stats.passed}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon={<CancelIcon fontSize="large" />}
                            title="ไม่ผ่านกิจกรรม"
                            count={stats.rejected}
                            color="#ef4444"
                        />
                    </Grid>
                </Grid>

                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<EventIcon />} iconPosition="start" label="กิจกรรมกลาง" />
                    <Tab icon={<GroupsIcon />} iconPosition="start" label="กิจกรรมของคณะ" />
                </Tabs>

                {!selectedFaculty ? (
                    <Grid container spacing={3}>
                        {Object.keys(filteredData).map(fac => (
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
                                        <Typography variant="h6" fontWeight="800" color="text.primary" gutterBottom>
                                            {fac}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {Object.keys(filteredData[fac]).length} สาขาวิชา
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

                        {Object.keys(filteredData[selectedFaculty]).map(branch => (
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
                                                {filteredData[selectedFaculty][branch].map(s => {
                                                    const statusField = tabValue === 0 ? "statusGeneral" : "statusFaculty";
                                                    const submittedAt = tabValue === 0 ? s.submittedAtGeneral : s.submittedAtFaculty;
                                                    return (
                                                        <TableRow key={s.id}>
                                                            <TableCell>{s.studentId}</TableCell>
                                                            <TableCell>{s.name}</TableCell>
                                                            <TableCell align="center">
                                                                <Chip label={statusConfig[s[statusField]].label} sx={{ bgcolor: statusConfig[s[statusField]].bg, color: statusConfig[s[statusField]].color, fontWeight: 700, borderRadius: 1, fontSize: '0.75rem' }} />
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {formatSubmittedDate(submittedAt)}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <RadioGroup
                                                                    row
                                                                    value={s[statusField]}
                                                                    onChange={(e) => handleRadioChange(s, statusField, e.target.value)}
                                                                    sx={{ justifyContent: 'center', gap: 4 }}
                                                                >
                                                                    <Radio value="passed" size="small" disabled={s[statusField] === "passed"} sx={{ p: 0.5, '&.Mui-checked': { color: '#10b981' } }} />
                                                                    <Radio value="rejected" size="small" disabled={s[statusField] === "passed"} sx={{ p: 0.5, '&.Mui-checked': { color: '#ef4444' } }} />
                                                                </RadioGroup>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>ระบุหมายเหตุ (ไม่ผ่าน)</DialogTitle>
                    <DialogContent>
                        {selectedStudent?.student && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    รหัสนักศึกษา: <Typography component="span" fontWeight="bold" color="text.primary">{selectedStudent.student.studentId}</Typography>
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    ชื่อ-นามสกุล: <Typography component="span" fontWeight="bold" color="text.primary">{selectedStudent.student.name}</Typography>
                                </Typography>
                            </Box>
                        )}
                        <TextField
                            autoFocus
                            margin="dense"
                            label="หมายเหตุ / เหตุผล"
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            value={tempComment}
                            onChange={(e) => setTempComment(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleSaveComment} variant="contained" color="error" disabled={!tempComment.trim()}>บันทึกรายการ</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={passDialogOpen} onClose={() => setPassDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>ยืนยันการอนุมัติผ่าน</DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            คุณต้องการยืนยันให้ผ่านรายการนี้ใช่หรือไม่?
                        </Typography>
                        {selectedStudent?.student && (
                            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, display: 'inline-block' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    รหัสนักศึกษา: <Typography component="span" fontWeight="bold" color="text.primary">{selectedStudent.student.studentId}</Typography>
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    ชื่อ-นามสกุล: <Typography component="span" fontWeight="bold" color="text.primary">{selectedStudent.student.name}</Typography>
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
