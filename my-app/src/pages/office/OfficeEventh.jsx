import React, { useState, useMemo } from "react";
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
        branch: "วิทยาการคอมพิวเตอร์",
        statusGeneral: "waiting",
        statusFaculty: "waiting",
        commentGeneral: "",
        commentFaculty: ""
    }
];

const statusConfig = {
    waiting: { label: "รอดำเนินการ", bg: "#FFFBEB", color: "#B45309" },
    passed: { label: "ผ่าน", bg: "#ECFDF5", color: "#15803D" },
    rejected: { label: "ไม่ผ่าน", bg: "#FEF2F2", color: "#B91C1C" },
};

export default function OfficeEventh() {
    const [students, setStudents] = useState(initialStudents);
    const [tabValue, setTabValue] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [tempComment, setTempComment] = useState("");

    const handleRadioChange = (student, field, value) => {
        if (value === "rejected") {
            setSelectedStudent({ student, field });
            setTempComment(tabValue === 0 ? student.commentGeneral : student.commentFaculty);
            setDialogOpen(true);
        } else {
            updateStudentStatus(student.id, field, value, "");
        }
    };

    const updateStudentStatus = (id, field, status, comment) => {
        const commentField = field === "statusGeneral" ? "commentGeneral" : "commentFaculty";
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, [field]: status, [commentField]: comment } : s
        ));
    };

    const handleSaveComment = () => {
        if (!tempComment.trim()) return;
        updateStudentStatus(selectedStudent.student.id, selectedStudent.field, "rejected", tempComment);
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
                            title="ผ่านกิจกรรม"
                            count={stats.passed}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
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

                {Object.keys(filteredData).map(fac => (
                    <Accordion key={fac} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ background: THEME_GRADIENT, color: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <DomainIcon sx={{ mr: 1 }} />
                                <Typography variant="h6" fontWeight="bold">{fac}</Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 2, bgcolor: '#f8fafc' }}>
                            {Object.keys(filteredData[fac]).map(branch => (
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
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>ผ่าน &nbsp;&nbsp; ไม่ผ่าน</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {filteredData[fac][branch].map(s => {
                                                        const statusField = tabValue === 0 ? "statusGeneral" : "statusFaculty";
                                                        return (
                                                            <TableRow key={s.id}>
                                                                <TableCell>{s.studentId}</TableCell>
                                                                <TableCell>{s.name}</TableCell>
                                                                <TableCell align="center">
                                                                    <Chip label={statusConfig[s[statusField]].label} sx={{ bgcolor: statusConfig[s[statusField]].bg, color: statusConfig[s[statusField]].color, fontWeight: 700, borderRadius: 1, fontSize: '0.75rem' }} />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <RadioGroup
                                                                        row
                                                                        value={s[statusField]}
                                                                        onChange={(e) => handleRadioChange(s, statusField, e.target.value)}
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
                    <DialogTitle>ระบุหมายเหตุ (ไม่ผ่าน)</DialogTitle>
                    <DialogContent>
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
            </Box>
        </Box>
    );
}
