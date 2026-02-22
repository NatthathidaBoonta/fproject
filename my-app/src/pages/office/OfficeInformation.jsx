import React, { useState, useMemo } from "react";
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
import PeopleIcon from '@mui/icons-material/People';

// Mock Data
const initialStudents = [
    {
        id: 1,
        studentId: "6610014114",
        name: "ณัฏฐธิดา บุญทา",
        faculty: "คณะบริหารธุรกิจและการบัญชี",
        digitalStatus: "waiting",
        digitalComment: ""
    }
];

const statusConfig = {
    waiting: { label: "รอดำเนินการ", bg: "#FFFBEB", color: "#B45309" },
    passed: { label: "ผ่านเกณฑ์", bg: "#ECFDF5", color: "#15803D" },
    rejected: { label: "ไม่ผ่านเกณฑ์", bg: "#FEF2F2", color: "#B91C1C" },
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
    const [students, setStudents] = useState(initialStudents);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [tempComment, setTempComment] = useState("");

    const handleRadioChange = (student, value) => {
        if (value === "rejected") {
            setSelectedStudent(student);
            setTempComment(student.digitalComment || "");
            setDialogOpen(true);
        } else {
            updateStatus(student.id, value, "");
        }
    };

    const updateStatus = (id, status, comment) => {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, digitalStatus: status, digitalComment: comment } : s
        ));
    };

    const handleSave = () => {
        if (!tempComment.trim()) return;
        updateStatus(selectedStudent.id, "rejected", tempComment);
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
                            title="ผ่านเกณฑ์"
                            count={stats.passed}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<CancelIcon fontSize="large" />}
                            title="ไม่ผ่านเกณฑ์"
                            count={stats.rejected}
                            color="#ef4444"
                        />
                    </Grid>
                </Grid>

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
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>ผ่าน &nbsp;&nbsp; ไม่ผ่าน</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {groupedData[fac][branch].map(s => (
                                                        <TableRow key={s.id}>
                                                            <TableCell>{s.studentId}</TableCell>
                                                            <TableCell>{s.name}</TableCell>
                                                            <TableCell align="center">
                                                                <Chip label={statusConfig[s.digitalStatus].label} sx={{ bgcolor: statusConfig[s.digitalStatus].bg, color: statusConfig[s.digitalStatus].color, fontWeight: 700, borderRadius: 1, fontSize: '0.75rem' }} />
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <RadioGroup
                                                                    row
                                                                    value={s.digitalStatus}
                                                                    onChange={(e) => handleRadioChange(s, e.target.value)}
                                                                    sx={{ justifyContent: 'center', gap: 4 }}
                                                                >
                                                                    <Radio value="passed" size="small" sx={{ p: 0.5, '&.Mui-checked': { color: '#10b981' } }} />
                                                                    <Radio value="rejected" size="small" sx={{ p: 0.5, '&.Mui-checked': { color: '#ef4444' } }} />
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
                        </AccordionDetails>
                    </Accordion>
                ))}


                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>ระบุเหตุผลที่ไม่ผ่านเกณฑ์การสอบดิจิทัล</DialogTitle>
                    <DialogContent>
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
            </Box>
        </Box>
    );
}
