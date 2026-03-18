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
const LOGO_PATH = './img/R.png';

import { login } from '../services/api';

function Login({ setUser }) {
  const navigate = useNavigate();
  const uiFont = 'Noto Sans Thai, Prompt, sans-serif';
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

    if (!formData.email || !formData.password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      setLoading(false);
      return;
    }

    try {
      const userData = await login({
        email: formData.email,
        password: formData.password
      });

      // Login Success
      localStorage.setItem('user', JSON.stringify(userData));

      if (setUser) {
        setUser(userData);
      }

      // Redirect based on role
      const role = userData.role;
      if (role === 'Student') {
        navigate('/student');
      } else if (role === 'Advisor') {
        navigate('/advisor');
      } else if (role === 'Office') {
        const dept = userData.deptName;
        if (dept === 'ฝ่ายทะเบียน') {
          navigate('/office/registration');
        } else if (dept === 'ฝ่ายวิทยบริการและเทคโนโลยี') {
          navigate('/office/library');
        } else if (dept === 'ฝ่ายศูนย์ภาษา') {
          navigate('/office/language');
        } else if (dept === 'ฝ่ายกิจกรรม') {
          navigate('/office/eventh');
        } else {
          navigate('/office');
        }
      } else if (role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
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
      px: 2,
      py: 4,
      fontFamily: uiFont,
      bgcolor: '#f8fafc',
      backgroundImage: 'url("./img/wall.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Main dark overlay for readable foreground content */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, rgba(3, 7, 18, 0.48), rgba(15, 23, 42, 0.34))',
        zIndex: 0
      }} />

      {/* Soft decorative spotlight to avoid a flat background */}
      <Box sx={{
        position: 'absolute',
        top: '-120px',
        right: '-80px',
        width: { xs: 260, md: 360 },
        height: { xs: 260, md: 360 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(148, 163, 184, 0.2) 0%, rgba(148, 163, 184, 0) 70%)',
        zIndex: 0
      }} />

      <Paper elevation={0} sx={{
        width: '100%',
        maxWidth: 460,
        p: { xs: 3, sm: 5 },
        borderRadius: 5,
        border: '1px solid rgba(226, 232, 240, 0.55)',
        boxShadow: '0 24px 48px -24px rgba(15, 23, 42, 0.5)',
        bgcolor: 'rgba(255, 255, 255, 0.84)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
        animation: 'fadeSlide 420ms ease-out',
        '@keyframes fadeSlide': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 5,
          background: 'linear-gradient(90deg, #F59E0B, #F9C824)'
        }} />

        {/* Header / Logo */}
        <Box sx={{ textAlign: 'center', mb: 4, mt: 1 }}>
          <Box
            component="img"
            src={LOGO_PATH}
            alt="University Logo"
            sx={{
              display: 'block',
              mx: 'auto',
              width: 120,
              height: 120,
              mb: 2,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h5" fontWeight="800" color="#0f172a" gutterBottom sx={{ letterSpacing: 0.2, fontFamily: uiFont }}>
            เข้าสู่ระบบ
          </Typography>
          <Typography variant="body2" color="#475569" sx={{ fontFamily: uiFont }}>
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
                    <PersonOutlineIcon sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  fontFamily: uiFont,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F59E0B' }
                }
              }}
              InputLabelProps={{ sx: { fontFamily: uiFont } }}
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
                    <LockOutlinedIcon sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#64748b' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  fontFamily: uiFont,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F59E0B' }
                }
              }}
              InputLabelProps={{ sx: { fontFamily: uiFont } }}
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
                fontFamily: uiFont,
                background: 'linear-gradient(90deg, #F59E0B 0%, #F9C824 100%)',
                color: '#0f172a',
                boxShadow: '0 10px 20px -8px rgba(249, 200, 36, 0.8)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #d97706 0%, #eab308 100%)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="caption" color="#64748b" sx={{ fontFamily: uiFont }}>
                ลืมรหัสผ่าน? กรุณาติดต่อเจ้าหน้าที่สำนักทะเบียน
              </Typography>
            </Box>

          </Box>
        </form>
      </Paper>

      {/* Footer Text */}
      <Box sx={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', zIndex: 1 }}>
        <Typography variant="caption" color="white" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontFamily: uiFont }}>
          © 2026 University Graduation System. All rights reserved.
        </Typography>
      </Box>

    </Box>
  );
}

export default Login;