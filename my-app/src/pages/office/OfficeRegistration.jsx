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
import { API_BASE_URL, getRequests, updateRequestStep } from "../../services/api";

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
        name: request.User?.name || 'ไม่ทราบชื่อ',
        faculty: request.User?.faculty || 'อื่นๆ',
        branch: request.User?.branch || 'สาขาทั่วไป',
        checkGrades: { status: toUiStatus(steps.grade_check?.status), comment: steps.grade_check?.comment || '', submittedAt: steps.grade_check?.updatedAt || null },
        checkFiles: { status: toUiStatus(steps.file_check?.status), comment: steps.file_check?.comment || '', submittedAt: steps.file_check?.updatedAt || null },
        checkTuition: { status: toUiStatus(steps.tuition_check?.status), comment: steps.tuition_check?.comment || '', submittedAt: steps.tuition_check?.updatedAt || null },
        checkInternship: { status: toUiStatus(steps.internship_fee_check?.status), comment: steps.internship_fee_check?.comment || '', submittedAt: steps.internship_fee_check?.updatedAt || null },
        latestDocument: generalDocuments.length > 0 ? generalDocuments[generalDocuments.length - 1] : null,
        latestInternshipDocument: internshipDocuments.length > 0 ? internshipDocuments[internshipDocuments.length - 1] : null,
    };
};

export default function OfficeRegistration() {
    const [students, setStudents] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null); // { studentId, checkType }
    const [tempComment, setTempComment] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getRequests({ submittedOnly: true });
            setStudents(data.map(mapRequestToStudent));
        } catch (error) {
            console.error('Failed to fetch requests for registration office:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRadioChange = (student, checkType, value) => {
        if (value === "rejected") {
            setSelectedAction({ id: student.id, checkType });
            setTempComment(student[checkType].comment);
            setDialogOpen(true);
        } else {
            updateStatus(student.id, checkType, "passed", "");
        }
    };

    const updateStatus = async (id, checkType, status, comment) => {
        const checkTypeConfig = checkTypes.find(type => type.key === checkType);
        if (!checkTypeConfig) return;

        const actorUserId = currentUser?.id;
        if (!actorUserId) {
            console.error('Cannot update request step: user session is missing');
            return;
        }

        if (currentUser?.role === 'Office' && ['file_check', 'tuition_check', 'grade_check', 'internship_fee_check'].includes(checkTypeConfig.stepKey)) {
            const allowedRegistrationDepts = ['ฝ่ายทะเบียน', 'งานทะเบียน', 'ทะเบียน'];
            if (!allowedRegistrationDepts.includes(String(currentUser?.deptName || '').trim())) {
                console.error('Cannot update registration step: office department is not allowed', currentUser?.deptName);
                return;
            }
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
        await updateStatus(selectedAction.id, selectedAction.checkType, "rejected", tempComment);
        setDialogOpen(false);
    };

    const getDocumentUrl = (document) => {
        if (!document?.url) return '';
        if (String(document.url).startsWith('http')) return document.url;
        return `${API_BASE_URL}${document.url}`;
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
                            title="ผ่าน/ครบถ้วน"
                            count={stats.passed}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

                        {Object.keys(groupedData[selectedFaculty]).map(branch => (
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
                                                    {(checkTypes[tabValue].key === "checkFiles" || checkTypes[tabValue].key === "checkInternship") && (
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>เอกสาร</TableCell>
                                                    )}
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>วันที่ยื่น</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>ผ่าน &nbsp;&nbsp; ไม่ผ่าน</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {groupedData[selectedFaculty][branch].map(s => {
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
                                                                            borderColor: '#3b82f6',
                                                                            color: '#2563eb',
                                                                            '&:hover': { borderColor: '#2563eb', bgcolor: alpha('#3b82f6', 0.08) }
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
                    </Box>
                )}

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
