import React, { useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "../../App.css";

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

const initialTasks = [
  { id: 1, name: "โครงสร้างหลักสูตร", status: "waiting" },
  { id: 2, name: "ห้องสมุด", status: "waiting" },
  { id: 3, name: "กิจกรรม", status: "waiting" },
  { id: 4, name: "สอบดิจิทัล", status: "waiting" },
  { id: 5, name: "สอบอังกฤษ", status: "waiting" },
  { id: 6, name: "เอกสารที่อัปโหลด", status: "waiting", uploadable: true, fileUploaded: false },
  { id: 7, name: "ชำระค่าออกฝึก", status: "waiting" },
  { id: 8, name: "ที่ปรึกษาตรวจสอบ", status: "waiting" },
];

const submissionHistory = [
  {
    id: 1,
    date: "15/12/2567",
    status: "rejected",
    rejectedDate: "18/12/2567",
    remark: "เอกสารไม่ครบถ้วน กรุณาอัพโหลดเอกสารเพิ่มเติม",
  },
  {
    id: 2,
    date: "10/12/2567",
    status: "passed",
    rejectedDate: null,
    remark: null,
  },
];

const statusMap = {
  waiting: { label: "รอดำเนินการ", color: "#FACC15", text: "#92400E" },
  passed: { label: "ผ่าน", color: "#BBF7D0", text: "#166534" },
  rejected: { label: "ไม่ผ่าน", color: "#FECACA", text: "#991B1B" },
};

export default function StudentScreenUI() {
  const [tasks, setTasks] = useState(initialTasks);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const waitingCount = tasks.filter((t) => t.status === "waiting").length;
  const passedCount = tasks.filter((t) => t.status === "passed").length;
  const rejectedCount = tasks.filter((t) => t.status === "rejected").length;

  const openModal = (task) => {
    setSelectedTask(task);
    setOpen(true);
  };

  const handleFileUpload = () => {
    setTasks((prev) =>
      prev.map((t) => (t.id === 6 ? { ...t, fileUploaded: true, status: "waiting" } : t))
    );
    setUploadDialogOpen(false);
    setDialogMessage("อัพโหลดไฟล์สำเร็จ\nรอเจ้าหน้าที่ตรวจสอบ");
    setDialogOpen(true);
  };

  const openHistoryDetail = (history) => {
    setSelectedHistory(history);
    setHistoryOpen(true);
  };

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

            {/* History Section */}
            <Box className="mb-8 border-b border-slate-200 pb-6">
              <Typography variant="h6" className="font-bold text-slate-900 mb-4">
                ประวัติการยื่นคำร้อง
              </Typography>
              <Box className="space-y-3 mb-4">
                {submissionHistory.map((history) => (
                  <Card key={history.id} className="border border-slate-200 shadow-sm" sx={{ borderRadius: 3 }}>
                    <CardContent className="p-4">
                      <Box className="flex items-center justify-between gap-3">
                        <Box className="flex-1">
                          <Box className="flex items-center gap-2 mb-1">
                            <Typography className="text-sm font-semibold text-slate-900">
                              ยื่นเมื่อ: {history.date}
                            </Typography>
                            <Chip
                              label={history.status === "passed" ? "ผ่าน" : "ไม่ผ่าน"}
                              size="small"
                              sx={{
                                backgroundColor: history.status === "passed" ? "#BBF7D0" : "#FECACA",
                                color: history.status === "passed" ? "#166534" : "#991B1B",
                                fontWeight: 700,
                                fontSize: "0.7rem",
                                height: "20px",
                              }}
                            />
                          </Box>
                          {history.status === "rejected" && (
                            <Typography className="text-xs text-red-600">
                              ตีกลับเมื่อ: {history.rejectedDate}
                            </Typography>
                          )}
                          {history.remark && (
                            <Typography className="text-xs text-slate-600 mt-1">
                              หมายเหตุ: {history.remark}
                            </Typography>
                          )}
                        </Box>
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
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Action Buttons */}
              <Box className="flex gap-3">
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "#F9C824",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    py: 1,
                    "&:hover": { backgroundColor: "#F9C824" },
                  }}
                >
                  ส่งให้ที่ปรึกษา
                </Button>
                <Button
                  fullWidth
                  disabled
                  sx={{
                    backgroundColor: "#f1f5f9",
                    color: "#94a3b8",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    py: 1
                  }}
                >
                  ยื่นใบคำร้อง
                </Button>
              </Box>
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
                            {t.uploadable && !t.fileUploaded && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => setUploadDialogOpen(true)}
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
                                อัพโหลด
                              </Button>
                            )}
                          </Box>
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
                  อัพเดตล่าสุดเมื่อ 11 พฤษจิกายน พ.ศ. 2568
                </Typography>

                <Box className="bg-gray-50 rounded-lg p-4 space-y-3 md:space-y-4">
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {taskDetails[selectedTask.name]?.map((item, idx) => (
                      <Box key={idx} className="space-y-1">
                        <Typography className="text-gray-500 text-xs md:text-sm font-medium">
                          {item.label}
                        </Typography>
                        <Box className="flex items-center gap-2">
                          <Chip
                            label={item.value}
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
                      </Box>
                    ))}
                  </Box>
                </Box>

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
                      label={selectedHistory.status === "passed" ? "ผ่าน" : "ไม่ผ่าน"}
                      size="small"
                      sx={{
                        backgroundColor: selectedHistory.status === "passed" ? "#BBF7D0" : "#FECACA",
                        color: selectedHistory.status === "passed" ? "#166534" : "#991B1B",
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
            onClose={() => setUploadDialogOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <Box className="p-6 md:p-8 space-y-4">
              <Typography className="text-center font-bold text-lg md:text-xl text-slate-900">
                อัพโหลดเอกสาร
              </Typography>
              <Typography className="text-center text-sm text-gray-500">
                กรุณาเลือกไฟล์เอกสารที่ต้องการอัพโหลด
              </Typography>

              <Box className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: "none" }}
                  accept=".pdf,.jpg,.jpeg,.png"
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
                  sx={{
                    backgroundColor: "#F9C824",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 1,
                    "&:hover": { backgroundColor: "#F9C824" },
                  }}
                >
                  อัพโหลด
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

