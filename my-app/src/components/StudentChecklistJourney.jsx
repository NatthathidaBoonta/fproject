import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, Paper, Chip, Avatar, Divider, Alert, alpha } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ComputerIcon from '@mui/icons-material/Computer';
import LanguageIcon from '@mui/icons-material/Language';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import InfoIcon from '@mui/icons-material/Info';
import { motion, AnimatePresence } from 'framer-motion';
import { statusConfig, taskDetails, taskItemStepMap, taskStepMap, stepStatusToThai } from '../constants/stepConfig';

const taskIcons = {
  1: <SchoolIcon />,
  2: <MenuBookIcon />,
  3: <EmojiEventsIcon />,
  4: <ComputerIcon />,
  5: <LanguageIcon />,
  6: <CloudUploadIcon />,
  7: <ReceiptLongIcon />,
  8: <AssignmentIndIcon />,
};

const taskGuides = {
  1: 'หลักสูตรและการลงทะเบียนเรียน: ตรวจสอบโครงสร้างหน่วยกิต ผลการเรียนเฉลี่ย และสถานะค่าลงทะเบียนเรียนทั้งหมด หากพบหน่วยกิตไม่ครบ กรุณาติดต่อฝ่ายทะเบียน',
  2: 'การส่งคืนหนังสือหอสมุด: หอสมุดจะอนุมัติผ่านเมื่อนักศึกษาไม่มีรายการค้างส่งหนังสือและไม่มีค่าปรับค้างชำระ',
  3: 'ชั่วโมงกิจกรรมนักศึกษา: ตรวจสอบผลกิจกรรมกลาง (ต้องผ่านเกณฑ์มหาวิทยาลัย) และกิจกรรมคณะ หากสเตตัสไม่ผ่าน กรุณาตรวจสอบชั่วโมงกิจกรรมที่สโมสรนักศึกษา',
  4: 'การทดสอบทักษะดิจิทัล: นักศึกษาต้องผ่านการทดสอบสมรรถนะเทคโนโลยีดิจิทัลตามเกณฑ์ขั้นต่ำของมหาวิทยาลัย',
  5: 'คะแนนการทดสอบภาษาอังกฤษ: ส่งหรือทดสอบภาษาอังกฤษตามเกณฑ์การจบการศึกษา (SSKRU-TEP หรือเทียบเท่า)',
  6: 'เอกสารขอจบการศึกษา: กรุณาอัปโหลดเอกสารขอจบที่กรอกรายละเอียดครบถ้วนและผ่านการลงนามเรียบร้อยแล้ว (ไฟล์ PDF หรือรูปภาพชัดเจน)',
  7: 'การชำระค่าธรรมเนียมออกฝึกงาน: อัปโหลดใบเสร็จหรือสลิปหลักฐานการโอนเงินค่าธรรมเนียมการออกฝึกประสบการณ์วิชาชีพเพื่อรับการตรวจสอบ',
  8: 'การตรวจสอบของอาจารย์ที่ปรึกษา: อาจารย์ที่ปรึกษาประจำตัวจะลงนามอนุมัติใบคำร้องขอจบการศึกษาในระบบหลังจากประวัติการเรียนผ่านเกณฑ์',
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
  }) + " น.";
};

export default function StudentChecklistJourney({
  tasks = [],
  currentRequest,
  latestGeneralDocument,
  latestInternshipReceiptDocument,
  onUploadClick,
  getDocumentUrl,
}) {
  const [activeTaskId, setActiveTaskId] = useState(1);

  const activeTask = useMemo(() => {
    return tasks.find(t => t.id === activeTaskId) || tasks[0];
  }, [tasks, activeTaskId]);

  const activeTaskItems = useMemo(() => {
    return taskDetails[activeTask?.name] || [];
  }, [activeTask]);

  const getTaskStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'ตรวจสอบผ่านแล้ว 🎉';
      case 'rejected':
        return 'ต้องแก้ไข / ไม่ผ่าน ❌';
      case 'in_progress':
        return 'อยู่ระหว่างตรวจสอบ ⏳';
      default:
        return 'รอการส่งข้อมูล 📥';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#16a34a';
      case 'rejected':
        return '#dc2626';
      case 'in_progress':
        return '#3b82f6';
      default:
        return '#94a3b8';
    }
  };

  const getTaskBgColor = (status) => {
    switch (status) {
      case 'approved':
        return '#f0fdf4';
      case 'rejected':
        return '#fef2f2';
      case 'in_progress':
        return '#eff6ff';
      default:
        return '#f8fafc';
    }
  };

  const getTaskLastUpdatedAt = (taskName) => {
    if (!currentRequest?.steps) return null;
    if (taskName === "กิจกรรม") {
      const generalAt = currentRequest.steps?.activity_general_check?.updatedAt;
      const facultyAt = currentRequest.steps?.activity_faculty_check?.updatedAt;
      const candidates = [generalAt, facultyAt].filter(Boolean).map(v => new Date(v).getTime());
      if (candidates.length === 0) return null;
      return new Date(Math.max(...candidates));
    }
    if (taskName === "เอกสารที่อัปโหลด") {
      const fileCheckAt = currentRequest.steps?.file_check?.updatedAt;
      const uploadedAt = latestGeneralDocument?.uploadedAt;
      const candidates = [fileCheckAt, uploadedAt].filter(Boolean).map(v => new Date(v).getTime());
      if (candidates.length === 0) return null;
      return new Date(Math.max(...candidates));
    }
    if (taskName === "ชำระค่าออกฝึก") {
      const internshipCheckAt = currentRequest.steps?.internship_fee_check?.updatedAt;
      const uploadedAt = latestInternshipReceiptDocument?.uploadedAt;
      const candidates = [internshipCheckAt, uploadedAt].filter(Boolean).map(v => new Date(v).getTime());
      if (candidates.length === 0) return null;
      return new Date(Math.max(...candidates));
    }
    const stepKey = taskStepMap[taskName];
    if (!stepKey) return null;
    const updatedAt = currentRequest.steps?.[stepKey]?.updatedAt;
    if (!updatedAt) return null;
    return new Date(updatedAt);
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

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 4, mt: 2 }}>
      
      {/* Left Column: Milestone Road Map */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1, pl: 1 }}>
          Academic Journey Track (เส้นทางการตรวจผล)
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>
          {tasks.map((task, idx) => {
            const isActive = task.id === activeTaskId;
            const status = task.status || 'waiting';
            const color = getTaskStatusColor(status);
            
            return (
              <Box
                key={task.id}
                component={motion.div}
                whileHover={{ x: 6 }}
                onClick={() => setActiveTaskId(task.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 3.5,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isActive ? 'primary.main' : 'divider',
                  bgcolor: isActive ? alpha('#064460', 0.04) : 'background.paper',
                  boxShadow: isActive ? '0 8px 20px rgba(6, 68, 96, 0.06)' : 'none',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {/* Node Line Connector decoration (Milestone Track style) */}
                {idx < tasks.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 31,
                      top: 48,
                      width: 2,
                      height: 24,
                      bgcolor: 'divider',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Left Colored Avatar Status Icon */}
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: getTaskBgColor(status),
                    color: color,
                    border: `2px solid ${color}`,
                    zIndex: 1,
                    mr: 2,
                  }}
                >
                  {taskIcons[task.id]}
                </Avatar>

                {/* Task Name & Short status */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="700" color="text.primary" noWrap>
                    {task.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {status === 'approved' && <CheckCircleIcon sx={{ fontSize: 13, color: 'success.main' }} />}
                    {status === 'rejected' && <CancelIcon sx={{ fontSize: 13, color: 'error.main' }} />}
                    {status === 'waiting' && <HourglassEmptyIcon sx={{ fontSize: 13, color: 'text.secondary' }} />}
                    {statusConfig[status]?.label}
                  </Typography>
                </Box>

                <ChevronRightIcon
                  sx={{
                    color: isActive ? 'primary.main' : 'text.disabled',
                    transform: isActive ? 'translateX(0px)' : 'translateX(-4px)',
                    transition: 'all 0.2s',
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Right Column: Detailed Milestone Inspector Panel */}
      <AnimatePresence mode="wait">
        <Box
          key={activeTaskId}
          component={motion.div}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 5,
              border: '1px solid',
              borderColor: activeTask.status === 'rejected' ? 'error.light' : 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 12px 36px rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 460,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Custom university watermark visual element */}
            <Box
              sx={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                color: 'action.disabledOpacity',
                opacity: 0.05,
                transform: 'rotate(-15deg)',
                pointerEvents: 'none',
              }}
            >
              {taskIcons[activeTask.id]}
            </Box>

            {/* Header info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 44, height: 44 }}>
                  {taskIcons[activeTask.id]}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="800" color="text.primary">
                    {activeTask.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ขั้นตอนการตรวจสอบหลักสูตร ลำดับที่ {activeTask.id}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={getTaskStatusLabel(activeTask.status)}
                sx={{
                  bgcolor: getTaskBgColor(activeTask.status),
                  color: getTaskStatusColor(activeTask.status),
                  fontWeight: '800',
                  px: 1.5,
                  py: 2,
                  borderRadius: 2.5,
                  fontSize: '0.8rem',
                  border: `1px solid ${getTaskStatusColor(activeTask.status)}33`,
                }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Help Guide for the Active Step */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1.5, p: 2, bgcolor: 'background.default', borderRadius: 3, borderLeft: '4px solid #F9C824' }}>
              <InfoIcon sx={{ color: '#F9C824', mt: 0.2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.88rem' }}>
                {taskGuides[activeTask.id]}
              </Typography>
            </Box>

            {/* Sub-items status check list */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" fontWeight="700" color="text.primary" sx={{ mb: 2 }}>
                รายการย่อยที่ตรวจ (Checklist Items)
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {activeTaskItems.map((item, idx) => {
                  let displayValue = item.value;

                  if (activeTask.name === "กิจกรรม") {
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

                  const mappedStepByItem = taskItemStepMap[activeTask.name]?.[item.label];
                  if (mappedStepByItem) {
                    const stepStatus = currentRequest?.steps?.[mappedStepByItem]?.status || 'waiting';
                    displayValue = stepStatusToThai[stepStatus] || "รอดำเนินการ";
                  }

                  if (activeTask.name !== "กิจกรรม" && !mappedStepByItem && taskStepMap[activeTask.name]) {
                    const stepKey = taskStepMap[activeTask.name];
                    const stepStatus = currentRequest?.steps?.[stepKey]?.status || 'waiting';
                    displayValue = stepStatusToThai[stepStatus] || "รอดำเนินการ";
                  }

                  if (activeTask.name === "เอกสารที่อัปโหลด") {
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

                  if (activeTask.name === "ชำระค่าออกฝึก") {
                    const internshipStepStatus = currentRequest?.steps?.internship_fee_check?.status || 'waiting';
                    if (item.label === "ผลการตรวจสอบ") {
                      displayValue = stepStatusToThai[internshipStepStatus] || "รอดำเนินการ";
                    }
                  }

                  const rejectComment = getTaskItemRejectComment(activeTask.name, item.label);
                  const isItemPassed = displayValue === "ผ่าน" || displayValue.includes("อนุมัติ");
                  const isItemFailed = displayValue === "ไม่ผ่าน";

                  return (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: isItemFailed ? 'error.light' : 'divider',
                        bgcolor: 'background.default',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="700" color="text.primary">
                          {item.label}
                        </Typography>
                        <Chip
                          label={displayValue}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            bgcolor: isItemPassed ? '#e8f5e9' : isItemFailed ? '#ffebee' : '#fff9c4',
                            color: isItemPassed ? '#2e7d32' : isItemFailed ? '#c62828' : '#f57f17',
                            fontSize: '0.72rem',
                          }}
                        />
                      </Box>
                      {rejectComment && (
                        <Alert severity="error" sx={{ py: 0, borderRadius: 2, fontSize: '0.8rem', mt: 0.5 }}>
                          เหตุผลตีกลับ: {rejectComment}
                        </Alert>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Actions Block (File uploads, downloads) */}
            <Box sx={{ mt: 'auto', pt: 2 }}>
              {activeTask.uploadable && (!activeTask.fileUploaded || activeTask.status === 'rejected') && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  onClick={() => onUploadClick(activeTask)}
                  sx={{
                    py: 1.2,
                    borderRadius: 3.5,
                    fontWeight: 'bold',
                    boxShadow: '0 8px 24px rgba(249, 200, 36, 0.25)',
                    bgcolor: '#F9C824',
                    color: 'white',
                    '&:hover': { bgcolor: '#e5b61b' },
                  }}
                >
                  {activeTask.fileUploaded ? 'อัปโหลดเอกสารใหม่' : 'อัปโหลดไฟล์หลักฐาน'}
                </Button>
              )}

              {activeTask.uploadable && activeTask.fileUploaded && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    ไฟล์หลักฐานที่ยื่นเข้าระบบ:
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    component="a"
                    href={getDocumentUrl(activeTask.id === 7 ? latestInternshipReceiptDocument : latestGeneralDocument)}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      py: 1.2,
                      borderRadius: 3.5,
                      fontWeight: 'bold',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': { bgcolor: alpha('#064460', 0.04), borderColor: 'primary.dark' },
                    }}
                  >
                    เปิดดูไฟล์เอกสารขอจบ ({activeTask.id === 7 ? 'สลิปค่าออกฝึก' : 'ไฟล์คำร้องหลัก'})
                  </Button>
                </Box>
              )}

              {/* Timestamp at bottom right */}
              {(() => {
                const lastUpdated = getTaskLastUpdatedAt(activeTask.name);
                if (!lastUpdated) return null;
                return (
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
                    ตรวจสอบอัปเดตเมื่อ: {formatThaiDateTime(lastUpdated)}
                  </Typography>
                );
              })()}
            </Box>

          </Paper>
        </Box>
      </AnimatePresence>

    </Box>
  );
}
