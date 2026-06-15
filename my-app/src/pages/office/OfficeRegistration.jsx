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
import { API_BASE_URL, getRequests, updateRequestStep, updateRequestStepBatch } from "../../services/api";
import { exportToCSV } from "../../services/csvExport";

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
        const ids = branchStudents.map(s => s.id);
        if (checked) {
            setSelectedRequestIds(prev => {
                const newIds = ids.filter(id => !prev.includes(id));
                return [...prev, ...newIds];
            });
        } else {
            setSelectedRequestIds(prev => prev.filter(id => !ids.includes(id)));
        }
    };

    const handleBatchApproveConfirm = async () => {
        if (selectedRequestIds.length === 0) return;
        const stepKey = checkTypes[tabValue].stepKey;
        try {
            await updateRequestStepBatch({
                ids: selectedRequestIds,
                step: stepKey,
                status: 'approved',
                comment: '',
                userId: currentUser?.id
            });
            setSelectedRequestIds([]);
            setBatchApproveOpen(false);
            await fetchRequests();
        } catch (error) {
            console.error('Failed batch approve:', error);
        }
    };

    const handleBatchRejectConfirm = async () => {
        if (selectedRequestIds.length === 0 || !batchRejectComment.trim()) return;
        const stepKey = checkTypes[tabValue].stepKey;
        try {
            await updateRequestStepBatch({
                ids: selectedRequestIds,
                step: stepKey,
                status: 'rejected',
                comment: batchRejectComment,
                userId: currentUser?.id
            });
            setSelectedRequestIds([]);
            setBatchRejectComment("");
            setBatchRejectOpen(false);
            await fetchRequests();
        } catch (error) {
            console.error('Failed batch reject:', error);
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

    const THEME_GRADIENT = "linear-gradient(to right, #064460, #095a80, #0e83b8)";

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
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="800" color="text.primary">งานทะเบียนและวัดผล</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportReport}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        ส่งออกข้อมูล CSV
                      </Button>
                </Box>

                {loading && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        กำลังโหลดข้อมูลคำร้อง...
                    </Typography>
                )}

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
                            color="#16a34a"
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
                    {checkTypes.map((type) => (
                        <Tab key={type.key} icon={type.icon} iconPosition="start" label={type.label} />
                    ))}
                </Tabs>

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
                            const isAllSelected = branchStudents.length > 0 && branchStudents.every(s => selectedRequestIds.includes(s.id));
                            const isIndeterminate = branchStudents.some(s => selectedRequestIds.includes(s.id)) && !isAllSelected;

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
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>รหัสนักศึกษา</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>ชื่อ-นามสกุล</TableCell>
                                                        {(checkTypes[tabValue].key === "checkFiles" || checkTypes[tabValue].key === "checkInternship") && (
                                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>เอกสาร</TableCell>
                                                        )}
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>วันที่ยื่น</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>ผ่าน &nbsp;&nbsp; ไม่ผ่าน</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {branchStudents.map(s => {
                                                        const currentCheckType = checkTypes[tabValue].key;
                                                        const checkData = s[currentCheckType];
                                                        const isChecked = selectedRequestIds.includes(s.id);

                                                        return (
                                                            <TableRow key={s.id} selected={isChecked}>
                                                                <TableCell padding="checkbox">
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        onChange={() => handleSelectRow(s.id)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{s.studentId}</TableCell>
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{s.name[0]}</Avatar>
                                                                        <Typography variant="body2">{s.name}</Typography>
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
                                                                                borderColor: 'primary.main',
                                                                                '&:hover': { bgcolor: alpha('#064460', 0.08) }
                                                                            }}
                                                                        >
                                                                            {currentCheckType === "checkInternship" ? "ดูสลิป" : "ดูเอกสาร"}
                                                                        </Button>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell align="center">
                                                                    <Chip label={statusConfig[checkData.status].label} sx={{ bgcolor: statusConfig[checkData.status].bg, color: statusConfig[checkData.status].color, fontWeight: 700, borderRadius: 1, fontSize: '0.75rem' }} />
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
                                                                        <Radio value="passed" size="small" disabled={checkData.status === "passed"} sx={{ p: 0.5, '&.Mui-checked': { color: '#10b981' } }} />
                                                                        <Radio value="rejected" size="small" disabled={checkData.status === "passed"} sx={{ p: 0.5, '&.Mui-checked': { color: '#ef4444' } }} />
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
            </Box>
        </Box>
    );
}
