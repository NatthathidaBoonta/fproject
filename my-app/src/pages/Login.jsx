import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';

// Import Logo (Assuming it's in public/img or adjust path as needed)
const LOGO_PATH = './img/Untitled-2-1 (1).png';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      setLoading(false);
      return;
    }

    try {
      // Mock Login Logic
      // จำลองการตรวจสอบ (ในอนาคตค่อยต่อ API)
      await new Promise(resolve => setTimeout(resolve, 800)); // หน่วงเวลา 800ms

      const email = formData.email;
      const pass = formData.password;

      let userRole = null;
      let userData = { email };

      // Simple Role Check Logic (Hardcoded)
      if (email.includes('student') || email === 'std') {
        userRole = 'student';
        userData = { ...userData, name: 'นักศึกษา ทดสอบ', role: 'Student' };
      } else if (email.includes('advisor') || email === 'adv') {
        userRole = 'advisor';
        userData = { ...userData, name: 'อ.ที่ปรึกษา', role: 'Advisor' };
      } else if (email.includes('office') || email === 'off') {
        userRole = 'office';
        userData = { ...userData, name: 'เจ้าหน้าที่', role: 'Office' };
      } else if (email.includes('admin') || email === 'adm') {
        userRole = 'admin';
        userData = { ...userData, name: 'ผู้ดูแลระบบ', role: 'Admin' };
      } else {
        // Default fallback for testing
        if (pass === '1234') {
          userRole = 'admin';
          userData = { ...userData, name: 'Admin Default', role: 'Admin' };
        }
      }

      if (userRole) {
        // Login Success
        const mockToken = "mock_token_" + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(userData));

        if (setUser) {
          setUser(userData);
        }

        // Redirect based on role
        if (userData.role === 'Student') {
          navigate('/student');
        } else if (userData.role === 'Advisor') {
          navigate('/advisor');
        } else if (userData.role === 'Office') {
          navigate('/office');
        } else {
          // Default or Admin
          navigate('/admin');
        }
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f8fafc',
      backgroundImage: 'url("./img/wall.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Overlay to darken the background slightly for better readability */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: 'rgba(0, 0, 0, 0.4)', // Dark overlay
        zIndex: 0
      }} />

      <Paper elevation={0} sx={{
        width: '100%',
        maxWidth: 450,
        p: { xs: 3, sm: 5 },
        borderRadius: 4,
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.3)',
        bgcolor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent white
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(10px)'
      }}>

        {/* Header / Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            component="img"
            src={LOGO_PATH}
            alt="University Logo"
            sx={{
              height: 80,
              mb: 2,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h5" fontWeight="800" color="#1e293b" gutterBottom>
            เข้าสู่ระบบ
          </Typography>
          <Typography variant="body2" color="#64748b">
            ระบบตรวจสอบและติดตามคำร้องขอจบการศึกษา
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            <TextField
              fullWidth
              label="อีเมล / ชื่อผู้ใช้"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              placeholder="กรอกอีเมลของคุณ"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: '#f8fafc' }
              }}
            />

            <TextField
              fullWidth
              label="รหัสผ่าน"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              placeholder="กรอกรหัสผ่าน"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#94a3b8' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: '#f8fafc' }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={!loading && <LoginIcon />}
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                bgcolor: '#F9C824',
                color: 'white',
                boxShadow: '0 4px 12px rgba(249, 200, 36, 0.4)',
                '&:hover': { bgcolor: '#E0B31F', transform: 'translateY(-1px)' },
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="caption" color="#94a3b8">
                ลืมรหัสผ่าน? กรุณาติดต่อเจ้าหน้าที่สำนักทะเบียน
              </Typography>
            </Box>

          </Box>
        </form>
      </Paper>

      {/* Footer Text */}
      <Box sx={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', zIndex: 1 }}>
        <Typography variant="caption" color="white" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          © 2026 University Graduation System. All rights reserved.
        </Typography>
      </Box>

    </Box>
  );
}

export default Login;