import React, { useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import SendIcon from '@mui/icons-material/Send';
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "../../App.css";
import { API_BASE_URL, createRequest, getRequests, submitRequestForReview, uploadRequestDocument } from "../../services/api";

// ✅ Modal รายละเอียดแต่ละรายการตามข้อมูลจริงที่ผู้ใช้กำหนด
// ✅ เฉพาะส่วนนักศึกษา + Logic เปลี่ยนสถานะ + Animation

const theme = createTheme({


  typography: {
    fontFamily: `"Noto Sans Thai", "Prompt", "Sarabun", "Inter", -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif`,
    fontSize: 12,
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 22 } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 14, textTransform: "none" } } },
  },
});

// ✅ ข้อมูลรายละเอียดรายรายการ (ตามที่ผู้ใช้กำหนด)
const taskDetails = {
  "โครงสร้างหลักสูตร": [
    { label: "ผลการเรียน", value: "รอดำเนินการ" },
    { label: "ค่าลงทะเบียนเรียน", value: "รอดำเนินการ" },
    { label: "สถานภาพ", value: "รอดำเนินการ" },
  ],
  "ห้องสมุด": [
    { label: "ค้างชำระ", value: "รอดำเนินการ" },
  ],
  "กิจกรรม": [
    { label: "ผลกิจกรรม", value: "รอดำเนินการ" },
  ],
  "สอบดิจิทัล": [
    { label: "เกณฑ์การสอบ", value: "รอดำเนินการ" },
  ],
  "สอบอังกฤษ": [
    { label: "เกณฑ์การสอบ", value: "รอดำเนินการ" },
  ],
  "เอกสารที่อัปโหลด": [
    { label: "อัปโหลดล่าสุด", value: "รอดำเนินการ" },
    { label: "ผลการตรวจสอบ", value: "รอดำเนินการ" },
  ],
  "ชำระค่าออกฝึก": [
    { label: "ผลการตรวจสอบ", value: "รอดำเนินการ" },
  ],
  "ที่ปรึกษาตรวจสอบ": [
    { label: "ผลการตรวจสอบ", value: "รอดำเนินการ" },
  ],
};

const taskTemplate = [
  { id: 1, name: "โครงสร้างหลักสูตร", status: "waiting" },
  { id: 2, name: "ห้องสมุด", status: "waiting" },
  { id: 3, name: "กิจกรรม", status: "waiting" },
  { id: 4, name: "สอบดิจิทัล", status: "waiting" },
  { id: 5, name: "สอบอังกฤษ", status: "waiting" },
  { id: 6, name: "เอกสารที่อัปโหลด", status: "waiting", uploadable: true, fileUploaded: false },
  { id: 7, name: "ชำระค่าออกฝึก", status: "waiting", uploadable: true, fileUploaded: false },
  { id: 8, name: "ที่ปรึกษาตรวจสอบ", status: "waiting" },
];

const statusMap = {
  waiting: { label: "รอดำเนินการ", color: "#FACC15", text: "#92400E" },
  passed: { label: "ผ่าน", color: "#BBF7D0", text: "#166534" },
  rejected: { label: "ไม่ผ่าน", color: "#FECACA", text: "#991B1B" },
};

const stepToTaskStatus = {
  waiting: "waiting",
  in_progress: "waiting",
  approved: "passed",
  rejected: "rejected",
};

const requestStatusToHistoryStatus = {
  Pending: "waiting",
  "In Progress": "waiting",
  Completed: "passed",
  Rejected: "rejected",
};

const stepStatusToThai = {
  waiting: "รอดำเนินการ",
  in_progress: "กำลังตรวจสอบ",
  approved: "ผ่าน",
  rejected: "ไม่ผ่าน",
};

const stepLabelMap = {
  file_check: "ตรวจสอบไฟล์",
  tuition_check: "ตรวจสอบค่าเทอม",
  grade_check: "ตรวจสอบเกรด",
  internship_fee_check: "ตรวจสอบค่าออกฝึก",
  library_check: "ห้องสมุด",
  activity_general_check: "กิจกรรมกลาง",
  activity_faculty_check: "กิจกรรมคณะ",
  digital_exam_check: "สอบดิจิทัล",
  language_center: "สอบภาษา",
  advisor: "ที่ปรึกษา",
};

const taskStepMap = {
  "โครงสร้างหลักสูตร": "tuition_check",
  "ห้องสมุด": "library_check",
  "สอบดิจิทัล": "digital_exam_check",
  "สอบอังกฤษ": "language_center",
  "ชำระค่าออกฝึก": "internship_fee_check",
  "ที่ปรึกษาตรวจสอบ": "grade_check",
};

const taskItemStepMap = {
  "โครงสร้างหลักสูตร": {
    "ผลการเรียน": "grade_check",
    "ค่าลงทะเบียนเรียน": "tuition_check",
    "สถานภาพ": "file_check",
  },
};

const formatThaiDateTime = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCurrentAcademicYear = () => {
  const now = new Date();
  const buddhistYear = now.getFullYear() + 543;
  return String(buddhistYear);
};

const getCurrentSemester = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 5) return "2";
  if (month >= 6 && month <= 10) return "1";
  return "3";
};

function mapRequestToTasks(request, prevTasks) {
  if (!request?.steps) {
    return prevTasks.map(task => ({ ...task, status: "waiting" }));
  }

  const activityGeneralStatus = request.steps?.activity_general_check?.status || "waiting";
  const activityFacultyStatus = request.steps?.activity_faculty_check?.status || "waiting";
  const activityUiStatuses = [
    stepToTaskStatus[activityGeneralStatus] || "waiting",
    stepToTaskStatus[activityFacultyStatus] || "waiting",
  ];

  const activityCombinedStatus = activityUiStatuses.includes("rejected")
    ? "rejected"
    : activityUiStatuses.every(status => status === "passed")
      ? "passed"
      : activityUiStatuses.some(status => status === "passed" || status === "waiting")
        ? "waiting"
        : "waiting";

  const stepMapByTaskId = {
    1: "tuition_check",
    2: "library_check",
    4: "digital_exam_check",
    5: "language_center",
    7: "internship_fee_check",
    8: "grade_check",
  };

  return prevTasks.map((task) => {
    if (task.id === 6) {
      return task;
    }

    if (task.id === 3) {
      return {
        ...task,
        status: activityCombinedStatus,
      };
    }

    const stepKey = stepMapByTaskId[task.id];
    const stepStatus = request.steps?.[stepKey]?.status || "waiting";
    return {
      ...task,
      status: stepToTaskStatus[stepStatus] || "waiting",
    };
  });
}

export default function StudentScreenUI() {
  const [tasks, setTasks] = useState(taskTemplate);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [confirmSubmitDialogOpen, setConfirmSubmitDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUploadTask, setSelectedUploadTask] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const latestGeneralDocument = useMemo(() => {
    if (!Array.isArray(currentRequest?.documents) || currentRequest.documents.length === 0) {
      return null;
    }
    const generalDocuments = currentRequest.documents.filter((document) => {
      const type = String(document?.documentType || '').trim().toLowerCase();
      return type === '' || type === 'general';
    });
    return generalDocuments[generalDocuments.length - 1] || null;
  }, [currentRequest]);

  const latestInternshipReceiptDocument = useMemo(() => {
    if (!Array.isArray(currentRequest?.documents) || currentRequest.documents.length === 0) {
      return null;
    }
    const internshipDocuments = currentRequest.documents.filter((document) =>
      String(document?.documentType || '').trim().toLowerCase() === 'internship_receipt'
    );
    return internshipDocuments[internshipDocuments.length - 1] || null;
  }, [currentRequest]);

  const getDocumentUrl = (document) => {
    if (!document?.url) return "";
    if (String(document.url).startsWith('http')) return document.url;
    return `${API_BASE_URL}${document.url}`;
  };

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const rejectedStepLabels = useMemo(() => {
    const steps = currentRequest?.steps || {};
    const stepKeys = Object.keys(stepLabelMap);
    const labels = stepKeys
      .filter((stepKey) => String(steps?.[stepKey]?.status || '').toLowerCase() === 'rejected')
      .map((stepKey) => stepLabelMap[stepKey]);

    return Array.from(new Set(labels));
  }, [currentRequest]);

  const getTaskLastUpdatedAt = (taskName) => {
    if (!currentRequest?.steps) return null;
    if (taskName === "กิจกรรม") {
      const generalAt = currentRequest.steps?.activity_general_check?.updatedAt;
      const facultyAt = currentRequest.steps?.activity_faculty_check?.updatedAt;
      const candidates = [generalAt, facultyAt].filter(Boolean).map((value) => new Date(value).getTime()).filter((time) => Number.isFinite(time));
      if (candidates.length === 0) return null;
      return new Date(Math.max(...candidates));
    }
    if (taskName === "เอกสารที่อัปโหลด") {
      const fileCheckAt = currentRequest.steps?.file_check?.updatedAt;
      const uploadedAt = latestGeneralDocument?.uploadedAt;
      const candidates = [fileCheckAt, uploadedAt].filter(Boolean).map((value) => new Date(value).getTime()).filter((time) => Number.isFinite(time));
      if (candidates.length === 0) return null;
      return new Date(Math.max(...candidates));
    }
    if (taskName === "ชำระค่าออกฝึก") {
      const internshipCheckAt = currentRequest.steps?.internship_fee_check?.updatedAt;
      const uploadedAt = latestInternshipReceiptDocument?.uploadedAt;
      const candidates = [internshipCheckAt, uploadedAt].filter(Boolean).map((value) => new Date(value).getTime()).filter((time) => Number.isFinite(time));
      if (candidates.length === 0) return null;
      return new Date(Math.max(...candidates));
    }
    const stepKey = taskStepMap[taskName];
    if (!stepKey) return null;
    const updatedAt = currentRequest.steps?.[stepKey]?.updatedAt;
    if (!updatedAt) return null;
    const parsed = new Date(updatedAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const getTaskItemRejectComment = (taskName, itemLabel) => {
    if (!currentRequest?.steps) return "";
    if (taskName === "กิจกรรม") {
      const generalStatus = currentRequest.steps?.activity_general_check?.status;
      const facultyStatus = currentRequest.steps?.activity_faculty_check?.status;
      const generalComment = currentRequest.steps?.activity_general_check?.comment || "";
      const facultyComment = currentRequest.steps?.activity_faculty_check?.comment || "";
      if (generalStatus === "rejected" && facultyStatus === "rejected") {
        return [generalComment, facultyComment].filter(Boolean).join(" | ");
      }
      if (generalStatus === "rejected") return generalComment;
      if (facultyStatus === "rejected") return facultyComment;
      return "";
    }

    const mappedStepByItem = taskItemStepMap[taskName]?.[itemLabel];
    const stepKey = mappedStepByItem || taskStepMap[taskName];
    if (!stepKey) return "";
    const step = currentRequest.steps?.[stepKey];
    if (step?.status !== "rejected") return "";
    return step?.comment || "";
  };

  const fetchStudentData = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      const requests = await getRequests({ studentId: currentUser.id });
      const sortedRequests = [...requests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const activeRequest = sortedRequests.find(
        (request) => request.status === "Pending" || request.status === "In Progress"
      ) || sortedRequests[0] || null;

      setCurrentRequest(activeRequest);
      setTasks((prev) => {
        const mapped = mapRequestToTasks(activeRequest, prev);
        const documents = Array.isArray(activeRequest?.documents) ? activeRequest.documents : [];
        const hasGeneralDocument = documents.some((document) => {
          const type = String(document?.documentType || '').trim().toLowerCase();
          return type === '' || type === 'general';
        });
        const hasInternshipReceipt = documents.some((document) =>
          String(document?.documentType || '').trim().toLowerCase() === 'internship_receipt'
        );
        const fileCheckStatus = activeRequest?.steps?.file_check?.status || 'waiting';
        const internshipStatus = activeRequest?.steps?.internship_fee_check?.status || 'waiting';
        const documentTaskStatus = hasGeneralDocument
          ? (fileCheckStatus === 'approved' ? 'passed' : fileCheckStatus === 'rejected' ? 'rejected' : 'waiting')
          : 'waiting';
        const internshipTaskStatus = hasInternshipReceipt
          ? (internshipStatus === 'approved' ? 'passed' : internshipStatus === 'rejected' ? 'rejected' : 'waiting')
          : 'waiting';
        return mapped.map((task) => {
          if (task.id === 6) {
            return {
              ...task,
              fileUploaded: hasGeneralDocument,
              status: documentTaskStatus,
            };
          }
          if (task.id === 7) {
            return {
              ...task,
              fileUploaded: hasInternshipReceipt,
              status: internshipTaskStatus,
            };
          }
          return task;
        });
      });

      const mappedHistory = sortedRequests.map((request, index) => {
        const rejectedStep = request.status === "Rejected"
          ? Object.values(request.steps || {}).find((step) => step.status === "rejected")
          : null;

        return {
          id: request.id || index + 1,
          date: formatThaiDateTime(request.createdAt),
          status: requestStatusToHistoryStatus[request.status] || "waiting",
          rejectedDate: rejectedStep?.updatedAt ? formatThaiDateTime(rejectedStep.updatedAt) : null,
          remark: rejectedStep?.comment || null,
        };
      });

      setSubmissionHistory(mappedHistory);
    } catch (error) {
      console.error("Failed to fetch student requests:", error);
      setDialogMessage("ไม่สามารถโหลดข้อมูลคำร้องได้");
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [currentUser?.id]);

  const waitingCount = tasks.filter((t) => t.status === "waiting").length;
  const passedCount = tasks.filter((t) => t.status === "passed").length;
  const rejectedCount = tasks.filter((t) => t.status === "rejected").length;

  const openModal = (task) => {
    setSelectedTask(task);
    setOpen(true);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setDialogMessage("กรุณาเลือกไฟล์ก่อนอัปโหลด");
      setDialogOpen(true);
      return;
    }

    if (!currentRequest?.id) {
      setDialogMessage("ยังไม่มีคำร้องที่ใช้งานอยู่ กรุณาส่งคำร้องก่อนอัปโหลด");
      setDialogOpen(true);
      return;
    }

    if (!selectedUploadTask?.id) {
      setDialogMessage("ไม่พบประเภทเอกสารที่ต้องการอัปโหลด");
      setDialogOpen(true);
      return;
    }

    setIsUploading(true);
    try {
      const uploadType = selectedUploadTask.id === 7 ? 'internship_receipt' : 'general';
      await uploadRequestDocument(currentRequest.id, selectedFile, currentUser?.id, uploadType);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedUploadTask(null);
      setDialogMessage(
        uploadType === 'internship_receipt'
          ? "อัพโหลดสลิปค่าออกฝึกสำเร็จ\nรอเจ้าหน้าที่ตรวจสอบ"
          : "อัพโหลดไฟล์สำเร็จ\nรอเจ้าหน้าที่ตรวจสอบ"
      );
      setDialogOpen(true);
      setLoading(true);
      await fetchStudentData();
    } catch (error) {
      console.error("Failed to upload file:", error);
      setDialogMessage(error?.response?.data?.message || "อัปโหลดไฟล์ไม่สำเร็จ");
      setDialogOpen(true);
    } finally {
      setIsUploading(false);
    }
  };

  const openHistoryDetail = (history) => {
    setSelectedHistory(history);
    setHistoryOpen(true);
  };

  const handleSubmitForDepartmentReview = async () => {
    if (!currentUser?.id) {
      setDialogMessage("ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่");
      setDialogOpen(true);
      return;
    }

    try {
      let requestId = currentRequest?.id;

      // Auto-create request for first-time students before submitting to departments.
      if (!requestId) {
        const createdRequest = await createRequest({
          studentId: currentUser.id,
          academicYear: getCurrentAcademicYear(),
          semester: getCurrentSemester(),
        });
        requestId = createdRequest?.id;
      }

      if (!requestId) {
        setDialogMessage("ไม่สามารถสร้างคำร้องใหม่ได้");
        setDialogOpen(true);
        return;
      }

      await submitRequestForReview(requestId, currentUser.id);
      setDialogMessage(
        currentRequest?.status === "Rejected"
          ? "ยื่นคำร้องใหม่เฉพาะส่วนที่ไม่ผ่านเรียบร้อยแล้ว"
          : "ส่งคำร้องไปยังหน่วยงานตรวจสอบเรียบร้อยแล้ว"
      );
      setDialogOpen(true);
      setLoading(true);
      await fetchStudentData();
    } catch (error) {
      console.error("Failed to submit request for department review:", error);
      setDialogMessage(error?.response?.data?.message || "ส่งคำร้องไม่สำเร็จ");
      setDialogOpen(true);
    }
  };

  const handleOpenSubmitConfirm = () => {
    if (!currentUser?.id) {
      setDialogMessage("ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่");
      setDialogOpen(true);
      return;
    }

    setConfirmSubmitDialogOpen(true);
  };

  const allTasksPassed = tasks.length > 0 && passedCount === tasks.length;
  const shouldHideSubmitAction = allTasksPassed || currentRequest?.status === "Completed";
  const canSubmitForReview = !currentRequest || ["Pending", "Rejected"].includes(currentRequest.status);
  const submitButtonLabel = currentRequest?.status === "In Progress"
    ? "ยื่นแล้ว (รอตรวจสอบ)"
    : "ยื่นใบคำร้อง";

  const requestHintText = !currentRequest
    ? "ยังไม่มีคำร้องที่ใช้งานอยู่"
    : currentRequest.status === "Pending"
      ? "พร้อมยื่นคำร้องไปยังหน่วยงานตรวจสอบ"
      : currentRequest.status === "In Progress"
        ? "คำร้องถูกส่งแล้วและกำลังรอหน่วยงานตรวจสอบ"
        : currentRequest.status === "Rejected"
          ? "คำร้องถูกตีกลับ สามารถยื่นใหม่เฉพาะส่วนที่ไม่ผ่านได้ โดยส่วนที่ผ่านแล้วจะคงสถานะเดิม"
          : "คำร้องเสร็จสมบูรณ์แล้ว ไม่ต้องดำเนินการเพิ่มเติม";

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', bgcolor: '#ffffff' }}>

          {/* Summary Section (Moved to Top) */}
          <Box sx={{
            p: 1,
            display: { xs: 'flex', sm: 'grid' },
            justifyContent: 'center',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <SummaryCard title="รอดำเนินการ" value={waitingCount} colorClass="bg-amber-50" textColor="text-amber-800" />
            <SummaryCard title="ผ่าน" value={passedCount} colorClass="bg-green-50" textColor="text-green-800" />
            <SummaryCard title="ไม่ผ่าน" value={rejectedCount} colorClass="bg-rose-50" textColor="text-rose-800" />
          </Box>

          {/* Main Content: History & Tasks */}
          <Box className="p-4 md:p-6">
            {loading && (
              <Typography className="text-sm text-slate-500 mb-4">
                กำลังโหลดข้อมูลคำร้อง...
              </Typography>
            )}

            {/* History Section */}
            <Box className="mb-8 border-b border-slate-200 pb-6">
              <Typography variant="h6" className="font-bold text-slate-900 mb-4">
                ประวัติการยื่นคำร้อง
              </Typography>
              <TableContainer component={Paper} className="mb-4 border border-slate-200 shadow-sm" sx={{ borderRadius: 3 }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>วันที่ยื่น</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>สถานะ</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>วันที่ตีกลับ</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>หมายเหตุ</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>จัดการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissionHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#64748b' }}>
                            ยังไม่มีประวัติการยื่นคำร้อง
                          </TableCell>
                        </TableRow>
                      ) : (
                        submissionHistory.map((history) => (
                          <TableRow key={history.id} hover>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{history.date}</TableCell>
                            <TableCell>
                              <Chip
                                label={statusMap[history.status]?.label || "รอดำเนินการ"}
                                size="small"
                                sx={{
                                  backgroundColor: statusMap[history.status]?.color || statusMap.waiting.color,
                                  color: statusMap[history.status]?.text || statusMap.waiting.text,
                                  fontWeight: 700,
                                  fontSize: "0.72rem",
                                  height: "22px",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap', color: history.status === 'rejected' ? '#dc2626' : '#64748b' }}>
                              {history.rejectedDate || '-'}
                            </TableCell>
                            <TableCell sx={{ minWidth: 240, color: '#334155' }}>
                              {history.remark || '-'}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                onClick={() => openHistoryDetail(history)}
                                sx={{
                                  color: "#064460",
                                  textTransform: "none",
                                  fontSize: "0.8rem",
                                  bgcolor: '#e0f7fa',
                                  '&:hover': { bgcolor: '#b2ebf2' }
                                }}
                              >
                                ดูรายละเอียด
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </TableContainer>

              {/* Action Buttons */}
              {!shouldHideSubmitAction && (
                <Box>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleOpenSubmitConfirm}
                    disabled={!canSubmitForReview || loading}
                    sx={{
                      backgroundColor: canSubmitForReview ? "#064460" : "#f1f5f9",
                      color: canSubmitForReview ? "white" : "#94a3b8",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      py: 1,
                      "&:hover": {
                        backgroundColor: canSubmitForReview ? "#04364e" : "#f1f5f9",
                      }
                    }}
                  >
                    {canSubmitForReview
                      ? (currentRequest?.status === "Rejected" ? "ยื่นใหม่ (เฉพาะส่วนที่ไม่ผ่าน)" : "ส่งคำร้องไปยังงานต่างๆตรวจสอบ")
                      : submitButtonLabel}
                  </Button>
                </Box>
              )}
              <Typography className="text-xs text-slate-500 mt-3">
                {requestHintText}
              </Typography>
            </Box>

            {/* Task List */}
            <Box className="pb-20">
              <Box className="mb-4">
                <Typography variant="h6" className="font-bold text-slate-900">
                  รายการตรวจสอบ
                </Typography>
              </Box>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <AnimatePresence>
                  {tasks.map((t) => (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="border border-slate-200 h-full shadow-sm hover:shadow-md transition-all" sx={{ borderRadius: 3 }}>
                        <CardContent className="p-4 flex flex-col gap-3">
                          <Box className="flex items-start justify-between gap-2">
                            <Typography className="font-semibold text-base text-slate-900 flex-1">
                              {t.name}
                            </Typography>
                            <Chip
                              label={statusMap[t.status].label}
                              sx={{
                                backgroundColor: statusMap[t.status].color,
                                color: statusMap[t.status].text,
                                px: 1,
                                fontWeight: 700,
                                borderRadius: 2,
                                fontSize: "0.75rem",
                                height: "24px",
                              }}
                            />
                          </Box>
                          <Box className="flex gap-2 mt-auto">
                            <Button
                              size="small"
                              onClick={() => openModal(t)}
                              sx={{
                                color: "#064460",
                                textTransform: "none",
                                fontSize: "0.875rem",
                                justifyContent: "flex-start",
                                padding: 0,
                                "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                              }}
                            >
                              ดูรายละเอียด
                            </Button>
                            {t.uploadable && (!t.fileUploaded || t.status === "rejected") && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => {
                                  if (!currentRequest?.id) {
                                    setDialogMessage("กรุณาส่งคำร้องก่อนอัปโหลดเอกสาร");
                                    setDialogOpen(true);
                                    return;
                                  }
                                  setSelectedUploadTask(t);
                                  setUploadDialogOpen(true);
                                }}
                                sx={{
                                  ml: 'auto',
                                  backgroundColor: "#F9C824",
                                  color: "white",
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                  padding: "2px 10px",
                                  borderRadius: 2,
                                  "&:hover": { backgroundColor: "#F9C824" },
                                }}
                              >
                                {t.fileUploaded ? "อัพโหลดใหม่" : "อัพโหลด"}
                              </Button>
                            )}
                            {t.uploadable && t.fileUploaded && ((t.id === 7 && latestInternshipReceiptDocument) || (t.id !== 7 && latestGeneralDocument)) && (
                              <Button
                                size="small"
                                component="a"
                                href={getDocumentUrl(t.id === 7 ? latestInternshipReceiptDocument : latestGeneralDocument)}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  ml: (t.status === "rejected") ? 0 : 'auto',
                                  color: '#166534',
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                                }}
                              >
                                {t.id === 7 ? "ดูสลิป" : "ดูไฟล์"}
                              </Button>
                            )}
                          </Box>
                          {t.uploadable && t.status === "rejected" && (
                            <Typography
                              sx={{
                                mt: 1,
                                color: '#b91c1c',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {t.id === 7
                                ? "สลิปค่าออกฝึกไม่ผ่านการตรวจสอบ กรุณาอัปโหลดไฟล์ใหม่"
                                : "ไฟล์ไม่ผ่านการตรวจสอบ กรุณาอัปโหลดไฟล์ใหม่"}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            </Box>

          </Box>

          {/* Modals ... (Keep existing logic) */}
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            {selectedTask && (
              <Box className="p-6 md:p-8 space-y-5">
                <Typography className="text-center font-bold text-lg md:text-xl text-slate-900">
                  {selectedTask.name}
                </Typography>
                <Typography className="text-center text-xs md:text-sm text-gray-500">
                  {(() => {
                    const lastUpdated = getTaskLastUpdatedAt(selectedTask.name);
                    return `อัพเดตล่าสุดเมื่อ ${formatThaiDateTime(lastUpdated)}`;
                  })()}
                </Typography>

                <Box className="bg-gray-50 rounded-lg p-4 space-y-3 md:space-y-4">
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {taskDetails[selectedTask.name]?.map((item, idx) => {
                      let displayValue = item.value;

                      if (selectedTask.name === "กิจกรรม") {
                        const generalStatus = currentRequest?.steps?.activity_general_check?.status || "waiting";
                        const facultyStatus = currentRequest?.steps?.activity_faculty_check?.status || "waiting";
                        const generalUi = stepStatusToThai[generalStatus] || "รอดำเนินการ";
                        const facultyUi = stepStatusToThai[facultyStatus] || "รอดำเนินการ";
                        if (generalStatus === "rejected" || facultyStatus === "rejected") {
                          displayValue = "ไม่ผ่าน";
                        } else if (generalStatus === "approved" && facultyStatus === "approved") {
                          displayValue = "ผ่าน";
                        } else if (item.label === "ผลกิจกรรม") {
                          displayValue = `กลาง: ${generalUi} / คณะ: ${facultyUi}`;
                        }
                      }

                      const mappedStepByItem = taskItemStepMap[selectedTask.name]?.[item.label];
                      if (mappedStepByItem) {
                        const stepStatus = currentRequest?.steps?.[mappedStepByItem]?.status || 'waiting';
                        displayValue = stepStatusToThai[stepStatus] || "รอดำเนินการ";
                      }

                      if (selectedTask.name !== "กิจกรรม" && !mappedStepByItem && taskStepMap[selectedTask.name]) {
                        const stepKey = taskStepMap[selectedTask.name];
                        const stepStatus = currentRequest?.steps?.[stepKey]?.status || 'waiting';
                        displayValue = stepStatusToThai[stepStatus] || "รอดำเนินการ";
                      }

                      if (selectedTask.name === "เอกสารที่อัปโหลด") {
                        const fileCheckStepStatus = currentRequest?.steps?.file_check?.status || 'waiting';
                        if (item.label === "อัปโหลดล่าสุด") {
                          displayValue = latestGeneralDocument
                            ? formatThaiDateTime(latestGeneralDocument.uploadedAt)
                            : "ยังไม่อัปโหลด";
                        }
                        if (item.label === "ผลการตรวจสอบ") {
                          if (!latestGeneralDocument) {
                            displayValue = "รอดำเนินการ";
                          } else {
                            displayValue = stepStatusToThai[fileCheckStepStatus] || "กำลังตรวจสอบ";
                          }
                        }
                      }

                      if (selectedTask.name === "ชำระค่าออกฝึก") {
                        const internshipStepStatus = currentRequest?.steps?.internship_fee_check?.status || 'waiting';
                        if (item.label === "ผลการตรวจสอบ") {
                          displayValue = stepStatusToThai[internshipStepStatus] || "รอดำเนินการ";
                        }
                      }

                      const rejectComment = getTaskItemRejectComment(selectedTask.name, item.label);

                      return (
                      <Box key={idx} className="space-y-1">
                        <Typography className="text-gray-500 text-xs md:text-sm font-medium">
                          {item.label}
                        </Typography>
                        <Box className="flex items-center gap-2">
                          <Chip
                            label={displayValue}
                            size="small"
                            sx={{
                              backgroundColor: "#FACC15",
                              color: "#92400E",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: "24px",
                            }}
                          />
                        </Box>
                        {rejectComment && (
                          <Typography className="text-xs md:text-sm" sx={{ color: '#dc2626', fontWeight: 600 }}>
                            หมายเหตุ: {rejectComment}
                          </Typography>
                        )}
                      </Box>
                      );
                    })}
                  </Box>
                </Box>

                {selectedTask.name === "เอกสารที่อัปโหลด" && latestGeneralDocument && (
                  <Box className="pt-2">
                    <Button
                      fullWidth
                      component="a"
                      href={getDocumentUrl(latestGeneralDocument)}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        borderColor: '#16a34a',
                        color: '#166534',
                        fontWeight: 600,
                        '&:hover': { borderColor: '#15803d', backgroundColor: '#f0fdf4' }
                      }}
                    >
                      เปิดไฟล์ล่าสุด ({latestGeneralDocument.originalName})
                    </Button>
                  </Box>
                )}

                {selectedTask.name === "ชำระค่าออกฝึก" && latestInternshipReceiptDocument && (
                  <Box className="pt-2">
                    <Button
                      fullWidth
                      component="a"
                      href={getDocumentUrl(latestInternshipReceiptDocument)}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        borderColor: '#0ea5e9',
                        color: '#0369a1',
                        fontWeight: 600,
                        '&:hover': { borderColor: '#0284c7', backgroundColor: '#f0f9ff' }
                      }}
                    >
                      เปิดสลิปค่าออกฝึกล่าสุด ({latestInternshipReceiptDocument.originalName})
                    </Button>
                  </Box>
                )}

                <Box className="pt-4">
                  <Button
                    fullWidth
                    onClick={() => setOpen(false)}
                    variant="contained"
                    sx={{
                      backgroundColor: "#F9C824",
                      color: "white",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 1,
                      "&:hover": { backgroundColor: "#F9C824" },
                    }}
                  >
                    ปิด
                  </Button>
                </Box>
              </Box>
            )}
          </Dialog>

          {/* History Detail Dialog */}
          <Dialog
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            {selectedHistory && (
              <Box className="p-6 md:p-8 space-y-4">
                <Typography className="text-center font-bold text-lg md:text-xl text-slate-900">
                  รายละเอียดประวัติ
                </Typography>

                <Box className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <Box className="flex justify-between items-center">
                    <Typography className="text-sm text-gray-600">วันที่ยื่น</Typography>
                    <Typography className="font-semibold">{selectedHistory.date}</Typography>
                  </Box>
                  <Box className="flex justify-between items-center">
                    <Typography className="text-sm text-gray-600">สถานะ</Typography>
                    <Chip
                      label={statusMap[selectedHistory.status]?.label || "รอดำเนินการ"}
                      size="small"
                      sx={{
                        backgroundColor: statusMap[selectedHistory.status]?.color || statusMap.waiting.color,
                        color: statusMap[selectedHistory.status]?.text || statusMap.waiting.text,
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  {selectedHistory.rejectedDate && (
                    <Box className="flex justify-between items-center">
                      <Typography className="text-sm text-gray-600">วันที่ตีกลับ</Typography>
                      <Typography className="font-semibold text-red-600">{selectedHistory.rejectedDate}</Typography>
                    </Box>
                  )}
                  {selectedHistory.remark && (
                    <Box className="border-t pt-3 mt-3">
                      <Typography className="text-sm text-gray-600 mb-2">หมายเหตุ</Typography>
                      <Typography className="text-sm font-medium text-slate-900 bg-white p-3 rounded border">
                        {selectedHistory.remark}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Button
                  fullWidth
                  onClick={() => setHistoryOpen(false)}
                  variant="contained"
                  sx={{
                    backgroundColor: "#F9C824",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 1,
                    "&:hover": { backgroundColor: "#F9C824" },
                  }}
                >
                  ปิด
                </Button>
              </Box>
            )}
          </Dialog>

          {/* Upload File Dialog */}
          <Dialog
            open={uploadDialogOpen}
            onClose={() => {
              setUploadDialogOpen(false);
              setSelectedUploadTask(null);
              setSelectedFile(null);
            }}
            fullWidth
            maxWidth="sm"
          >
            <Box className="p-6 md:p-8 space-y-4">
              <Typography className="text-center font-bold text-lg md:text-xl text-slate-900">
                {selectedUploadTask?.id === 7 ? "อัพโหลดสลิปค่าออกฝึก" : "อัพโหลดเอกสาร"}
              </Typography>
              <Typography className="text-center text-sm text-gray-500">
                {selectedUploadTask?.id === 7
                  ? "กรุณาเลือกไฟล์ใบเสร็จ/สลิปค่าออกฝึกที่ต้องการอัพโหลด"
                  : "กรุณาเลือกไฟล์เอกสารที่ต้องการอัพโหลด"}
              </Typography>

              <Box className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: "none" }}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedFile(file);
                  }}
                />
                <label htmlFor="file-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      borderColor: "#F9C824",
                      color: "#F9C824",
                      fontWeight: 600,
                      "&:hover": { borderColor: "#F9C824", backgroundColor: "#e0f7fa" },
                    }}
                  >
                    เลือกไฟล์
                  </Button>
                </label>
                <Typography className="text-xs text-gray-500 mt-2">
                  รองรับไฟล์ PDF, JPG, PNG (ขนาดไม่เกิน 5MB)
                </Typography>
                {selectedFile && (
                  <Typography className="text-xs text-emerald-700 mt-2">
                    เลือกไฟล์แล้ว: {selectedFile.name}
                  </Typography>
                )}
              </Box>

              <Box className="flex gap-3">
                <Button
                  fullWidth
                  onClick={() => setUploadDialogOpen(false)}
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderColor: "#d1d5db",
                    color: "#6b7280",
                    fontWeight: 600,
                    borderRadius: 1,
                    "&:hover": { borderColor: "#9ca3af", backgroundColor: "#f9fafb" },
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  fullWidth
                  onClick={handleFileUpload}
                  variant="contained"
                  disabled={!selectedFile || isUploading}
                  sx={{
                    backgroundColor: "#F9C824",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 1,
                    "&:hover": { backgroundColor: "#F9C824" },
                  }}
                >
                  {isUploading ? "กำลังอัปโหลด..." : "อัพโหลด"}
                </Button>
              </Box>
            </Box>
          </Dialog>

          <Dialog
            open={confirmSubmitDialogOpen}
            onClose={() => setConfirmSubmitDialogOpen(false)}
            fullWidth
            maxWidth="xs"
          >
            <Box className="p-6 text-center space-y-4">
              <Typography variant="h6" className="font-bold text-slate-900">
                ยืนยันการส่งคำร้อง
              </Typography>
              <Typography className="text-gray-600 whitespace-pre-line">
                {currentRequest?.status === "Rejected"
                  ? "ระบบจะยื่นตรวจสอบใหม่เฉพาะส่วนที่ไม่ผ่าน ส่วนที่ผ่านแล้วจะคงสถานะผ่านเดิม ต้องการดำเนินการต่อหรือไม่?"
                  : "ระบบจะส่งคำร้องไปยังงานต่างๆเพื่อเริ่มตรวจสอบ ต้องการดำเนินการต่อหรือไม่?"}
              </Typography>
              {currentRequest?.status === "Rejected" && rejectedStepLabels.length > 0 && (
                <Box sx={{ textAlign: 'left', bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 2, p: 2 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#9a3412', mb: 1 }}>
                    ส่วนที่ไม่ผ่านและจะถูกยื่นใหม่:
                  </Typography>
                  {rejectedStepLabels.map((label) => (
                    <Typography key={label} sx={{ fontSize: '0.8rem', color: '#9a3412', lineHeight: 1.8 }}>
                      • {label}
                    </Typography>
                  ))}
                </Box>
              )}
              <Box className="flex gap-3">
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setConfirmSubmitDialogOpen(false)}
                  sx={{
                    textTransform: "none",
                    borderColor: "#d1d5db",
                    color: "#6b7280",
                    fontWeight: 600,
                    borderRadius: 2,
                    "&:hover": { borderColor: "#9ca3af", backgroundColor: "#f9fafb" },
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={async () => {
                    setConfirmSubmitDialogOpen(false);
                    await handleSubmitForDepartmentReview();
                  }}
                  sx={{
                    backgroundColor: "#064460",
                    color: "white",
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "#04364e" },
                  }}
                >
                  ยืนยันส่งคำร้อง
                </Button>
              </Box>
            </Box>
          </Dialog>

          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            fullWidth
            maxWidth="xs"
          >
            <Box className="p-6 text-center space-y-4">
              <Typography variant="h6" className="font-bold text-slate-900">
                แจ้งเตือน
              </Typography>
              <Typography className="text-gray-600 whitespace-pre-line">
                {dialogMessage}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setDialogOpen(false)}
                sx={{
                  backgroundColor: "#F9C824",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "#F9C824" },
                }}
              >
                ตกลง
              </Button>
            </Box>
          </Dialog>

        </Box>
      </Box>
    </Box>
  );
}

function SummaryCard({ title, value, colorClass, textColor }) {
  return (
    <Box className={`rounded-2xl p-4 text-center shadow-md border border-slate-200 ${colorClass}`} sx={{ boxShadow: 2 }}>
      <Typography className={`${textColor} text-sm md:text-base`}>{title}</Typography>
      <Typography className="font-bold text-xl md:text-2xl mt-1">{value} รายการ</Typography>
    </Box>
  );
}

