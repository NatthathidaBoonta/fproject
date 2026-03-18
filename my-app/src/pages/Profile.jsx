import React from 'react';
import {
  Typography, Button, Box, Avatar, Grid, Chip, Container, Divider, Paper
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookIcon from '@mui/icons-material/Book';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import CircleIcon from '@mui/icons-material/Circle';

function Profile({ user }) {
  const navigate = useNavigate();

  // Guard clause to prevent crashes if user data is missing
  if (!user) {
    return <Box sx={{ p: 4, textAlign: 'center' }}>Loading Profile...</Box>;
  }

  const roleConfig = {
    Student: {
      color: '#064460', // SSKRU Deep Blue
      label: 'นักศึกษา',
    },
    Advisor: {
      color: '#F9C824', // SSKRU Gold
      label: 'อาจารย์ที่ปรึกษา',
    },
    Office: {
      color: '#0f766e', // Deep Teal (Complimentary)
      label: 'เจ้าหน้าที่สำนักงาน',
    }
  };

  const themeColor = roleConfig[user.role]?.color || '#64748b';

  const InfoCard = ({ icon, label, value }) => (
    <Box sx={{
      p: 2.5,
      borderRadius: 4,
      bgcolor: 'white',
      border: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
    }}>
      <Box sx={{
        mr: 2,
        p: 1.2,
        borderRadius: 3,
        bgcolor: alpha(themeColor, 0.1),
        color: themeColor,
        display: 'flex',
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="500" sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="600" color="text.primary">
          {value || "-"}
        </Typography>
      </Box>
    </Box>
  );

  const renderProfileContent = () => {
    switch (user.role) {
      case 'Student':
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{ fontSize: 10, color: themeColor }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">ข้อมูลการศึกษา</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}><InfoCard icon={<BadgeIcon />} label="รหัสนักศึกษา" value={user.id} /></Grid>
                <Grid size={{ xs: 6 }}><InfoCard icon={<CalendarTodayIcon />} label="ชั้นปี" value={user.year} /></Grid>
                <Grid size={{ xs: 6 }}><InfoCard icon={<PersonIcon />} label="ภาคเรียน" value={user.program} /></Grid>
                <Grid size={{ xs: 12 }}><InfoCard icon={<BookIcon />} label="หลักสูตร" value={user.curriculum} /></Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{ fontSize: 10, color: themeColor }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">สังกัด & ติดต่อ</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}><InfoCard icon={<AccountBalanceIcon />} label="คณะ" value={user.faculty} /></Grid>
                <Grid size={{ xs: 12 }}><InfoCard icon={<SchoolIcon />} label="สาขาวิชา" value={user.major} /></Grid>
                <Grid size={{ xs: 12 }}><InfoCard icon={<EmailIcon />} label="อีเมล" value={user.email} /></Grid>
                <Grid size={{ xs: 12 }}><InfoCard icon={<PhoneIcon />} label="เบอร์โทรศัพท์" value={user.phone} /></Grid>
              </Grid>
            </Grid>
          </Grid>
        );
      case 'Advisor':
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{ fontSize: 10, color: themeColor }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">ข้อมูลอาจารย์</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}><InfoCard icon={<BadgeIcon />} label="รหัสอาจารย์" value={user.id} /></Grid>
                <Grid size={{ xs: 12 }}><InfoCard icon={<AccountBalanceIcon />} label="คณะ" value={user.faculty} /></Grid>
                <Grid size={{ xs: 12 }}><InfoCard icon={<SchoolIcon />} label="สาขาวิชา" value={user.major} /></Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{ fontSize: 10, color: themeColor }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">ข้อมูลติดต่อ</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}><InfoCard icon={<EmailIcon />} label="อีเมล" value={user.email} /></Grid>
                <Grid size={{ xs: 12 }}><InfoCard icon={<PhoneIcon />} label="เบอร์โทรศัพท์" value={user.phone} /></Grid>
              </Grid>
            </Grid>
          </Grid>
        );
      case 'Office':
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{ fontSize: 10, color: themeColor }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">ข้อมูลเจ้าหน้าที่</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}><InfoCard icon={<BadgeIcon />} label="รหัสเจ้าหน้าที่" value={user.id} /></Grid>
                <Grid size={{ xs: 12 }}><InfoCard icon={<BusinessIcon />} label="ประจำสำนักงาน" value={user.office} /></Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{ fontSize: 10, color: themeColor }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">ข้อมูลติดต่อ</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}><InfoCard icon={<EmailIcon />} label="อีเมล" value={user.email} /></Grid>
                <Grid size={{ xs: 12 }}><InfoCard icon={<PhoneIcon />} label="เบอร์โทรศัพท์" value={user.phone} /></Grid>
              </Grid>
            </Grid>
          </Grid>
        );
      default:
        return <Typography>ไม่พบข้อมูล</Typography>;
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#ffffff',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Header Profile Section */}
        <Paper elevation={0} sx={{
          p: 4,
          mb: 3,
          borderRadius: 4,
          textAlign: 'center',
          bgcolor: 'white',
          border: '1px solid #e2e8f0',
          borderTop: '4px solid #F9C824'
        }}>
          <Avatar
            src={user.image}
            alt={user.name}
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto',
              mb: 2,
              border: `4px solid ${alpha(themeColor, 0.2)}`,
              fontSize: '3rem',
              bgcolor: alpha(themeColor, 0.1),
              color: themeColor
            }}
          >
            {user.name.charAt(0)}
          </Avatar>
          <Typography variant="h4" fontWeight="800" color="text.primary" sx={{ mb: 1 }}>
            {user.name}
          </Typography>
          <Chip
            label={roleConfig[user.role]?.label || user.role}
            sx={{
              bgcolor: alpha(themeColor, 0.1),
              color: themeColor,
              fontWeight: 600,
              px: 1,
              fontSize: '0.9rem'
            }}
          />
        </Paper>

        {/* Content Card */}
        <Paper elevation={0} sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          bgcolor: 'white',
          border: '1px solid #e2e8f0'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              ข้อมูลส่วนตัว
            </Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate("/profile/edit")}
              disableElevation
              sx={{
                borderRadius: '50px',
                textTransform: 'none',
                bgcolor: themeColor,
                px: 3,
                '&:hover': {
                  bgcolor: themeColor,
                  filter: 'brightness(0.9)'
                }
              }}
            >
              แก้ไขข้อมูล
            </Button>
          </Box>

          {renderProfileContent()}

          <Divider sx={{ my: 4 }} />

          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Last updated: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Profile;