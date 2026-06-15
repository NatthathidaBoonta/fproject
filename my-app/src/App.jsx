import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  ThemeProvider,
  CssBaseline,
  Badge,
  Popover,
  MenuItem,
  Tooltip,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getUsers, getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "./services/api";
import { getAppTheme } from "./theme";

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

  // --- 1. State สำหรับธีมและ Dark Mode ---
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  const toggleDarkMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // --- 2. State สำหรับโปรไฟล์ส่วนตัว ---
  const [myProfile, setMyProfile] = useState({
    role: "Admin", // Default for development
    name: "System Admin",
    id: "admin",
    email: "admin@sskru.ac.th",
    password: "adminpassword"
  });

  // --- 3. State สำหรับการแจ้งเตือน ---
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const openNotifications = Boolean(anchorEl);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

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

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!myProfile?.id) return;
    try {
      const data = await getNotifications(myProfile.id);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setMyProfile(parsedUser);
    } else {
      setMyProfile(null);
    }
  }, []);

  useEffect(() => {
    if (myProfile?.id) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [myProfile?.id]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setMyProfile(null);
    window.location.href = '/';
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!myProfile?.id) return;
    try {
      await markAllNotificationsAsRead(myProfile.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      handleCloseNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const advisors = users.filter(u => u.role === "Advisor");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* ส่วน AppBar ด้านบน (ซ่อนเมื่ออยู่หน้า Login) */}
        {!isLoginPage && (
          <AppBar
            position="static"
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: 2,
              borderBottom: '4px solid',
              borderColor: 'primary.main',
            }}
          >
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
                  height: 38,
                  mr: 2,
                  display: { xs: 'none', sm: 'block' }
                }}
                src="../img/Untitled-2-1 (1).png"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', color: 'text.primary' }}>
                ระบบคำร้องขอจบการศึกษา
              </Typography>

              {/* Theme Toggle Button */}
              <Tooltip title={mode === 'dark' ? "โหมดสว่าง" : "โหมดมืด"}>
                <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1.5 }}>
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              {/* Notification Center Trigger */}
              {myProfile && (
                <Tooltip title="การแจ้งเตือน">
                  <IconButton color="inherit" onClick={handleOpenNotifications} sx={{ mr: 2 }}>
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {/* Desktop Navigation Links */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
                {myProfile?.role === 'Admin' && (
                  <>
                    <Button color="inherit" component={NavLink} to="/admin" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>Admin</Button>
                    <Button color="inherit" component={NavLink} to="/adminfrom" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>Admin Form</Button>
                  </>
                )}

                {myProfile?.role === 'Student' && (
                  <Button color="inherit" component={NavLink} to="/student" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>Dashboard นิสิต</Button>
                )}

                {myProfile?.role === 'Advisor' && (
                  <Button color="inherit" component={NavLink} to="/advisor" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>งานที่ปรึกษา</Button>
                )}

                {myProfile?.role === 'Office' && (
                  <>
                    {myProfile.deptName === 'ฝ่ายทะเบียน' && (
                      <Button color="inherit" component={NavLink} to="/office/registration" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>งานทะเบียน</Button>
                    )}
                    {myProfile.deptName === 'ฝ่ายวิทยบริการและเทคโนโลยี' && (
                      <>
                        <Button color="inherit" component={NavLink} to="/office/library" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>งานหอสมุด</Button>
                        <Button color="inherit" component={NavLink} to="/office/information" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>งานสารสนเทศ</Button>
                      </>
                    )}
                    {myProfile.deptName === 'ฝ่ายศูนย์ภาษา' && (
                      <Button color="inherit" component={NavLink} to="/office/language" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>ศูนย์ภาษา</Button>
                    )}
                    {myProfile.deptName === 'ฝ่ายกิจกรรม' && (
                      <Button color="inherit" component={NavLink} to="/office/eventh" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>งานกิจกรรม</Button>
                    )}
                  </>
                )}

                {myProfile && (
                  <>
                    <Button color="inherit" component={NavLink} to="/profile" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>โปรไฟล์</Button>
                    <Button color="inherit" onClick={handleLogout} sx={{ '&:hover': { color: 'error.main' } }}>ออกจากระบบ</Button>
                  </>
                )}

                {!myProfile && (
                  <Button color="inherit" component={NavLink} to="/" sx={{ '&.active': { color: 'primary.main', fontWeight: 'bold' } }}>เข้าสู่ระบบ</Button>
                )}
              </Box>
            </Toolbar>
          </AppBar>
        )}

        {/* Notifications Popover Dropdown */}
        <Popover
          open={openNotifications}
          anchorEl={anchorEl}
          onClose={handleCloseNotifications}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 400,
              borderRadius: 3,
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              overflowY: 'auto',
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" fontWeight="700">การแจ้งเตือน</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead} sx={{ fontSize: '0.75rem', p: 0, minWidth: 'auto' }}>
                อ่านทั้งหมด
              </Button>
            )}
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">ไม่มีการแจ้งเตือนในขณะนี้</Typography>
              </Box>
            ) : (
              notifications.map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: notif.isRead ? 'transparent' : 'action.hover',
                    whiteSpace: 'normal',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: notif.isRead ? 500 : 700, fontSize: '0.82rem', color: 'text.primary' }}>
                    {notif.message}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notif.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    {!notif.isRead && (
                      <Chip label="ใหม่" color="error" size="small" sx={{ height: 16, fontSize: '0.62rem', fontWeight: 'bold' }} />
                    )}
                  </Box>
                </MenuItem>
              ))
            )}
          </List>
        </Popover>

        {/* ส่วน Drawer เมนูข้างสำหรับหน้าจอ Mobile */}
        {!isLoginPage && (
          <Drawer
            anchor="left"
            open={open}
            onClose={() => setOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: 260,
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderRight: '1px solid',
                borderColor: 'divider',
                boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
              }
            }}
          >
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'primary.main', mb: 2 }}>
                เมนูระบบ
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {myProfile?.role === 'Admin' && (
                  <>
                    <ListItemButton component={NavLink} to="/admin" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                      <ListItemText primary="จัดการผู้ใช้ (Admin)" primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                    <ListItemButton component={NavLink} to="/adminfrom" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                      <ListItemText primary="ฟอร์มแอดมิน" primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                  </>
                )}

                {myProfile?.role === 'Student' && (
                  <ListItemButton component={NavLink} to="/student" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                    <ListItemText primary="Dashboard นิสิต" primaryTypographyProps={{ fontWeight: 500 }} />
                  </ListItemButton>
                )}

                {myProfile?.role === 'Advisor' && (
                  <ListItemButton component={NavLink} to="/advisor" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                    <ListItemText primary="งานที่ปรึกษา" primaryTypographyProps={{ fontWeight: 500 }} />
                  </ListItemButton>
                )}

                {myProfile?.role === 'Office' && (
                  <>
                    {myProfile.deptName === 'ฝ่ายทะเบียน' && (
                      <ListItemButton component={NavLink} to="/office/registration" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                        <ListItemText primary="งานทะเบียน" primaryTypographyProps={{ fontWeight: 500 }} />
                      </ListItemButton>
                    )}
                    {myProfile.deptName === 'ฝ่ายวิทยบริการและเทคโนโลยี' && (
                      <>
                        <ListItemButton component={NavLink} to="/office/library" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                          <ListItemText primary="งานหอสมุด" primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItemButton>
                        <ListItemButton component={NavLink} to="/office/information" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                          <ListItemText primary="งานสารสนเทศ" primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItemButton>
                      </>
                    )}
                    {myProfile.deptName === 'ฝ่ายศูนย์ภาษา' && (
                      <ListItemButton component={NavLink} to="/office/language" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                        <ListItemText primary="ศูนย์ภาษา" primaryTypographyProps={{ fontWeight: 500 }} />
                      </ListItemButton>
                    )}
                    {myProfile.deptName === 'ฝ่ายกิจกรรม' && (
                      <ListItemButton component={NavLink} to="/office/eventh" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                        <ListItemText primary="งานกิจกรรม" primaryTypographyProps={{ fontWeight: 500 }} />
                      </ListItemButton>
                    )}
                  </>
                )}

                {myProfile && (
                  <ListItemButton component={NavLink} to="/profile" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                    <ListItemText primary="โปรไฟล์ส่วนตัว" primaryTypographyProps={{ fontWeight: 500 }} />
                  </ListItemButton>
                )}

                {!myProfile && (
                  <ListItemButton component={NavLink} to="/" onClick={() => setOpen(false)} sx={{ mb: 1, borderRadius: 2, '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' } }}>
                    <ListItemText primary="เข้าสู่ระบบ" primaryTypographyProps={{ fontWeight: 500 }} />
                  </ListItemButton>
                )}

                <Divider sx={{ my: 2 }} />

                <ListItemButton
                  onClick={() => { setOpen(false); handleLogout(); }}
                  sx={{
                    borderRadius: 2,
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' }
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
            <Route path="/admin" element={
              <AdminDashboard users={users} setUsers={setUsers} onRefresh={fetchUsers} />
            } />
            <Route path="/adminfrom" element={
              <Adminfrom users={users} setUsers={setUsers} advisors={advisors} onRefresh={fetchUsers} />
            } />

            <Route path="/" element={<Login setUser={setMyProfile} />} />
            <Route path="/student" element={<Dashboard />} />

            <Route path="/profile" element={<Profile user={myProfile} />} />

            <Route path="/profile/edit" element={
              <EditProfile user={myProfile} setUser={setMyProfile} />
            } />

            <Route path="/advisor" element={<AdvisorDashboard />} />
            <Route path="/advisor/:id" element={<AdvisorDetail />} />

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
    </ThemeProvider>
  );
}