import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  Chip,
  Button,
  TextField,
  Skeleton,
  Grid,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL, createRequest, getRequests, submitRequestForReview, uploadRequestDocument } from "../../services/api";
import { generateGraduationCertificate } from "../../services/pdfGenerator";
import {
  statusConfig,
  stepToTaskStatus,
  requestStatusToHistoryStatus,
  stepStatusToThai,
  taskStepMap,
  taskItemStepMap,
  STEP_LABELS,
} from "../../constants/stepConfig";

// Sub-components
import StudentStatusSummary from "../../components/StudentStatusSummary";
import StudentRequestHistoryTable from "../../components/StudentRequestHistoryTable";
import StudentChecklistJourney from "../../components/StudentChecklistJourney";


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
    : activityUiStatuses.every(status => status === "approved")
      ? "approved"
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
    const stepKeys = Object.keys(STEP_LABELS);
    const labels = stepKeys
      .filter((stepKey) => String(steps?.[stepKey]?.status || '').toLowerCase() === 'rejected')
      .map((stepKey) => STEP_LABELS[stepKey]);

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
          ? (fileCheckStatus === 'approved' ? 'approved' : fileCheckStatus === 'rejected' ? 'rejected' : 'waiting')
          : 'waiting';
        const internshipTaskStatus = hasInternshipReceipt
          ? (internshipStatus === 'approved' ? 'approved' : internshipStatus === 'rejected' ? 'rejected' : 'waiting')
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

      // แสดงเฉพาะคำร้องที่ยื่นแล้ว (ไม่ใช่ Pending = draft ที่ยังไม่ได้ยื่น)
      const mappedHistory = sortedRequests
        .filter((r) => r.status !== "Pending")
        .map((request, index) => ({
          id: request.id || index + 1,
          date: formatThaiDateTime(request.submittedAt || request.createdAt),
          status: requestStatusToHistoryStatus[request.status] || "waiting",
          originalRequest: request,
        }));

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
  const passedCount = tasks.filter((t) => t.status === "approved").length;
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

    if (!selectedUploadTask?.id) {
      setDialogMessage("ไม่พบประเภทเอกสารที่ต้องการอัปโหลด");
      setDialogOpen(true);
      return;
    }

    setIsUploading(true);
    try {
      let requestId = currentRequest?.id;

      if (!requestId) {
        const createdRequest = await createRequest({
          studentId: currentUser.id,
          academicYear: getCurrentAcademicYear(),
          semester: getCurrentSemester(),
        });
        requestId = createdRequest?.id;
        if (createdRequest) {
          setCurrentRequest(createdRequest);
        }
      }

      if (!requestId) {
        setDialogMessage("คำร้องยังไม่ถูกสร้าง กรุณาลองใหม่อีกครั้ง");
        setDialogOpen(true);
        setIsUploading(false);
        return;
      }
      const uploadType = selectedUploadTask.id === 7 ? 'internship_receipt' : 'general';
      await uploadRequestDocument(requestId, selectedFile, currentUser?.id, uploadType);
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

    if (!isGeneralUploaded) {
      setDialogMessage("กรุณาอัปโหลดเอกสารขอจบการศึกษาก่อนยื่นคำร้อง");
      setDialogOpen(true);
      return;
    }

    if (!isInternshipUploaded) {
      setDialogMessage("กรุณาอัปโหลดสลิปค่าออกฝึกก่อนยื่นคำร้อง");
      setDialogOpen(true);
      return;
    }

    if (!isAdvisorApproved) {
      setDialogMessage("อาจารย์ที่ปรึกษายังไม่ได้อนุมัติ\nกรุณารออาจารย์ที่ปรึกษาตรวจสอบและอนุมัติก่อนยื่นคำร้อง");
      setDialogOpen(true);
      return;
    }

    try {
      let requestId = currentRequest?.id;

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
    if (!isGeneralUploaded) {
      setDialogMessage("กรุณาอัปโหลดเอกสารขอจบการศึกษาก่อนยื่นคำร้อง");
      setDialogOpen(true);
      return;
    }
    if (!isInternshipUploaded) {
      setDialogMessage("กรุณาอัปโหลดสลิปค่าออกฝึกก่อนยื่นคำร้อง");
      setDialogOpen(true);
      return;
    }
    if (!isAdvisorApproved) {
      setDialogMessage("อาจารย์ที่ปรึกษายังไม่ได้อนุมัติ\nกรุณารออาจารย์ที่ปรึกษาตรวจสอบและอนุมัติก่อนยื่นคำร้อง");
      setDialogOpen(true);
      return;
    }
    setConfirmSubmitDialogOpen(true);
  };

  const handleDownloadCertificate = (request) => {
    generateGraduationCertificate(request, currentUser);
  };

  const allTasksPassed = tasks.length > 0 && passedCount === tasks.length;
  const shouldHideSubmitAction = allTasksPassed || currentRequest?.status === "Completed";

  const isGeneralUploaded = tasks.find((t) => t.id === 6)?.fileUploaded;
  const isInternshipUploaded = tasks.find((t) => t.id === 7)?.fileUploaded;
  const isAdvisorApproved = currentRequest?.steps?.grade_check?.status === "approved";

  const canSubmitForReview =
    (!currentRequest || ["Pending", "Rejected"].includes(currentRequest.status)) &&
    isGeneralUploaded &&
    isInternshipUploaded &&
    isAdvisorApproved;

  const submitButtonLabel = currentRequest?.status === "In Progress"
    ? "ยื่นแล้ว (รอตรวจสอบ)"
    : "ยื่นใบคำร้อง";

  const requestHintText = !isGeneralUploaded
    ? "กรุณาอัปโหลดเอกสารขอจบการศึกษาก่อน (รายการที่ 6)"
    : !isInternshipUploaded
      ? "กรุณาอัปโหลดสลิปค่าออกฝึกก่อน (รายการที่ 7)"
      : !isAdvisorApproved
        ? "รออาจารย์ที่ปรึกษาอนุมัติก่อนจึงจะยื่นคำร้องได้"
        : !currentRequest
          ? "ยังไม่มีคำร้องที่ใช้งานอยู่"
          : currentRequest.status === "Pending"
            ? "พร้อมยื่นคำร้องไปยังหน่วยงานตรวจสอบ"
            : currentRequest.status === "In Progress"
              ? "คำร้องถูกส่งแล้วและกำลังรอหน่วยงานตรวจสอบ"
              : currentRequest.status === "Rejected"
                ? "คำร้องถูกตีกลับ สามารถยื่นใหม่เฉพาะส่วนที่ไม่ผ่านได้ โดยส่วนที่ผ่านแล้วจะคงสถานะเดิม"
                : "คำร้องเสร็จสมบูรณ์แล้ว ไม่ต้องดำเนินการเพิ่มเติม";

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        
        {/* Skeleton Loading State */}
        {loading ? (
          <Box sx={{ width: '100%', py: 2 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[1, 2, 3].map((item) => (
                <Grid size={{ xs: 12, sm: 4 }} key={item}>
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3, mb: 4 }} />
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 6 }} key={item}>
                  <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
          </Box>

        ) : (
          <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* Status Summary component */}
            <StudentStatusSummary
              waitingCount={waitingCount}
              passedCount={passedCount}
              rejectedCount={rejectedCount}
            />

            {/* Request History Table component */}
            <StudentRequestHistoryTable
              submissionHistory={submissionHistory}
              onViewDetail={openHistoryDetail}
              canSubmitForReview={canSubmitForReview}
              onSubmit={handleOpenSubmitConfirm}
              loading={loading}
              currentRequest={currentRequest}
              shouldHideSubmitAction={shouldHideSubmitAction}
              submitButtonLabel={submitButtonLabel}
              requestHintText={requestHintText}
              onDownloadPdf={handleDownloadCertificate}
            />

            {/* Student Checklist Journey Roadmap */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 1, color: '#0f172a' }}>
                ขั้นตอนการขอจบการศึกษา
              </Typography>
              <StudentChecklistJourney
                tasks={tasks}
                currentRequest={currentRequest}
                latestGeneralDocument={latestGeneralDocument}
                latestInternshipReceiptDocument={latestInternshipReceiptDocument}
                onUploadClick={(t) => {
                  setSelectedUploadTask(t);
                  setUploadDialogOpen(true);
                }}
                getDocumentUrl={getDocumentUrl}
              />
            </Box>


          </Box>
        )}



        {/* History Detail Dialog */}
        <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} fullWidth maxWidth="sm">
          {selectedHistory && (() => {
            const req = selectedHistory.originalRequest;
            const rejectedSteps = Object.entries(req?.steps || {})
              .filter(([, s]) => s?.status === "rejected")
              .map(([key, s]) => ({ key, label: STEP_LABELS[key] || key, date: s.updatedAt, comment: s.comment }));

            return (
              <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="h6" align="center" fontWeight="bold" color="text.primary">
                  รายละเอียดประวัติคำร้อง
                </Typography>

                {/* ข้อมูลพื้นฐาน */}
                <Box sx={{ bgcolor: 'background.default', p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1.5, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">วันที่ยื่นคำร้อง</Typography>
                    <Typography variant="body2" fontWeight="bold">{selectedHistory.date}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">ปีการศึกษา / ภาคเรียน</Typography>
                    <Typography variant="body2" fontWeight="bold">{req?.academicYear} / {req?.semester}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">สถานะคำร้อง</Typography>
                    <Chip
                      label={statusConfig[selectedHistory.status]?.label || "รอดำเนินการ"}
                      size="small"
                      sx={{
                        backgroundColor: statusConfig[selectedHistory.status]?.bg || statusConfig.waiting.bg,
                        color: statusConfig[selectedHistory.status]?.text || statusConfig.waiting.text,
                        fontWeight: 700,
                        borderRadius: 1.5,
                      }}
                    />
                  </Box>
                </Box>

                {/* รายการที่ถูกตีกลับ */}
                {rejectedSteps.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="error.main" sx={{ mb: 1.5 }}>
                      หน่วยงานที่ตีกลับ ({rejectedSteps.length} รายการ)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {rejectedSteps.map(({ key, label, date, comment }) => (
                        <Box
                          key={key}
                          sx={{ border: '1px solid #fca5a5', borderRadius: 2.5, p: 2, bgcolor: '#fff7f7' }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: comment ? 1 : 0 }}>
                            <Typography variant="body2" fontWeight="700" color="#b91c1c">{label}</Typography>
                            <Typography variant="caption" color="#9f1239" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {date ? formatThaiDateTime(date) : "-"}
                            </Typography>
                          </Box>
                          {comment && (
                            <Typography variant="body2" color="#7f1d1d" sx={{ borderTop: '1px solid #fecaca', pt: 1, mt: 0.5 }}>
                              หมายเหตุ: {comment}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                <Button
                  fullWidth
                  onClick={() => setHistoryOpen(false)}
                  variant="contained"
                  sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
                >
                  ปิดหน้าต่าง
                </Button>
              </Box>
            );
          })()}
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
          <Box sx={{ p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" align="center" fontWeight="bold">
              {selectedUploadTask?.id === 7 ? "อัปโหลดสลิปค่าออกฝึก" : "อัปโหลดเอกสารขอจบ"}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1 }}>
              {selectedUploadTask?.id === 7
                ? "กรุณาเลือกไฟล์รูปภาพหรือไฟล์ PDF ใบเสร็จค่าธรรมเนียมออกฝึกงาน"
                : "กรุณาเลือกไฟล์เอกสารขอจบการศึกษาที่ผ่านการเซ็นรับรอง (PDF, JPG, PNG)"}
            </Typography>

            <Box
              sx={{
                bgcolor: 'background.default',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
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
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                >
                  เลือกไฟล์จากเครื่อง
                </Button>
              </label>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1.5 }}>
                รองรับไฟล์ PDF, JPG, PNG (ขนาดไม่เกิน 5MB)
              </Typography>
              {selectedFile && (
                <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 'bold', mt: 2 }}>
                  เลือกไฟล์แล้ว: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                fullWidth
                onClick={() => setUploadDialogOpen(false)}
                variant="outlined"
                sx={{ borderRadius: 2, fontWeight: 700, py: 1 }}
              >
                ยกเลิก
              </Button>
              <Button
                fullWidth
                onClick={handleFileUpload}
                variant="contained"
                disabled={!selectedFile || isUploading}
                sx={{ borderRadius: 2, fontWeight: 700, py: 1 }}
              >
                {isUploading ? "กำลังอัปโหลด..." : "ยืนยันอัปโหลด"}
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Confirm Submit Dialog */}
        <Dialog open={confirmSubmitDialogOpen} onClose={() => setConfirmSubmitDialogOpen(false)} fullWidth maxWidth="xs">
          <Box sx={{ p: 4, textCenter: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" align="center" fontWeight="bold" sx={{ color: 'text.primary' }}>
              ยืนยันการส่งคำร้อง
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1 }}>
              {currentRequest?.status === "Rejected"
                ? "ระบบจะส่งสเต็ปที่ปฏิเสธไปเพื่อเริ่มการตรวจสอบใหม่อีกครั้ง ส่วนที่ผ่านแล้วจะไม่ได้รับผลกระทบ"
                : "คุณต้องการส่งคำร้องและไฟล์เอกสารขอจบการศึกษาให้เจ้าหน้าที่และแผนกต่าง ๆ ตรวจสอบใช่หรือไม่?"}
            </Typography>

            {/* เช็คลิสต์เงื่อนไขก่อนส่ง */}
            <Box sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2.5, p: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="caption" fontWeight="bold" color="#166534" display="block" sx={{ mb: 0.5 }}>
                เงื่อนไขที่ผ่านแล้ว:
              </Typography>
              <Typography variant="caption" display="block" sx={{ color: '#15803d' }}>
                ✅ อัปโหลดเอกสารขอจบการศึกษาแล้ว
              </Typography>
              <Typography variant="caption" display="block" sx={{ color: '#15803d' }}>
                ✅ อัปโหลดสลิปค่าออกฝึกแล้ว
              </Typography>
              <Typography variant="caption" display="block" sx={{ color: '#15803d' }}>
                ✅ อาจารย์ที่ปรึกษาอนุมัติแล้ว
              </Typography>
            </Box>

            {currentRequest?.status === "Rejected" && rejectedStepLabels.length > 0 && (
              <Box sx={{ bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 2.5, p: 2 }}>
                <Typography variant="caption" fontWeight="bold" color="#c2410c" display="block" sx={{ mb: 0.5 }}>
                  แผนกที่จะตรวจสอบใหม่:
                </Typography>
                {rejectedStepLabels.map((label) => (
                  <Typography key={label} variant="caption" display="block" sx={{ color: '#9a3412', pl: 1 }}>
                    • {label}
                  </Typography>
                ))}
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setConfirmSubmitDialogOpen(false)}
                sx={{ borderRadius: 2, fontWeight: 700 }}
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
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                ยืนยันยื่นเรื่อง
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Global Dialog (Alert Message) */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              💡 ผลการดำเนินการ
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {dialogMessage}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setDialogOpen(false)}
              sx={{ borderRadius: 2, fontWeight: 700, mt: 1 }}
            >
              ตกลง
            </Button>
          </Box>
        </Dialog>

      </Box>
    </Box>
  );
}
