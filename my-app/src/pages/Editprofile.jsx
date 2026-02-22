import React, { useState, useEffect } from 'react';
import {
  Typography, Button, TextField, Box, Paper, Stack, Avatar, Container, InputAdornment, IconButton, Dialog
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function EditProfile({ user, setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(user);
  const [previewImage, setPreviewImage] = useState(user.image);

  // Mapping configurations for roles (Smooth & Minimal Match Profile.jsx)
  const roleConfig = {
    Student: { color: '#475569', gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
    Advisor: { color: '#4f46e5', gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
    Office: { color: '#ea580c', gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }
  };

  const themeColor = roleConfig[user.role]?.color || '#64748b';
  const themeGradient = roleConfig[user.role]?.gradient || 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)';

  useEffect(() => {
    setFormData(user);
    setPreviewImage(user.image);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser(formData);
    // Simulate API delay or success
    setTimeout(() => {
      setDialogOpen(true);
    }, 300);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    navigate("/profile");
  };

  const renderFormFields = () => {
    const commonProps = {
      fullWidth: true,
      variant: "outlined",
      sx: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          bgcolor: '#f8fafc',
          '& fieldset': { borderColor: '#e2e8f0' },
          '&:hover fieldset': { borderColor: themeColor },
          '&.Mui-focused fieldset': { borderColor: themeColor, borderWidth: 2 }
        },
        '& .MuiInputLabel-root.Mui-focused': { color: themeColor }
      }
    };

    switch (user.role) {
      case 'Student':
        return (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={previewImage}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: '4px solid white',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }}
                />
                <label htmlFor="icon-button-file">
                  <input accept="image/*" id="icon-button-file" type="file" hidden onChange={handleImageChange} />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 0,
                      bgcolor: themeColor,
                      color: 'white',
                      p: 1,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                    component="div"
                  >
                    <PhotoCamera sx={{ fontSize: 20, display: 'block' }} />
                  </Box>
                </label>
              </Box>
              <Typography variant="body2" color="text.secondary">
                แตะที่ไอคอนกล้องเพื่อเปลี่ยนรูปโปรไฟล์
              </Typography>
            </Box>

            <TextField
              {...commonProps}
              name="name"
              label="ชื่อ-นามสกุล"
              value={formData.name || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: themeColor }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              {...commonProps}
              name="password"
              label="รหัสผ่าน"
              type="password"
              value={formData.password || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: themeColor }} />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      case 'Advisor':
      case 'Office':
        return (
          <>
            <TextField
              {...commonProps}
              name="name"
              label="ชื่อ-นามสกุล"
              value={formData.name || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: themeColor }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              {...commonProps}
              name="email"
              label="อีเมล"
              value={formData.email || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: themeColor }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              {...commonProps}
              name="password"
              label="รหัสผ่าน"
              type="password"
              value={formData.password || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: themeColor }} />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      default:
        return <Typography>ไม่สามารถแก้ไขข้อมูลได้</Typography>;
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f0f2f5',
      py: 4
    }}>
      <Container maxWidth="sm">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/profile")}
          sx={{ color: '#64748b', mb: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'transparent', color: '#334155' } }}
        >
          กลับหน้าโปรไฟล์
        </Button>

        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            bgcolor: 'white',
            border: '1px solid #e2e8f0',
            boxShadow: 3
          }}
        >
          <Typography variant="h5" mb={1} fontWeight="800" textAlign="center" color="text.primary">
            แก้ไขข้อมูลส่วนตัว
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4} textAlign="center">
            อัปเดตข้อมูลของคุณเพื่อให้เป็นปัจจุบันอยู่เสมอ
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {renderFormFields()}

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/profile")}
                  startIcon={<CancelIcon />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    borderColor: '#cbd5e1',
                    color: '#64748b',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' }
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disableElevation
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    bgcolor: themeColor,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      bgcolor: themeColor,
                      filter: 'brightness(0.9)',
                    }
                  }}
                >
                  บันทึก
                </Button>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Container>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            แจ้งเตือน
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            บันทึกข้อมูลเรียบร้อยแล้ว
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={handleCloseDialog}
            sx={{
              bgcolor: themeColor,
              color: 'white',
              borderRadius: 2,
              '&:hover': { bgcolor: themeColor, filter: 'brightness(0.9)' }
            }}
          >
            ตกลง
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}

export default EditProfile;