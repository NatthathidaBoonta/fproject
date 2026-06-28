import React, { useEffect, useMemo, useState } from "react";
import {
  Typography, Avatar, Box, Button, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Container, Paper, Divider, Alert, Tooltip,
} from "@mui/material";
import ArrowBackIcon          from "@mui/icons-material/ArrowBack";
import CheckCircleIcon        from "@mui/icons-material/CheckCircle";
import CancelIcon             from "@mui/icons-material/Cancel";
import DescriptionIcon        from "@mui/icons-material/Description";
import InboxIcon              from "@mui/icons-material/Inbox";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import TrackChangesIcon       from "@mui/icons-material/TrackChanges";
import AccessTimeIcon         from "@mui/icons-material/AccessTime";
import HourglassTopIcon       from "@mui/icons-material/HourglassTop";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, getRequestById, updateRequestStep } from "../../services/api";
import { STEP_LABELS, statusConfig as stepStatusConfig } from "../../constants/stepConfig";

const DIALOG = { NONE: "none", SUCCESS: "success", ERROR: "error", INFO: "info" };

// ขั้นตอนทั้งหมดที่หน่วยงานจัดการหลังจากนักศึกษายื่น (ไม่รวม grade_check ที่เป็นของที่ปรึกษา)
const DEPT_STEPS = [
  "file_check", "tuition_check", "internship_fee_check", "library_check",
  "activity_general_check", "activity_faculty_check", "digital_exam_check",
  "language_center", "advisor", "registration", "activity_center",
];

const getDocumentUrl = (doc) => {
  if (!doc?.url) return "";
  return String(doc.url).startsWith("http") ? doc.url : `${API_BASE_URL}${doc.url}`;
};

const formatThaiDateTime = (value) => {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("th-TH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const StepStatusIcon = ({ status }) => {
  if (status === "approved")    return <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />;
  if (status === "rejected")    return <CancelIcon       sx={{ fontSize: 18, color: "#dc2626" }} />;
  if (status === "in_progress") return <HourglassTopIcon sx={{ fontSize: 18, color: "#3b82f6" }} />;
  return <AccessTimeIcon sx={{ fontSize: 18, color: "#d97706" }} />;
};

export default function AdvisorDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [requestData, setRequestData]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectOpen, setRejectOpen]     = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveOpen, setApproveOpen]   = useState(false);
  const [dialog, setDialog]             = useState({ open: false, type: DIALOG.NONE, message: "" });

  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  const fetchRequest = async () => {
    try {
      const data = await getRequestById(id);
      setRequestData(data);
    } catch (error) {
      const status = error?.response?.status;
      const msg = status === 404 ? "ไม่พบข้อมูลคำร้องนี้"
        : status === 403 ? "ไม่มีสิทธิ์เข้าดูคำร้องนี้"
        : "ไม่สามารถโหลดข้อมูลได้";
      setDialog({ open: true, type: DIALOG.ERROR, message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequest(); }, [id]);

  // สถานะที่ปรึกษา
  const advisorStepStatus = requestData?.steps?.grade_check?.status || "waiting";
  const advisorComment    = requestData?.steps?.grade_check?.comment || "";
  const advisorUpdatedAt  = requestData?.steps?.grade_check?.updatedAt || null;
  const isApproved        = advisorStepStatus === "approved";
  const isRejected        = advisorStepStatus === "rejected";

  // นักศึกษายื่นคำร้องแล้ว (status ไม่ใช่ Pending)
  const hasSubmitted = requestData?.status && requestData.status !== "Pending";

  // รายการสถานะขั้นตอนหน่วยงาน
  const deptStepItems = useMemo(() => {
    if (!requestData?.steps) return [];
    return DEPT_STEPS
      .filter((key) => STEP_LABELS[key])
      .map((key) => ({
        key,
        label:     STEP_LABELS[key],
        status:    requestData.steps[key]?.status    || "waiting",
        comment:   requestData.steps[key]?.comment   || "",
        updatedAt: requestData.steps[key]?.updatedAt || null,
      }));
  }, [requestData]);

  // สรุปผลการดำเนินการ
  const stepSummary = useMemo(() => {
    const total    = deptStepItems.length;
    const approved = deptStepItems.filter((s) => s.status === "approved").length;
    const rejected = deptStepItems.filter((s) => s.status === "rejected").length;
    return { total, approved, rejected, pending: total - approved - rejected };
  }, [deptStepItems]);

  const generalDocs = useMemo(() => {
    const docs = Array.isArray(requestData?.documents) ? requestData.documents : [];
    return docs.filter((d) => {
      const t = String(d?.documentType || "").trim().toLowerCase();
      return t === "" || t === "general";
    });
  }, [requestData]);

  const internshipDocs = useMemo(() => {
    const docs = Array.isArray(requestData?.documents) ? requestData.documents : [];
    return docs.filter((d) =>
      String(d?.documentType || "").trim().toLowerCase() === "internship_receipt"
    );
  }, [requestData]);

  const closeDialog = () => {
    const shouldNavigate = dialog.type === DIALOG.SUCCESS || dialog.type === DIALOG.ERROR;
    setDialog({ open: false, type: DIALOG.NONE, message: "" });
    if (shouldNavigate) navigate("/advisor");
  };

  const handleApprove = async () => {
    if (!currentUser?.id) {
      setDialog({ open: true, type: DIALOG.ERROR, message: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่" });
      return;
    }
    setIsSubmitting(true);
    try {
      await updateRequestStep(id, {
        step: "grade_check", status: "approved", comment: "", userId: currentUser.id,
      });
      await fetchRequest();
      setDialog({ open: true, type: DIALOG.SUCCESS, message: `อนุมัติให้ ${requestData?.User?.name} ยื่นคำร้องขอจบการศึกษาได้แล้ว` });
    } catch (error) {
      setDialog({ open: true, type: DIALOG.ERROR, message: error?.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setDialog({ open: true, type: DIALOG.INFO, message: "กรุณากรอกเหตุผลก่อนปฏิเสธ" });
      return;
    }
    setRejectOpen(false);
    setIsSubmitting(true);
    try {
      await updateRequestStep(id, {
        step: "grade_check", status: "rejected", comment: rejectReason.trim(), userId: currentUser.id,
      });
      await fetchRequest();
      setRejectReason("");
      setDialog({ open: true, type: DIALOG.SUCCESS, message: "บันทึกการปฏิเสธเรียบร้อยแล้ว\nนักศึกษาจะได้รับแจ้งเตือนเพื่อดำเนินการแก้ไข" });
    } catch (error) {
      setDialog({ open: true, type: DIALOG.ERROR, message: error?.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!requestData) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
        <InboxIcon sx={{ fontSize: 64, color: "#cbd5e1" }} />
        <Typography variant="h6" color="#475569" fontWeight="600">ไม่พบข้อมูลคำร้อง</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/advisor")}>กลับหน้ารายชื่อ</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff", pb: 10 }}>

      {/* Top Bar */}
      <Box sx={{ py: 3, px: 4, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/advisor")}
          sx={{ color: "#64748b", textTransform: "none", "&:hover": { bgcolor: "#f1f5f9" } }}
        >
          กลับหน้ารายชื่อ
        </Button>
        <Typography variant="h6" fontWeight="bold" color="#334155">
          ตรวจสอบคำร้องขอจบการศึกษา
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 320px" }, gap: 4 }}>

          {/* ── Main Column ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* Alert: สถานะการอนุมัติที่ปรึกษา */}
            {(isApproved || isRejected) && (
              <Alert
                severity={isApproved ? "success" : "error"}
                icon={isApproved ? <CheckCircleIcon /> : <CancelIcon />}
                sx={{ borderRadius: 3, fontWeight: 600 }}
              >
                {isApproved
                  ? `อนุมัติแล้วเมื่อ ${formatThaiDateTime(advisorUpdatedAt)} — นักศึกษาสามารถยื่นคำร้องได้แล้ว`
                  : `ปฏิเสธเมื่อ ${formatThaiDateTime(advisorUpdatedAt)}${advisorComment ? ` — ${advisorComment}` : ""}`}
              </Alert>
            )}

            {/* เอกสารที่นักศึกษาอัปโหลด */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 3 }}>
                เอกสารที่นักศึกษาอัปโหลด
              </Typography>

              {generalDocs.length === 0 && internshipDocs.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                  <DescriptionIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2">ยังไม่มีเอกสารที่อัปโหลด</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {[
                    { label: "เอกสารขอจบการศึกษา", docs: generalDocs,     btnLabel: "ดูเอกสาร" },
                    { label: "สลิปค่าออกฝึก",       docs: internshipDocs, btnLabel: "ดูสลิป"    },
                  ].map(({ label, docs, btnLabel }) => (
                    <Box key={label}>
                      <Typography variant="subtitle2" fontWeight="700" color="#334155" sx={{ mb: 1.5 }}>
                        {label}
                        <Chip
                          label={docs.length > 0 ? `${docs.length} ไฟล์` : "ยังไม่มี"}
                          size="small"
                          sx={{
                            ml: 1.5, height: 20, fontSize: "0.7rem", fontWeight: 700,
                            bgcolor: docs.length > 0 ? "#dcfce7" : "#f1f5f9",
                            color:   docs.length > 0 ? "#166534" : "#64748b",
                          }}
                        />
                      </Typography>
                      {docs.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {[...docs].reverse().map((doc) => (
                            <Box
                              key={doc.id || doc.fileName}
                              sx={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                flexWrap: "wrap", gap: 1, p: 1.5,
                                border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#f8fafc",
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ color: "#0f172a", fontWeight: 600 }} noWrap>
                                  {doc.originalName || label}
                                </Typography>
                                <Typography variant="caption" color="#64748b">
                                  อัปโหลดเมื่อ: {formatThaiDateTime(doc.uploadedAt)}
                                </Typography>
                              </Box>
                              <Button
                                component="a"
                                href={getDocumentUrl(doc)}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<DescriptionIcon fontSize="small" />}
                                size="small"
                                sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                              >
                                {btnLabel}
                              </Button>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="#94a3b8" sx={{ pl: 1 }}>
                          นักศึกษายังไม่ได้อัปโหลด{label}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>

            {/* ── ติดตามสถานะการดำเนินการ (read-only) ── */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TrackChangesIcon sx={{ color: "#3b82f6" }} />
                  <Typography variant="h6" fontWeight="bold" color="#1e293b">
                    ติดตามสถานะการดำเนินการ
                  </Typography>
                </Box>
                {hasSubmitted && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip label={`ผ่านแล้ว ${stepSummary.approved}`}  size="small" sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 700 }} />
                    {stepSummary.rejected > 0 && (
                      <Chip label={`ไม่ผ่าน ${stepSummary.rejected}`} size="small" sx={{ bgcolor: "#fee2e2", color: "#991b1b", fontWeight: 700 }} />
                    )}
                    <Chip label={`รอ ${stepSummary.pending}`}          size="small" sx={{ bgcolor: "#fef9c3", color: "#854d0e", fontWeight: 700 }} />
                  </Box>
                )}
              </Box>
              <Typography variant="caption" color="#94a3b8" sx={{ mb: 3, display: "block" }}>
                ดูได้เฉพาะ ไม่สามารถแก้ไขได้ — หน่วยงานแต่ละแห่งจะอัปเดตสถานะเอง
              </Typography>

              {!hasSubmitted ? (
                <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                  <AccessTimeIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" fontWeight="500">นักศึกษายังไม่ได้ยื่นคำร้อง</Typography>
                  <Typography variant="caption">สถานะรายขั้นตอนจะแสดงหลังจากนักศึกษายื่นคำร้องแล้ว</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {deptStepItems.map((item) => {
                    const cfg = stepStatusConfig[item.status] || stepStatusConfig.waiting;
                    const hasIssue = item.status === "rejected" && item.comment;
                    return (
                      <Box
                        key={item.key}
                        sx={{
                          p: 2, borderRadius: 2.5,
                          border: hasIssue ? "1px solid #fca5a5" : "1px solid #f1f5f9",
                          bgcolor: hasIssue ? "#fff7f7" : "#fafafa",
                          display: "flex", flexDirection: "column", gap: 0.5,
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <StepStatusIcon status={item.status} />
                            <Typography variant="body2" fontWeight={hasIssue ? 700 : 500} color="#334155">
                              {item.label}
                            </Typography>
                          </Box>
                          <Chip
                            label={cfg.label}
                            size="small"
                            sx={{ bgcolor: cfg.bg, color: cfg.text, fontWeight: 700, borderRadius: 1, fontSize: "0.72rem" }}
                          />
                        </Box>
                        {item.updatedAt && item.status !== "waiting" && (
                          <Typography variant="caption" color="#94a3b8" sx={{ pl: 3.5 }}>
                            อัปเดต: {formatThaiDateTime(item.updatedAt)}
                          </Typography>
                        )}
                        {hasIssue && (
                          <Box sx={{ pl: 3.5, mt: 0.25 }}>
                            <Typography variant="caption" sx={{ color: "#b91c1c", fontWeight: 600 }}>
                              หมายเหตุ: {item.comment}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>

            {/* ── การอนุมัติของที่ปรึกษา ── */}
            <Paper
              elevation={0}
              sx={{
                p: 4, borderRadius: 4,
                bgcolor: isApproved ? "#f0fdf4" : "#f8fafc",
                border: isApproved ? "1px solid #bbf7d0" : "1px dashed #cbd5e1",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <AssignmentTurnedInIcon sx={{ color: isApproved ? "#15803d" : "#64748b" }} />
                <Typography variant="subtitle1" fontWeight="bold" color={isApproved ? "#15803d" : "text.primary"}>
                  การอนุมัติของที่ปรึกษา
                </Typography>
              </Box>

              {isApproved ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleIcon sx={{ color: "#15803d" }} />
                  <Typography variant="body2" color="#15803d" fontWeight="600">
                    ได้อนุมัติให้นักศึกษายื่นคำร้องขอจบการศึกษาแล้ว
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body2" color="#64748b" sx={{ mb: 3 }}>
                    กรุณาตรวจสอบเอกสารของนักศึกษาด้านบน แล้วอนุมัติหรือปฏิเสธเพื่อให้นักศึกษาทราบผล
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setApproveOpen(true)}
                      disabled={isSubmitting}
                      disableElevation
                      startIcon={<CheckCircleIcon />}
                      sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" }, borderRadius: 2, px: 4, py: 1.2 }}
                    >
                      อนุมัติให้ยื่นคำร้อง
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={isSubmitting}
                      onClick={() => setRejectOpen(true)}
                      startIcon={<CancelIcon />}
                      sx={{ borderRadius: 2, px: 3, py: 1.2 }}
                    >
                      ยังไม่อนุมัติ / แจ้งแก้ไข
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Box>

          {/* ── Sidebar ── */}
          <Box>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #e2e8f0", position: "sticky", top: 20 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: "#e0f7fa", color: "#064460", fontSize: 32 }}>
                  {(requestData.User?.name || "?").charAt(0)}
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" align="center">
                  {requestData.User?.name || "-"}
                </Typography>
                <Typography variant="body2" color="#64748b" sx={{ fontFamily: "monospace" }}>
                  {requestData.studentId}
                </Typography>
                <Chip
                  label={isApproved ? "อนุมัติแล้ว" : isRejected ? "ปฏิเสธ" : "รอการอนุมัติ"}
                  size="small"
                  sx={{
                    mt: 1.5, fontWeight: 700, borderRadius: 2,
                    bgcolor: isApproved ? "#dcfce7" : isRejected ? "#fee2e2" : "#fef9c3",
                    color:   isApproved ? "#166534" : isRejected ? "#991b1b" : "#854d0e",
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {[
                { label: "คณะ",           value: requestData.User?.faculty || "-" },
                { label: "สาขา",          value: requestData.User?.branch  || "-" },
                { label: "ปีการศึกษา",   value: requestData.academicYear  || "-" },
                { label: "ภาคเรียน",     value: requestData.semester      || "-" },
                { label: "สถานะคำร้อง",  value: requestData.status        || "-" },
                { label: "วันที่สร้าง",  value: formatThaiDateTime(requestData.createdAt) },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
                  <Typography variant="body2" color="#64748b" sx={{ flexShrink: 0 }}>{label}</Typography>
                  <Typography variant="body2" fontWeight="600" color="#334155" sx={{ textAlign: "right" }}>
                    {value}
                  </Typography>
                </Box>
              ))}

              {/* Progress Bar */}
              {hasSubmitted && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 1, display: "block" }}>
                    ความคืบหน้า ({stepSummary.approved}/{stepSummary.total} ขั้นตอน)
                  </Typography>
                  <Box sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", overflow: "hidden" }}>
                    <Box
                      sx={{
                        height: "100%", borderRadius: 4,
                        width: `${stepSummary.total > 0 ? (stepSummary.approved / stepSummary.total) * 100 : 0}%`,
                        bgcolor: stepSummary.rejected > 0 ? "#ef4444" : "#10b981",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </Box>
                </>
              )}
            </Paper>
          </Box>

        </Box>
      </Container>

      {/* Confirm Approve Dialog */}
      <Dialog open={approveOpen} onClose={() => setApproveOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: "bold" }}>ยืนยันการอนุมัติ</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            คุณต้องการ <strong>อนุมัติ</strong> ให้{" "}
            <strong>{requestData?.User?.name}</strong>{" "}
            ยื่นคำร้องขอจบการศึกษาได้ใช่หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setApproveOpen(false)} sx={{ color: "#64748b" }}>ยกเลิก</Button>
          <Button
            variant="contained" disableElevation disabled={isSubmitting}
            startIcon={<CheckCircleIcon />}
            onClick={() => { setApproveOpen(false); handleApprove(); }}
            sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
          >
            ยืนยันอนุมัติ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>ยังไม่อนุมัติ / แจ้งแก้ไข</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ระบุเหตุผลหรือสิ่งที่นักศึกษาต้องแก้ไข เพื่อให้นักศึกษาดำเนินการให้ครบถ้วนก่อนยื่นคำร้อง
          </Typography>
          <TextField
            autoFocus fullWidth multiline rows={4}
            label="เหตุผล / สิ่งที่ต้องแก้ไข (บังคับ)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="เช่น ยังขาดหลักฐานการชำระค่าลงทะเบียน, ผลสอบภาษาอังกฤษยังไม่ผ่านเกณฑ์..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setRejectOpen(false)} sx={{ color: "#64748b" }}>ยกเลิก</Button>
          <Button
            variant="contained" color="error" disableElevation
            disabled={isSubmitting || !rejectReason.trim()}
            onClick={handleReject}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth="xs">
        <Box sx={{ p: 4, textAlign: "center" }}>
          {dialog.type === DIALOG.SUCCESS && <CheckCircleIcon sx={{ fontSize: 52, color: "#10b981", mb: 1 }} />}
          {dialog.type === DIALOG.ERROR   && <CancelIcon       sx={{ fontSize: 52, color: "#ef4444", mb: 1 }} />}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5, color: "#1e293b" }}>
            {dialog.type === DIALOG.SUCCESS ? "สำเร็จ"
              : dialog.type === DIALOG.ERROR ? "เกิดข้อผิดพลาด"
              : "แจ้งเตือน"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, whiteSpace: "pre-line" }}>
            {dialog.message}
          </Typography>
          <Button
            fullWidth variant="contained" disableElevation onClick={closeDialog}
            sx={{
              borderRadius: 2, fontWeight: 700,
              bgcolor: dialog.type === DIALOG.SUCCESS ? "#10b981"
                : dialog.type === DIALOG.ERROR ? "#ef4444"
                : "#3b82f6",
            }}
          >
            ตกลง
          </Button>
        </Box>
      </Dialog>

    </Box>
  );
}
