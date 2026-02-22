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
import TranslateIcon from '@mui/icons-material/Translate';

// Mock Data for Language Center
const initialStudents = [
    {
        id: 11,
        studentId: "6610036001",
        name: "สมหญิง จริงใจ",
        faculty: "คณะบริหารธุรกิจและการบัญชี",
        branch: "การบัญชี",
        section: "66/60",
        academicYear: "2569",
        date: "16.08.25",
        status: "passed",
        languageType: "English (CEFR)"
    },
    {
        id: 12,
        studentId: "6610036022",
        name: "อาทิตย์ สดใส",
        faculty: "คณะบริหารธุรกิจและการบัญชี",
        branch: "การตลาด",
        section: "66/61",
        academicYear: "2569",
        date: "16.08.25",
        status: "waiting",
        languageType: "Chinese (HSK)"
    }
];

const statusConfig = {
    waiting: { label: "รอดำเนินการ", bg: "#FFFBEB", color: "#B45309" },
    passed: { label: "อนุมัติ", bg: "#ECFDF5", color: "#15803D" },
    rejected: { label: "ไม่อนุมัติ", bg: "#FEF2F2", color: "#B91C1C" },
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

export default function OfficeLanguage() {
    const [students, setStudents] = useState(initialStudents);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [tempComment, setTempComment] = useState("");

    const navigate = useNavigate();

    const handleRadioChange = (student, value) => {
        if (value === "rejected") {
            setSelectedStudent(student);
            setTempComment(student.comment || "");
            setDialogOpen(true);
        } else {
            updateStatus(student.id, value, "");
        }
    };

    const updateStatus = (id, status, comment) => {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, status: status, comment: comment } : s
        ));
    };

    const handleSave = () => {
        if (!tempComment.trim()) return;
        updateStatus(selectedStudent.id, "rejected", tempComment);
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

            if (!groups[fac]) groups[fac] = {};
            if (!groups[fac][branch]) groups[fac][branch] = [];

            groups[fac][branch].push(student);
        });
        return groups;
    }, [filteredStudents]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#ffffffff', p: 3 }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="800" color="#1e293b" gutterBottom>
                        ศูนย์ภาษา (Language Center)
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        ระบบตรวจสอบผลการทดสอบความรู้ภาษาต่างประเทศ
                    </Typography>
                </Box>

                <Grid container spacing={3} sx={{ mb: 4 }} >
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<TranslateIcon fontSize="large" />}
                            title="คำร้องทั้งหมด"
                            count={stats.total}
                            color="#3b82f6"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<PendingActionsIcon fontSize="large" />}
                            title="รออนุมัติ"
                            count={stats.waiting}
                            color="#f59e0b"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<CheckCircleIcon fontSize="large" />}
                            title="อนุมัติแล้ว"
                            count={stats.passed}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
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

                    {Object.keys(groupedData).sort().map(faculty => (
                        <Accordion key={faculty} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '16px !important', overflow: 'hidden', mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ background: THEME_GRADIENT, color: 'white' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <DomainIcon />
                                    <Typography variant="h6" fontWeight="bold">{faculty}</Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 2, bgcolor: '#f8fafc' }}>
                                {Object.keys(groupedData[faculty]).sort().map(branch => (
                                    <Accordion key={branch} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px !important', overflow: 'hidden', mb: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="#334155">{branch}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ p: 0, bgcolor: 'white' }}>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>รหัสนักศึกษา</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>ชื่อ-นามสกุล</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>ประเภทการสอบ</TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>ผ่าน &nbsp;&nbsp; ไม่ผ่าน</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {groupedData[faculty][branch].map((student) => (
                                                            <TableRow key={student.id} hover onClick={() => navigate(`/office/${student.id}`)} sx={{ cursor: 'pointer' }}>
                                                                <TableCell>{student.studentId}</TableCell>
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{student.name[0]}</Avatar>
                                                                        <Typography variant="body2" fontWeight="500">{student.name}</Typography>
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell>{student.languageType}</TableCell>
                                                                <TableCell align="center">
                                                                    <Chip label={statusConfig[student.status].label} size="small" sx={{ bgcolor: statusConfig[student.status].bg, color: statusConfig[student.status].color, fontWeight: 700, borderRadius: 1, fontSize: '0.75rem' }} />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Box onClick={(e) => e.stopPropagation()}>
                                                                        <RadioGroup row value={student.status} onChange={(e) => handleRadioChange(student, e.target.value)} sx={{ justifyContent: 'center', gap: 4 }}>
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
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}

                </Paper>
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>ระบุหมายเหตุ (ไม่อนุมัติ)</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" label="หมายเหตุ / เหตุผลที่ไม่ผ่าน" fullWidth multiline rows={3}
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
