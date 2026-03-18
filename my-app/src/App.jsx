import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { AppBar, Box, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemButton, Divider, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { getUsers } from "./services/api";

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
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoginPage = location.pathname === '/';

  // --- 1. State สำหรับโปรไฟล์ส่วนตัว ---
  const [myProfile, setMyProfile] = useState({
    role: "Admin", // Default for development
    name: "System Admin",
    id: "admin",
    email: "admin@sskru.ac.th",
    password: "adminpassword"
  });

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setMyProfile(JSON.parse(savedUser));
    } else {
      setMyProfile(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setMyProfile(null);
    window.location.href = '/';
  };

  // ฟิลเตอร์เฉพาะรายชื่อ "ที่ปรึกษา" เพื่อส่งไปให้หน้าแอดมิน/ฟอร์มนักศึกษา
  const advisors = users.filter(u => u.role === "Advisor");

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* ส่วน AppBar ด้านบน (ซ่อนเมื่ออยู่หน้า Login) */}
      {!isLoginPage && (
      <AppBar position="static" sx={{ backgroundColor: '#ffffffff', color: '#1e293b', boxShadow: 1, borderBottom: '4px solid #F9C824' }}>
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
            src="../img/Untitled-2-1 (1).png"
          />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#1e293b' }}>
            ระบบคำร้องขอจบการศึกษา
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {myProfile?.role === 'Admin' && (
              <>
                <Button color="inherit" component={NavLink} to="/admin" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Admin</Button>
                <Button color="inherit" component={NavLink} to="/adminfrom" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Admin Form</Button>
              </>
            )}

            {myProfile?.role === 'Student' && (
              <Button color="inherit" component={NavLink} to="/student" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Student Dashboard</Button>
            )}

            {myProfile?.role === 'Advisor' && (
              <Button color="inherit" component={NavLink} to="/advisor" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Advisor</Button>
            )}

            {myProfile?.role === 'Office' && (
              <>
                {myProfile.deptName === 'ฝ่ายทะเบียน' && (
                  <Button color="inherit" component={NavLink} to="/office/registration" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>งานทะเบียน</Button>
                )}
                {myProfile.deptName === 'ฝ่ายวิทยบริการและเทคโนโลยี' && (
                  <>
                    <Button color="inherit" component={NavLink} to="/office/library" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>งานหอสมุด</Button>
                    <Button color="inherit" component={NavLink} to="/office/information" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>งานสารสนเทศ</Button>
                  </>
                )}
                {myProfile.deptName === 'ฝ่ายศูนย์ภาษา' && (
                  <Button color="inherit" component={NavLink} to="/office/language" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>ศูนย์ภาษา</Button>
                )}
                {myProfile.deptName === 'ฝ่ายกิจกรรม' && (
                  <Button color="inherit" component={NavLink} to="/office/eventh" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>งานกิจกรรม</Button>
                )}
              </>
            )}

            {myProfile && (
              <>
                <Button color="inherit" component={NavLink} to="/profile" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Profile</Button>
                <Button color="inherit" onClick={handleLogout} sx={{ '&:hover': { color: '#F9C824' } }}>Logout</Button>
              </>
            )}

            {!myProfile && (
              <Button color="inherit" component={NavLink} to="/" sx={{ '&.active': { color: '#F9C824', fontWeight: 'bold' } }}>Login</Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      )}

      {/* ส่วน Drawer เมนูข้าง (ซ่อนเมื่ออยู่หน้า Login) */}
      {!isLoginPage && (
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
            {/* Conditional Drawer Menu Items */}
            {myProfile?.role === 'Admin' && (
              <>
                <ListItemButton component={NavLink} to="/admin" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                  <ListItemText primary="จัดการผู้ใช้ (Admin)" primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItemButton>
                <ListItemButton component={NavLink} to="/adminfrom" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                  <ListItemText primary="ฟอร์มแอดมิน" primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItemButton>
              </>
            )}

            {myProfile?.role === 'Student' && (
              <ListItemButton component={NavLink} to="/student" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                <ListItemText primary="Dashboard นิสิต" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            )}

            {myProfile?.role === 'Advisor' && (
              <ListItemButton component={NavLink} to="/advisor" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                <ListItemText primary="งานที่ปรึกษา" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            )}

            {myProfile?.role === 'Office' && (
              <>
                {myProfile.deptName === 'ฝ่ายทะเบียน' && (
                  <ListItemButton component={NavLink} to="/office/registration" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                    <ListItemText primary="งานทะเบียน" primaryTypographyProps={{ fontWeight: 500 }} />
                  </ListItemButton>
                )}
                {myProfile.deptName === 'ฝ่ายวิทยบริการและเทคโนโลยี' && (
                  <>
                    <ListItemButton component={NavLink} to="/office/library" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                      <ListItemText primary="งานหอสมุด" primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                    <ListItemButton component={NavLink} to="/office/information" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                      <ListItemText primary="งานสารสนเทศ" primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                  </>
                )}
                {myProfile.deptName === 'ฝ่ายศูนย์ภาษา' && (
                  <ListItemButton component={NavLink} to="/office/language" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                    <ListItemText primary="ศูนย์ภาษา" primaryTypographyProps={{ fontWeight: 500 }} />
                  </ListItemButton>
                )}
                {myProfile.deptName === 'ฝ่ายกิจกรรม' && (
                  <ListItemButton component={NavLink} to="/office/eventh" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                    <ListItemText primary="งานกิจกรรม" primaryTypographyProps={{ fontWeight: 500 }} />
                  </ListItemButton>
                )}
              </>
            )}

            {myProfile && (
              <ListItemButton component={NavLink} to="/profile" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                <ListItemText primary="โปรไฟล์ส่วนตัว" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            )}

            {!myProfile && (
              <ListItemButton component={NavLink} to="/" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, color: '#475569', '&.active': { bgcolor: '#fffbeb', color: '#d97706', fontWeight: 'bold' } }}>
                <ListItemText primary="เข้าสู่ระบบ" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            )}

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
      )}

      {/* ส่วนแสดงเนื้อหา (Content) */}
      <Box sx={{ p: isLoginPage ? 0 : 3 }}>
        <Routes>
          {/* 1. หน้าแดชบอร์ดแอดมิน: ภาพรวม + จัดการผู้ใช้ */}
          <Route path="/admin" element={
            <AdminDashboard users={users} setUsers={setUsers} onRefresh={fetchUsers} />
          } />
          <Route path="/adminfrom" element={
            <Adminfrom users={users} setUsers={setUsers} advisors={advisors} onRefresh={fetchUsers} />
          } />

          <Route path="/" element={<Login setUser={setMyProfile} />} />
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