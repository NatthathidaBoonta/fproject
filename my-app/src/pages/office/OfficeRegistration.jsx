import React, { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Radio,
    RadioGroup,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Tabs,
    Tab,
    Avatar,
    Grid,
    Card,
    CardContent,
    IconButton,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DomainIcon from '@mui/icons-material/Domain';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import PaymentsIcon from '@mui/icons-material/Payments';
import WorkIcon from '@mui/icons-material/Work';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

// Mock Data
const initialStudents = [
    {
        id: 1,
        studentId: "6610014114",
        name: "ณัฏฐธิดา บุญทา",
        faculty: "คณะศิลปศาสตร์และวิทยาศาสตร์",
        checkGrades: { status: "waiting", comment: "" },
        checkFiles: { status: "waiting", comment: "" },
        checkTuition: { status: "waiting", comment: "" },
        checkInternship: { status: "waiting", comment: "" },
    }
];

const statusConfig = {
    waiting: { label: "รอดำเนินการ", bg: "#FFFBEB", color: "#B45309" },
    passed: { label: "ผ่าน/ครบถ้วน", bg: "#ECFDF5", color: "#15803D" },
    rejected: { label: "ไม่ผ่าน", bg: "#FEF2F2", color: "#B91C1C" },
};

export default function OfficeRegistration() {
    const [students, setStudents] = useState(initialStudents);
    const [tabValue, setTabValue] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null); // { studentId, checkType }
    const [tempComment, setTempComment] = useState("");

    const checkTypes = [
        { label: "ตรวจสอบเกรด", key: "checkGrades", icon: <SchoolIcon /> },
        { label: "ตรวจสอบไฟล์", key: "checkFiles", icon: <DescriptionIcon /> },
        { label: "ตรวจสอบค่าเทอม", key: "checkTuition", icon: <PaymentsIcon /> },
        { label: "ตรวจสอบค่าออกฝึก", key: "checkInternship", icon: <WorkIcon /> },
    ];

    const handleRadioChange = (student, checkType, value) => {
        if (value === "rejected") {
            setSelectedAction({ id: student.id, checkType });
            setTempComment(student[checkType].comment);
            setDialogOpen(true);
        } else {
            updateStatus(student.id, checkType, "passed", "");
        }
    };

    const updateStatus = (id, checkType, status, comment) => {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, [checkType]: { status, comment } } : s
        ));
    };

    const handleSave = () => {
        if (!tempComment.trim()) return;
        updateStatus(selectedAction.id, selectedAction.checkType, "rejected", tempComment);
        setDialogOpen(false);
    };

    const THEME_GRADIENT = "linear-gradient(to right, #F1BA04, #F9C824, #F9DB76)";

    const stats = useMemo(() => {
        const type = checkTypes[tabValue].key;
        return {
            total: students.length,
            waiting: students.filter(s => s[type].status === 'waiting').length,
            passed: students.filter(s => s[type].status === 'passed').length,
            rejected: students.filter(s => s[type].status === 'rejected').length
        };
    }, [students, tabValue]);

    const groupedData = useMemo(() => {
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
                <Typography variant="h4" fontWeight="800" mb={4}>งานทะเบียนและวัดผล</Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<PeopleIcon fontSize="large" />}
                            title="นักศึกษาทั้งหมด"
                            count={stats.total}
                            color="#3b82f6"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<PendingActionsIcon fontSize="large" />}
                            title="รอดำเนินการ"
                            count={stats.waiting}
                            color="#f59e0b"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<CheckCircleIcon fontSize="large" />}
                            title="ผ่าน/ครบถ้วน"
                            count={stats.passed}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<CancelIcon fontSize="large" />}
                            title="ไม่ผ่าน"
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
                    {checkTypes.map((type, index) => (
                        <Tab key={type.key} icon={type.icon} iconPosition="start" label={type.label} />
                    ))}
                </Tabs>

                {Object.keys(groupedData).map(fac => (
                    <Accordion key={fac} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ background: THEME_GRADIENT, color: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <DomainIcon />
                                <Typography variant="h6" fontWeight="bold">{fac}</Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 2, bgcolor: '#f8fafc' }}>
                            {Object.keys(groupedData[fac]).map(branch => (
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
                                                        {checkTypes[tabValue].key === "checkFiles" && (
                                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>เอกสาร</TableCell>
                                                        )}
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>ผ่าน &nbsp;&nbsp; ไม่ผ่าน</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {groupedData[fac][branch].map(s => {
                                                        const currentCheckType = checkTypes[tabValue].key;
                                                        const checkData = s[currentCheckType];
                                                        return (
                                                            <TableRow key={s.id}>
                                                                <TableCell>{s.studentId}</TableCell>
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{s.name[0]}</Avatar>
                                                                        <Typography variant="body2">{s.name}</Typography>
                                                                    </Box>
                                                                </TableCell>
                                                                {currentCheckType === "checkFiles" && (
                                                                    <TableCell align="center">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="primary"
                                                                            onClick={() => window.open("#", "_blank")} // Placeholder for file URL
                                                                            sx={{ bgcolor: alpha('#3b82f6', 0.1), '&:hover': { bgcolor: alpha('#3b82f6', 0.2) } }}
                                                                        >
                                                                            <VisibilityIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell align="center">
                                                                    <Chip label={statusConfig[checkData.status].label} sx={{ bgcolor: statusConfig[checkData.status].bg, color: statusConfig[checkData.status].color, fontWeight: 700, borderRadius: 1, fontSize: '0.75rem' }} />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <RadioGroup
                                                                        row
                                                                        value={checkData.status}
                                                                        onChange={(e) => handleRadioChange(s, currentCheckType, e.target.value)}
                                                                        sx={{ justifyContent: 'center', gap: 4 }}
                                                                    >
                                                                        <Radio value="passed" size="small" sx={{ p: 0.5, '&.Mui-checked': { color: '#10b981' } }} />
                                                                        <Radio value="rejected" size="small" sx={{ p: 0.5, '&.Mui-checked': { color: '#ef4444' } }} />
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
                        </AccordionDetails>
                    </Accordion>
                ))}


                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>ระบุเหตุผลที่ไม่ผ่าน ({checkTypes[tabValue].label})</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus margin="dense" label="หมายเหตุ / เหตุผล" fullWidth multiline rows={3}
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
        </Box>
    );
}
