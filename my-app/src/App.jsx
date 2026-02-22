import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { AppBar, Box, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemButton, Divider, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/student/Dashboard";
import Profile from "./pages/Profile";
import AdvisorDashboard from "./pages/advisor/AdvisorDashboard";
import AdvisorDetail from "./pages/advisor/AdvisorDetail";
import OfficeDashboard from "./pages/office/OfficeDashboard";
import OfficeDetail from "./pages/office/OfficeDetail";
import OfficeEventh from "./pages/office/OfficeEventh";
import OfficeRegistration from "./pages/office/OfficeRegistration";
import OfficeLanguage from "./pages/office/OfficeLanguage";
import OfficeInformation from "./pages/office/OfficeInformation";
import OfficeLibrary from "./pages/office/OfficeLibrary";
import EditProfile from "./pages/Editprofile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Adminfrom from "./pages/admin/Adminfrom";


export default function App() {
  const [open, setOpen] = useState(false);

  /* 
    --- 1. State สำหรับโปรไฟล์ส่วนตัว ---
    สามารถเปลี่ยน role เป็น "Advisor" หรือ "Office" เพื่อทดสอบการแสดงผลของแต่ละบทบาท
  */
  const [myProfile, setMyProfile] = useState({
    role: "Advisor", // Student, Advisor, Office
    name: "นายสมชาย ใจดี",
    id: "641234567-8", // studentId / advisorId / staffId
    year: "3",
    curriculum: "วิทยาการคอมพิวเตอร์", // หลักสูตร
    major: "วิทยาการคอมพิวเตอร์", // สาขา
    faculty: "วิทยาศาสตร์", // คณะ
    program: "ปกติ", // ภาคเรียน
    email: "somchai@univ.ac.th",
    phone: "081-234-5678",
    office: "สำนักงานทะเบียน", // สำหรับ Office
    image: null, // เก็บ URL รูปภาพ หรือ base64
    password: "password123"
  });

  // --- 2. State สำหรับระบบแอดมิน (ฐานข้อมูลผู้ใช้ทั้งหมด) ---
  const [users, setUsers] = useState([
    { id: 1, email: "adv1@test.com", password: "123", name: "อ.ใจดี", role: "Advisor", branch: "IT", faculty: "Science" }
  ]);

  // ฟิลเตอร์เฉพาะรายชื่อ "ที่ปรึกษา" เพื่อส่งไปให้หน้าแอดมิน/ฟอร์มนักศึกษา
  const advisors = users.filter(u => u.role === "Advisor");

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* ส่วน AppBar ด้านบน */}
      <AppBar position="static" sx={{ backgroundColor: '#ffffff', color: '#1e293b', boxShadow: 1, borderBottom: '4px solid #F9C824' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen(true)}
            sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            sx={{
              height: 50,
              mr: 2,
              display: { xs: 'none', sm: 'block' }
            }}
            src="./img/Untitled-2-1 (1).png"
          />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#1e293b' }}>
            ระบบคำร้องขอจบการศึกษา
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" component={NavLink} to="/admin" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Admin</Button>
            <Button color="inherit" component={NavLink} to="/adminfrom" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Admin Form</Button>
            <Button color="inherit" component={NavLink} to="/advisor" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Advisor</Button>
            <Button color="inherit" component={NavLink} to="/office" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Office</Button>
            <Button color="inherit" component={NavLink} to="/profile" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Profile</Button>
            <Button color="inherit" component={NavLink} to="/" sx={{ '&:hover': { color: '#F9C824' } }}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ส่วน Drawer เมนูข้าง */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            bgcolor: '#ffffff',
            color: '#1e293b',
            borderRight: '1px solid #e2e8f0',
            boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
          }
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#F9C824', mb: 2 }}>
            เมนูหลัก
          </Typography>
          <Divider sx={{ bgcolor: '#e2e8f0', mb: 2 }} />
          <List>
            {[
              { text: 'จัดการผู้ใช้ (Admin)', to: '/admin' },
              { text: 'ฟอร์มแอดมิน', to: '/adminfrom' },
              { text: 'Dashboard นิสิต', to: '/student' },
              { text: 'โปรไฟล์ส่วนตัว', to: '/profile' },
              { text: 'งานที่ปรึกษา', to: '/advisor' },
              { text: 'งานสำนักงาน', to: '/office' }
            ].map((item) => (
              <ListItemButton
                key={item.text}
                component={NavLink}
                to={item.to}
                onClick={() => setOpen(false)}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  color: '#475569',
                  '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' },
                  '&:hover': { bgcolor: '#f1f5f9', color: '#1e293b' }
                }}
              >
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            ))}

            <Divider sx={{ bgcolor: '#e2e8f0', my: 2 }} />

            <ListItemButton
              component={NavLink}
              to="/"
              onClick={() => setOpen(false)}
              sx={{
                borderRadius: 2,
                color: '#ef4444',
                '&:hover': { bgcolor: '#fef2f2' }
              }}
            >
              <ListItemText primary="ออกจากระบบ" primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* ส่วนแสดงเนื้อหา (Content) */}
      <Box sx={{ p: 3 }}>
        <Routes>
          {/* 1. หน้าแดชบอร์ดแอดมิน: ภาพรวม + จัดการผู้ใช้ */}
          <Route path="/admin" element={
            <AdminDashboard users={users} setUsers={setUsers} />
          } />
          <Route path="/adminfrom" element={
            <Adminfrom users={users} setUsers={setUsers} advisors={advisors} />
          } />



          <Route path="/" element={<Login />} />
          <Route path="/student" element={<Dashboard />} />

          {/* 2. หน้าโปรไฟล์ส่วนตัว: ดึงข้อมูลจาก myProfile ไปแสดงผล */}
          <Route path="/profile" element={<Profile user={myProfile} />} />

          {/* 3. หน้าแก้ไขโปรไฟล์: ส่งฟังก์ชัน setMyProfile ไปอัปเดตค่าที่ App.js */}
          <Route path="/profile/edit" element={
            <EditProfile user={myProfile} setUser={setMyProfile} />
          } />



          {/* 4. หน้างานที่ปรึกษา */}
          <Route path="/advisor" element={<AdvisorDashboard />} />
          <Route path="/advisor/:id" element={<AdvisorDetail />} />

          {/* 5. หน้างานสำนักงาน */}
          <Route path="/office" element={<OfficeDashboard />} />
          <Route path="/office/eventh" element={<OfficeEventh />} />
          <Route path="/office/registration" element={<OfficeRegistration />} />
          <Route path="/office/language" element={<OfficeLanguage />} />
          <Route path="/office/information" element={<OfficeInformation />} />
          <Route path="/office/library" element={<OfficeLibrary />} />
          <Route path="/office/:id" element={<OfficeDetail />} />
        </Routes>
      </Box>
    </Box>
  );
}