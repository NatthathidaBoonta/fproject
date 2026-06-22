import React, { useEffect, useMemo, useState } from "react";
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
    Paper,
    Card,
    CardContent,
    Checkbox,
    IconButton,
    Tooltip,
    Badge,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Snackbar,
    Alert,
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
import ScienceIcon from '@mui/icons-material/Science';
import BusinessIcon from '@mui/icons-material/Business';
import GavelIcon from '@mui/icons-material/Gavel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { API_BASE_URL, getRequests, updateRequestStep, updateRequestStepBatch } from "../../services/api";
import { exportToCSV } from "../../services/csvExport";

// Stat Card Component
const StatCard = ({ icon, title, count, color, active, onClick }) => (
    <Card 
        onClick={onClick}
        sx={{
            height: '100%',
            borderRadius: 4,
            border: '2px solid',
            borderColor: active ? color : '#f1f5f9',
            boxShadow: active ? `0 10px 25px ${alpha(color, 0.15)}` : '0 4px 20px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 25px ${alpha(color, 0.25)}`,
                borderColor: color,
                '& .icon-box': {
                    transform: 'scale(1.2)'
                }
            },
            position: 'relative',
            overflow: 'hidden',
            bgcolor: active ? alpha(color, 0.02) : 'background.paper'
        }}
    >
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                    className="icon-box"
                    sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        transition: 'transform 0.3s ease'
                    }}
                >
                    {icon}
                </Box>
                <Typography variant="body2" fontWeight="700" color={active ? color : "text.secondary"}>{title}</Typography>
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

const checkTypes = [
    { key: "checkGrades", label: "ตรวจสอบเกรด", icon: <SchoolIcon />, stepKey: "grade_check" },
    { key: "checkFiles", label: "ตรวจสอบไฟล์", icon: <DescriptionIcon />, stepKey: "file_check" },
    { key: "checkTuition", label: "ตรวจสอบค่าเทอม", icon: <PaymentsIcon />, stepKey: "tuition_check" },
    { key: "checkInternship", label: "ตรวจสอบค่าออกฝึก", icon: <WorkIcon />, stepKey: "internship_fee_check" },
];

const statusConfig = {
    waiting: { label: "รอดำเนินการ", bg: "#fef3c7", color: "#d97706" },
    passed: { label: "ผ่าน/ครบถ้วน", bg: "#dcfce7", color: "#16a34a" },
    rejected: { label: "ไม่ผ่าน", bg: "#fee2e2", color: "#dc2626" },
};

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
    const steps = request.steps || {};
    const documents = Array.isArray(request.documents) ? request.documents : [];
    const generalDocuments = documents.filter((document) => {
        const type = String(document?.documentType || '').trim().toLowerCase();
        return type === '' || type === 'general';
    });
    const internshipDocuments = documents.filter((document) =>
        String(document?.documentType || '').trim().toLowerCase() === 'internship_receipt'
    );

    return {
        id: request.id,
        studentId: request.studentId,
        name: request.User?.name || "ไม่ทราบชื่อ",
        faculty: request.User?.faculty || "ไม่ทราบคณะ",
        branch: request.User?.branch || "ไม่ทราบสาขา",
        academicYear: request.academicYear,
        date: formatSubmittedDate(request.createdAt),
        status: request.status === 'Completed' ? 'passed' : request.status === 'Rejected' ? 'rejected' : 'waiting',
        checkGrades: {
            status: toUiStatus(steps.grade_check?.status),
            comment: steps.grade_check?.comment || "",
            submittedAt: steps.grade_check?.updatedAt,
        },
        checkFiles: {
            status: toUiStatus(steps.file_check?.status),
            comment: steps.file_check?.comment || "",
            submittedAt: steps.file_check?.updatedAt,
        },
        checkTuition: {
            status: toUiStatus(steps.tuition_check?.status),
            comment: steps.tuition_check?.comment || "",
            submittedAt: steps.tuition_check?.updatedAt,
        },
        checkInternship: {
            status: toUiStatus(steps.internship_fee_check?.status),
            comment: steps.internship_fee_check?.comment || "",
            submittedAt: steps.internship_fee_check?.updatedAt,
        },
        latestDocument: generalDocuments[generalDocuments.length - 1] || null,
        latestInternshipDocument: internshipDocuments[internshipDocuments.length - 1] || null,
    };
};

export default function OfficeRegistration() {
    const [students, setStudents] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [passDialogOpen, setPassDialogOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null); // { student, checkType }
    const [tempComment, setTempComment] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);

    // Batch Action states
    const [selectedRequestIds, setSelectedRequestIds] = useState([]);
    const [batchApproveOpen, setBatchApproveOpen] = useState(false);
    const [batchRejectOpen, setBatchRejectOpen] = useState(false);
    const [batchRejectComment, setBatchRejectComment] = useState("");

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Toast (Snackbar) states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await getRequests({ submittedOnly: true });
            const mapped = data.map(mapRequestToStudent);
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

    // Clear selection on tab or faculty changes
    useEffect(() => {
        setSelectedRequestIds([]);
    }, [tabValue, selectedFaculty]);

    const handleRadioChange = (student, checkType, value) => {
        if (value === "rejected") {
            setSelectedAction({ student, checkType });
            setTempComment(student[checkType].comment);
            setDialogOpen(true);
        } else if (value === "passed") {
            setSelectedAction({ student, checkType });
            setPassDialogOpen(true);
        }
    };

    const handleConfirmPass = async () => {
        if (!selectedAction) return;
        await updateStatus(selectedAction.student.id, selectedAction.checkType, "passed", "");
        setPassDialogOpen(false);
        setSnackbarMessage("สถานะอัปเดตเป็นผ่านสำเร็จ 🎉");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    };

    const updateStatus = async (id, checkType, status, comment) => {
        const checkTypeConfig = checkTypes.find(type => type.key === checkType);
        if (!checkTypeConfig) return;

        const actorUserId = currentUser?.id;
        if (!actorUserId) {
            console.error('Cannot update request step: user session is missing');
            return;
        }

        try {
            await updateRequestStep(id, {
                step: checkTypeConfig.stepKey,
                status: toStepStatus(status),
                comment,
                userId: actorUserId,
            });
            await fetchRequests();
        } catch (error) {
            console.error('Failed to update request step from registration office:', error);
        }
    };

    const handleSave = async () => {
        if (!tempComment.trim()) return;
        await updateStatus(selectedAction.student.id, selectedAction.checkType, "rejected", tempComment);
        setDialogOpen(false);
        setSnackbarMessage("ปฏิเสธคำร้องและบันทึกหมายเหตุเรียบร้อย ❌");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
    };

    // Batch Actions handlers
    const handleSelectRow = (requestId) => {
        setSelectedRequestIds(prev =>
            prev.includes(requestId)
                ? prev.filter(id => id !== requestId)
                : [...prev, requestId]
        );
    };

    const handleSelectAllInBranch = (branchStudents, checked) => {
        const currentCheckType = checkTypes[tabValue].key;
        const ids = branchStudents
            .filter(s => s[currentCheckType]?.status !== 'passed')
            .map(s => s.id);
        if (checked) {
            setSelectedRequestIds(prev => {
                const newIds = ids.filter(id => !prev.includes(id));
                return [...prev, ...newIds];
            });
        } else {
            const allBranchIds = branchStudents.map(s => s.id);
            setSelectedRequestIds(prev => prev.filter(id => !allBranchIds.includes(id)));
        }
    };

    const handleBatchApproveConfirm = async () => {
        if (selectedRequestIds.length === 0) return;
        const stepKey = checkTypes[tabValue].stepKey;
        const currentCheckType = checkTypes[tabValue].key;

        // Filter out already passed students
        const targetIds = selectedRequestIds.filter(id => {
            const student = students.find(s => s.id === id);
            return student && student[currentCheckType]?.status !== 'passed';
        });

        if (targetIds.length === 0) {
            setSelectedRequestIds([]);
            setBatchApproveOpen(false);
            return;
        }

        try {
            await updateRequestStepBatch({
                ids: targetIds,
                step: stepKey,
                status: 'approved',
                comment: '',
                userId: currentUser?.id
            });
            setSelectedRequestIds([]);
            setBatchApproveOpen(false);
            await fetchRequests();
            setSnackbarMessage(`อนุมัติผ่านกลุ่มจำนวน ${targetIds.length} รายการสำเร็จ 🎉`);
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Failed batch approve:', error);
            setSnackbarMessage("เกิดข้อผิดพลาดในการอนุมัติกลุ่ม");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleBatchRejectConfirm = async () => {
        if (selectedRequestIds.length === 0 || !batchRejectComment.trim()) return;
        const stepKey = checkTypes[tabValue].stepKey;
        const currentCheckType = checkTypes[tabValue].key;

        // Filter out already passed students
        const targetIds = selectedRequestIds.filter(id => {
            const student = students.find(s => s.id === id);
            return student && student[currentCheckType]?.status !== 'passed';
        });

        if (targetIds.length === 0) {
            setSelectedRequestIds([]);
            setBatchRejectComment("");
            setBatchRejectOpen(false);
            return;
        }

        try {
            await updateRequestStepBatch({
                ids: targetIds,
                step: stepKey,
                status: 'rejected',
                comment: batchRejectComment,
                userId: currentUser?.id
            });
            setSelectedRequestIds([]);
            setBatchRejectComment("");
            setBatchRejectOpen(false);
            await fetchRequests();
            setSnackbarMessage(`ปฏิเสธกลุ่มจำนวน ${targetIds.length} รายการสำเร็จ ❌`);
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Failed batch reject:', error);
            setSnackbarMessage("เกิดข้อผิดพลาดในการปฏิเสธกลุ่ม");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    // Export Excel handler
    const handleExportReport = () => {
        const type = checkTypes[tabValue].key;
        const facultyStudents = students.filter(s => {
            const matchesFaculty = !selectedFaculty || s.faculty === selectedFaculty;
            return matchesFaculty;
        });

        // Map status logic
        const reportData = facultyStudents.map(s => ({
            studentId: s.studentId,
            name: s.name,
            faculty: s.faculty,
            branch: s.branch,
            academicYear: s.academicYear,
            date: s.date,
            status: s[type].status // 'passed' | 'rejected' | 'waiting'
        }));

        exportToCSV(reportData, `ทะเบียน_${checkTypes[tabValue].label}_${selectedFaculty || 'ทุกคณะ'}.csv`);
    };

    const getDocumentUrl = (document) => {
        if (!document?.url) return '';
        if (String(document.url).startsWith('http')) return document.url;
        return `${API_BASE_URL}${document.url}`;
    };

    const THEME_GRADIENT = "linear-gradient(to right, #7c2d12, #c2410c, #ea580c)";

    const stats = useMemo(() => {
        const type = checkTypes[tabValue].key;
        const filtered = students.filter(s => !selectedFaculty || s.faculty === selectedFaculty);
        return {
            total: filtered.length,
            waiting: filtered.filter(s => s[type].status === 'waiting').length,
            passed: filtered.filter(s => s[type].status === 'passed').length,
            rejected: filtered.filter(s => s[type].status === 'rejected').length
        };
    }, [students, tabValue, selectedFaculty]);

    const groupedData = useMemo(() => {
        const groups = {};
        const type = checkTypes[tabValue].key;

        const filtered = students.filter(s => {
            const matchesFaculty = !selectedFaculty || s.faculty === selectedFaculty;
            
            // Map the status filter
            const matchesStatus = statusFilter === 'all' || s[type].status === statusFilter;
            
            // Map the search term
            const matchesSearch = !searchTerm.trim() ||
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
                
            return matchesFaculty && matchesStatus && matchesSearch;
        });

        filtered.forEach(s => {
            const fac = s.faculty || 'อื่นๆ';
            const branch = s.branch || 'สาขาทั่วไป';
            if (!groups[fac]) groups[fac] = {};
            if (!groups[fac][branch]) groups[fac][branch] = [];
            groups[fac][branch].push(s);
        });
        return groups;
    }, [students, tabValue, selectedFaculty, statusFilter, searchTerm]);

    const filteredCount = useMemo(() => {
        let count = 0;
        if (selectedFaculty) {
            const branches = groupedData[selectedFaculty] || {};
            Object.keys(branches).forEach(b => {
                count += branches[b].length;
            });
        } else {
            Object.keys(groupedData).forEach(fac => {
                Object.keys(groupedData[fac]).forEach(b => {
                    count += groupedData[fac][b].length;
                });
            });
        }
        return count;
    }, [groupedData, selectedFaculty]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Box
                    sx={{
                        py: 3,
                        mb: 4,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight="800" sx={{ mb: 1, letterSpacing: -0.5, color: 'text.primary' }}>
                            งานทะเบียนและวัดผล
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            ระบบตรวจสอบคุณสมบัติผู้สำเร็จการศึกษา สำหรับเจ้าหน้าที่ฝ่ายทะเบียน
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportReport}
                        sx={{ 
                            borderRadius: 3, 
                            fontWeight: 700,
                            px: 3,
                            py: 1.2,
                        }}
                    >
                        ส่งออกข้อมูล CSV
                    </Button>
                </Box>

                {loading && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        กำลังโหลดข้อมูลคำร้อง...
                    </Typography>
                )}

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 3,
                    mb: 4
                }}>
                    <StatCard
                        icon={<PeopleIcon fontSize="large" />}
                        title="นักศึกษาทั้งหมด"
                        count={stats.total}
                        color="#3b82f6"
                        active={statusFilter === 'all'}
                        onClick={() => setStatusFilter('all')}
                    />
                    <StatCard
                        icon={<PendingActionsIcon fontSize="large" />}
                        title="รอดำเนินการ"
                        count={stats.waiting}
                        color="#f59e0b"
                        active={statusFilter === 'waiting'}
                        onClick={() => setStatusFilter('waiting')}
                    />
                    <StatCard
                        icon={<CheckCircleIcon fontSize="large" />}
                        title="ผ่าน/ครบถ้วน"
                        count={stats.passed}
                        color="#16a34a"
                        active={statusFilter === 'passed'}
                        onClick={() => setStatusFilter('passed')}
                    />
                    <StatCard
                        icon={<CancelIcon fontSize="large" />}
                        title="ไม่ผ่าน"
                        count={stats.rejected}
                        color="#ef4444"
                        active={statusFilter === 'rejected'}
                        onClick={() => setStatusFilter('rejected')}
                    />
                </Box>

                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                    {checkTypes.map((type) => (
                        <Tab key={type.key} icon={type.icon} iconPosition="start" label={type.label} />
                    ))}
                </Tabs>

                {/* Control Bar */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        mb: 4,
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'stretch', md: 'center' },
                        justifyContent: 'space-between',
                        gap: 2
                    }}
                >
                    <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            size="small"
                            placeholder="ค้นหารหัสนักศึกษา หรือชื่อ-นามสกุล..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchTerm("")}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{ 
                                flexGrow: 1, 
                                minWidth: { sm: 250, md: 350 },
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <InputLabel id="status-filter-label">สถานะตรวจสอบ</InputLabel>
                            <Select
                                labelId="status-filter-label"
                                value={statusFilter}
                                label="สถานะตรวจสอบ"
                                onChange={(e) => setStatusFilter(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="all">ทั้งหมด</MenuItem>
                                <MenuItem value="waiting">รอดำเนินการ</MenuItem>
                                <MenuItem value="passed">ผ่าน/ครบถ้วน</MenuItem>
                                <MenuItem value="rejected">ไม่ผ่าน</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                        {selectedRequestIds.length > 0 && (
                            <Badge 
                                badgeContent={selectedRequestIds.length} 
                                color="error"
                                sx={{ 
                                    '& .MuiBadge-badge': {
                                        right: -3,
                                        top: 3,
                                        border: `2px solid #ffffff`,
                                        padding: '0 4px',
                                    }
                                }}
                            >
                                <Chip 
                                    label="เลือกอยู่" 
                                    size="medium" 
                                    onDelete={() => setSelectedRequestIds([])}
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        bgcolor: '#fee2e2', 
                                        color: '#dc2626',
                                        '& .MuiChip-deleteIcon': {
                                            color: '#dc2626'
                                        }
                                    }} 
                                />
                            </Badge>
                        )}
                        {(searchTerm || statusFilter !== 'all') && (
                            <Button 
                                size="small" 
                                color="error" 
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                }}
                                startIcon={<ClearIcon />}
                                sx={{ fontWeight: 700 }}
                            >
                                ล้างตัวกรอง
                            </Button>
                        )}
                    </Box>
                </Paper>

                {/* Conditional rendering based on filteredCount */}
                {filteredCount === 0 ? (
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 8, 
                            textAlign: 'center', 
                            border: '2px dashed', 
                            borderColor: 'divider', 
                            borderRadius: 5,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Box sx={{ mb: 2, color: 'text.secondary', display: 'flex', justifyContent: 'center' }}>
                            <PendingActionsIcon sx={{ fontSize: 60, opacity: 0.5, color: '#ea580c' }} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                            ไม่พบข้อมูลคำร้องขอจบการศึกษา
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                            ไม่มีคำร้องของนักศึกษาที่ตรงกับเงื่อนไขการค้นหา คณะ หรือสถานะการตรวจสอบที่คุณเลือกในขณะนี้
                        </Typography>
                        <Button 
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setSelectedFaculty(null);
                            }}
                            sx={{ 
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
                                color: 'white'
                            }}
                        >
                            ล้างตัวกรองทั้งหมด
                        </Button>
                    </Paper>
                ) : !selectedFaculty ? (
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
                                        bgcolor: 'background.paper'
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

                        {groupedData[selectedFaculty] && Object.keys(groupedData[selectedFaculty]).map(branch => {
                            const branchStudents = groupedData[selectedFaculty][branch] || [];
                            const currentCheckType = checkTypes[tabValue].key;
                            
                            // Only include selectable students (not passed) for select all calculations
                            const selectableBranchStudents = branchStudents.filter(s => s[currentCheckType]?.status !== 'passed');
                            const isAllSelected = selectableBranchStudents.length > 0 && selectableBranchStudents.every(s => selectedRequestIds.includes(s.id));
                            const isIndeterminate = selectableBranchStudents.some(s => selectedRequestIds.includes(s.id)) && !isAllSelected;

                            return (
                                <Accordion key={branch} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px !important', overflow: 'hidden', mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="#334155">{branch}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0, bgcolor: 'background.paper' }}>
                                        <TableContainer>
                                            <Table>
                                                <TableHead sx={{ bgcolor: 'action.hover' }}>
                                                    <TableRow>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                indeterminate={isIndeterminate}
                                                                checked={isAllSelected}
                                                                onChange={(e) => handleSelectAllInBranch(branchStudents, e.target.checked)}
                                                                disabled={selectableBranchStudents.length === 0}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>รหัสนักศึกษา</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>ชื่อ-นามสกุล</TableCell>
                                                        {(currentCheckType === "checkFiles" || currentCheckType === "checkInternship") && (
                                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>เอกสาร</TableCell>
                                                        )}
                                                        <TableCell align="center" sx={{ fontWeight: 'bold', width: 140, minWidth: 140 }}>สถานะ</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>วันที่ยื่น</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>ผ่าน &nbsp;&nbsp; ไม่ผ่าน</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {branchStudents.map(s => {
                                                        const checkData = s[currentCheckType];
                                                        const isChecked = selectedRequestIds.includes(s.id);
                                                        const isPassed = checkData.status === "passed";

                                                        return (
                                                            <TableRow 
                                                                key={s.id} 
                                                                selected={isChecked}
                                                                sx={{
                                                                    transition: 'background-color 0.2s',
                                                                    ...(isPassed ? { 
                                                                        bgcolor: alpha('#16a34a', 0.04),
                                                                        '&:hover': { bgcolor: alpha('#16a34a', 0.08) + ' !important' }
                                                                    } : {})
                                                                }}
                                                            >
                                                                <TableCell padding="checkbox">
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        disabled={isPassed}
                                                                        onChange={() => handleSelectRow(s.id)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                </TableCell>
                                                                <TableCell sx={{ fontWeight: isPassed ? 500 : 'normal' }}>{s.studentId}</TableCell>
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: isPassed ? alpha('#16a34a', 0.2) : undefined, color: isPassed ? '#166534' : undefined }}>{s.name[0]}</Avatar>
                                                                        <Typography variant="body2" sx={{ fontWeight: isPassed ? 600 : 'normal', color: isPassed ? '#166534' : 'text.primary' }}>{s.name}</Typography>
                                                                    </Box>
                                                                </TableCell>
                                                                {(currentCheckType === "checkFiles" || currentCheckType === "checkInternship") && (
                                                                    <TableCell align="center">
                                                                        <Button
                                                                            size="small"
                                                                            variant="outlined"
                                                                            disabled={currentCheckType === "checkFiles" ? !s.latestDocument : !s.latestInternshipDocument}
                                                                            onClick={() => {
                                                                                const targetDocument = currentCheckType === "checkFiles" ? s.latestDocument : s.latestInternshipDocument;
                                                                                if (!targetDocument) return;
                                                                                setPreviewDocument(targetDocument);
                                                                                setPreviewDialogOpen(true);
                                                                            }}
                                                                            sx={{
                                                                                textTransform: 'none',
                                                                                minWidth: 96,
                                                                                borderColor: isPassed ? alpha('#16a34a', 0.5) : '#7c2d12',
                                                                                color: isPassed ? '#166534' : '#7c2d12',
                                                                                '&:hover': { bgcolor: alpha('#7c2d12', 0.08) }
                                                                            }}
                                                                        >
                                                                            {currentCheckType === "checkInternship" ? "ดูสลิป" : "ดูเอกสาร"}
                                                                        </Button>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell align="center" sx={{ width: 140, minWidth: 140 }}>
                                                                    <Chip 
                                                                        label={statusConfig[checkData.status].label} 
                                                                        sx={{ 
                                                                            bgcolor: statusConfig[checkData.status].bg, 
                                                                            color: statusConfig[checkData.status].color, 
                                                                            fontWeight: 700, 
                                                                            borderRadius: 1.5, 
                                                                            fontSize: '0.75rem',
                                                                            width: 105,
                                                                            justifyContent: 'center'
                                                                        }} 
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {formatSubmittedDate(checkData.submittedAt)}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <RadioGroup
                                                                        row
                                                                        value={checkData.status}
                                                                        onChange={(e) => handleRadioChange(s, currentCheckType, e.target.value)}
                                                                        sx={{ justifyContent: 'center', gap: 4 }}
                                                                    >
                                                                        <Radio value="passed" size="small" disabled={isPassed} sx={{ p: 0.5, '&.Mui-checked': { color: '#10b981' } }} />
                                                                        <Radio value="rejected" size="small" disabled={isPassed} sx={{ p: 0.5, '&.Mui-checked': { color: '#ef4444' } }} />
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
                            );
                        })}
                    </Box>
                )}

                {/* Floating Batch Action Bar */}
                {selectedRequestIds.length > 0 && (
                    <Box sx={{
                        position: 'fixed',
                        bottom: 24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: 'background.paper',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        borderRadius: 4,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        zIndex: 1000
                    }}>
                        <Typography variant="body2" fontWeight="bold">
                            เลือกนักศึกษา {selectedRequestIds.length} คน
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => setBatchApproveOpen(true)}
                                size="small"
                                sx={{ borderRadius: 2 }}
                            >
                                อนุมัติผ่านกลุ่ม
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => setBatchRejectOpen(true)}
                                size="small"
                                sx={{ borderRadius: 2 }}
                            >
                                ปฏิเสธกลุ่ม
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setSelectedRequestIds([])}
                                size="small"
                                sx={{ borderRadius: 2 }}
                            >
                                ยกเลิก
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Dialogs */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>ระบุเหตุผลที่ไม่ผ่าน ({selectedAction ? checkTypes.find(t => t.key === selectedAction.checkType)?.label : ''})</DialogTitle>
                    <DialogContent>
                        {selectedAction?.student && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    รหัสนักศึกษา: <Typography component="span" fontWeight="bold" color="text.primary">{selectedAction.student.studentId}</Typography>
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    ชื่อ-นามสกุล: <Typography component="span" fontWeight="bold" color="text.primary">{selectedAction.student.name}</Typography>
                                </Typography>
                            </Box>
                        )}
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

                <Dialog open={passDialogOpen} onClose={() => setPassDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>ยืนยันการอนุมัติผ่าน</DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            คุณต้องการยืนยันให้ผ่านรายการนี้ใช่หรือไม่?
                        </Typography>
                        {selectedAction?.student && (
                            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2, display: 'inline-block' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    รหัสนักศึกษา: <Typography component="span" fontWeight="bold" color="text.primary">{selectedAction.student.studentId}</Typography>
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    ชื่อ-นามสกุล: <Typography component="span" fontWeight="bold" color="text.primary">{selectedAction.student.name}</Typography>
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setPassDialogOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleConfirmPass} variant="contained" color="success">ยืนยัน</Button>
                    </DialogActions>
                </Dialog>

                {/* Batch Actions Dialogs */}
                <Dialog open={batchApproveOpen} onClose={() => setBatchApproveOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>ยืนยันอนุมัติผ่านเป็นกลุ่ม</DialogTitle>
                    <DialogContent sx={{ py: 2 }}>
                        <Typography variant="body1">
                            คุณต้องการยืนยันให้ <strong>ผ่าน</strong> ทุกคำร้องที่เลือกจำนวน <strong>{selectedRequestIds.length} รายการ</strong> ใช่หรือไม่?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setBatchApproveOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleBatchApproveConfirm} variant="contained" color="success">ยืนยันอนุมัติกลุ่ม</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={batchRejectOpen} onClose={() => setBatchRejectOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>ระบุเหตุผลที่ไม่ผ่านสำหรับกลุ่มคำร้อง</DialogTitle>
                    <DialogContent sx={{ py: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            คุณต้องการให้ <strong>ไม่ผ่าน</strong> สำหรับรายการที่เลือกทั้งหมด <strong>{selectedRequestIds.length} รายการ</strong> กรุณาระบุเหตุผล:
                        </Typography>
                        <TextField
                            autoFocus margin="dense" label="หมายเหตุ / เหตุผลกลุ่ม" fullWidth multiline rows={3}
                            value={batchRejectComment} onChange={(e) => setBatchRejectComment(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setBatchRejectOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleBatchRejectConfirm} variant="contained" color="error" disabled={!batchRejectComment.trim()}>บันทึกปฏิเสธกลุ่ม</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} fullWidth maxWidth="md">
                    <DialogTitle>ดูเอกสารที่อัปโหลด</DialogTitle>
                    <DialogContent>
                        {previewDocument && (
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {previewDocument.originalName}
                                </Typography>

                                {String(previewDocument.mimeType || '').startsWith('image/') ? (
                                    <Box
                                        component="img"
                                        src={getDocumentUrl(previewDocument)}
                                        alt={previewDocument.originalName || 'Uploaded document'}
                                        sx={{
                                            width: '100%',
                                            maxHeight: '70vh',
                                            objectFit: 'contain',
                                            borderRadius: 2,
                                            border: '1px solid #e2e8f0'
                                        }}
                                    />
                                ) : (
                                    <Box
                                        component="iframe"
                                        src={getDocumentUrl(previewDocument)}
                                        title={previewDocument.originalName || 'Uploaded document'}
                                        sx={{
                                            width: '100%',
                                            height: '70vh',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 2,
                                        }}
                                    />
                                )}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        {previewDocument && (
                            <Button
                                component="a"
                                href={getDocumentUrl(previewDocument)}
                                download={previewDocument.originalName || true}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outlined"
                                sx={{ textTransform: 'none' }}
                            >
                                ดาวน์โหลดไฟล์
                            </Button>
                        )}
                        <Button onClick={() => setPreviewDialogOpen(false)}>ปิด</Button>
                    </DialogActions>
                </Dialog>

                {/* Toast Notification (Snackbar) */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={4000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert 
                        onClose={() => setSnackbarOpen(false)} 
                        severity={snackbarSeverity} 
                        sx={{ width: '100%', borderRadius: 2, fontWeight: 'bold' }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}
