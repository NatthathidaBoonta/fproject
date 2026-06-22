import React, { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { facultyList, facultyBranches, officeDepts } from '../../data/masterData';
import {
  Box, Paper, Typography, Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import DomainIcon from '@mui/icons-material/Domain';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { deleteUser, updateUser } from '../../services/api';

export default function AdminDashboard({ users, setUsers, onRefresh }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(Boolean(location.state?.successMessage));
  const [successDialogMessage, setSuccessDialogMessage] = useState(location.state?.successMessage || '');

  // --- Stats Calculation ---
  const stats = useMemo(() => ({
    total: users.length,
    office: users.filter(u => u.role === 'Office').length,
    advisor: users.filter(u => u.role === 'Advisor').length,
    student: users.filter(u => u.role === 'Student').length,
  }), [users]);

  // --- Filter Logic ---
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return users.filter(u => {
      const matchesSearch = !s || [
        u.name,
        u.email,
        u.role,
        u.branch,
        u.deptName,
        u.faculty,
        u.advisorName,
        u.id
      ].filter(Boolean).some(val => String(val).toLowerCase().includes(s));
      return matchesSearch;
    });
  }, [users, search]);

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        if (onRefresh) onRefresh();
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        alert("ลบไม่สำเร็จ: " + error.message);
      }
    }
  };

  const handleEditSave = async () => {
    try {
      await updateUser(editUser.id, editUser);
      setEditUser(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      alert("แก้ไขไม่สำเร็จ: " + error.message);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  React.useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessDialogMessage(location.state.successMessage);
      setSuccessDialogOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);



  // --- Grouping Logic for Hierarchy ---
  const getHierarchicalUsers = (role) => {
    const groups = {};

    // Initialize structure to ensure requested sections always appear
    if (role === 'Office') {
      officeDepts.forEach(d => { groups[d] = []; });
    } else {
      facultyList.forEach(f => { groups[f] = { branches: {} }; });
    }

    const roleUsers = filtered.filter(u => u.role === role);

    roleUsers.forEach(u => {
      if (role === 'Office') {
        const dept = u.deptName || 'อื่นๆ';
        if (!groups[dept]) groups[dept] = [];
        groups[dept].push(u);
      } else {
        // Advisor or Student
        const faculty = u.faculty || 'อื่นๆ';
        const branch = u.branch || 'ไม่ระบุสาขา';

        if (!groups[faculty]) groups[faculty] = { branches: {} };
        if (!groups[faculty].branches[branch]) groups[faculty].branches[branch] = [];
        groups[faculty].branches[branch].push(u);
      }
    });
    return groups;
  };

  // Sort keys logic: Predefined list first, then alphabetical
  const sortKeys = (keys, precedenceList) => {
    return keys.sort((a, b) => {
      const idxA = precedenceList.indexOf(a);
      const idxB = precedenceList.indexOf(b);
      // If both in list, sort by index
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      // If one in list, it comes first
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      // Otherwise alphabetical
      return a.localeCompare(b, 'th');
    });
  };

  // --- UI Components ---

  const StatCard = ({ icon, title, count, color, delay }) => (
    <Card sx={{
      height: '100%',
      borderRadius: 4,
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      transform: 'translateY(0)',
      animation: `fadeInUp 0.5s ease-out ${delay}s backwards`,
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: `0 10px 25px ${alpha(color, 0.2)}`
      },
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: alpha(color, 0.1),
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}>
            {icon}
          </Box>
          <Typography variant="body2" fontWeight="600" color="text.secondary">{title}</Typography>
        </Box>
        <Typography variant="h3" fontWeight="800" color="text.primary">
          {count}
        </Typography>
      </CardContent>
    </Card>
  );

  const UserListItem = ({ user }) => (
    <ListItem
      sx={{
        bgcolor: 'white',
        borderRadius: 3,
        mb: 1,
        border: '1px solid #f1f5f9',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: '#f8fafc',
          transform: 'translateX(5px)',
          borderColor: '#e2e8f0'
        }
      }}
      secondaryAction={
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => setEditUser(user)} sx={{ color: '#64748b', '&:hover': { color: '#0ea5e9', bgcolor: alpha('#0ea5e9', 0.1) } }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(user)} sx={{ color: '#64748b', '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1) } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      }
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>{user.name?.[0]}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={<Typography fontWeight="600" color="text.primary">{user.name}</Typography>}
        secondary={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
            <Chip label={user.email} size="small" variant="outlined" sx={{ borderRadius: 1, height: 20, fontSize: '0.75rem' }} />
            {user.role === 'Office' && user.deptName && <Chip label={user.deptName} size="small" sx={{ borderRadius: 1, height: 20, fontSize: '0.75rem', bgcolor: alpha('#2ECC71', 0.05), color: '#2ECC71', border: '1px solid', borderColor: alpha('#2ECC71', 0.2) }} />}
            {user.role === 'Student' && user.id && <Typography variant="caption" color="text.secondary">ID: {user.id}</Typography>}
          </Box>
        }
        secondaryTypographyProps={{ component: 'div' }}
      />
    </ListItem>
  );

  const renderOfficeSection = () => {
    const groups = getHierarchicalUsers('Office');
    const deptKeys = sortKeys(Object.keys(groups), officeDepts);

    return (
      <Box sx={{ mt: 2 }}>
        {deptKeys.map((dept) => {
          const userList = groups[dept];
          return (
            <Accordion key={dept} disableGutters elevation={0} sx={{
              mb: 1.5,
              borderRadius: '12px !important',
              border: '1px solid #e2e8f0',
              '&:before': { display: 'none' },
              overflow: 'hidden'
            }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#64748b' }} />} sx={{ bgcolor: '#f8fafc', px: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DomainIcon fontSize="small" sx={{ color: '#2ECC71' }} />
                    <Typography fontWeight="600" color="text.primary">{dept}</Typography>
                  </Box>
                  <Chip label={userList.length} size="small" sx={{ bgcolor: userList.length > 0 ? '#2ECC71' : '#e2e8f0', color: userList.length > 0 ? 'white' : '#94a3b8', fontWeight: 'bold', height: 20 }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, bgcolor: 'white' }}>
                {userList.length > 0 ? (
                  <List disablePadding>
                    {userList.map(u => <UserListItem key={u.id} user={u} />)}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>ไม่มีรายชื่อในแผนกนี้</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    );
  };

  const renderAcademicSection = (role) => {
    const groups = getHierarchicalUsers(role);
    const facultyKeys = sortKeys(Object.keys(groups), facultyList);
    const color = role === 'Advisor' ? '#F9C824' : '#E74C3C';
    const Icon = role === 'Advisor' ? AssignmentIndIcon : SchoolIcon;

    return (
      <Box sx={{ mt: 2 }}>
        {facultyKeys.map((faculty) => {
          const branches = groups[faculty].branches;
          const branchKeys = Object.keys(branches);
          // Calculate total users in this faculty
          const totalUsers = branchKeys.reduce((sum, key) => sum + branches[key].length, 0);

          return (
            <Accordion key={faculty} disableGutters elevation={0} sx={{
              mb: 2,
              borderRadius: '16px !important',
              border: '1px solid #e2e8f0',
              '&:before': { display: 'none' },
              overflow: 'hidden'
            }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#64748b' }} />} sx={{ bgcolor: '#f8fafc', px: 3, py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Icon sx={{ mr: 2, color: color }} />
                    <Typography variant="subtitle1" fontWeight="700" color="text.primary">{faculty}</Typography>
                  </Box>
                  <Chip label={totalUsers} size="small" sx={{ bgcolor: totalUsers > 0 ? alpha(color, 0.8) : '#e2e8f0', color: totalUsers > 0 ? 'white' : '#94a3b8', fontWeight: 'bold', height: 20, mr: 2 }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, bgcolor: 'white' }}>
                {branchKeys.length > 0 ? (
                  sortKeys(branchKeys, []).map(branch => (
                    <Box key={branch} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                        pb: 0.5,
                        borderBottom: '1px solid',
                        borderColor: alpha(color, 0.1)
                      }}>
                        <Typography variant="caption" fontWeight="800" sx={{ color: color, textTransform: 'uppercase', letterSpacing: 1 }}>
                          สาขา{branch}
                        </Typography>
                        <Chip
                          label={branches[branch].length}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            bgcolor: alpha(color, 0.05),
                            color: color,
                            fontWeight: 'bold',
                            borderRadius: 1
                          }}
                        />
                      </Box>
                      <List disablePadding>
                        {branches[branch].map(u => <UserListItem key={u.id} user={u} />)}
                      </List>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>ยังไม่มีข้อมูลในคณะนี้</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, bgcolor: 'white', mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={0} sx={{
        p: 4,
        mb: 4,
        borderRadius: 4,
        bgcolor: 'white',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#064460', 0.1) }}>
              <GroupIcon sx={{ fontSize: 32, color: '#064460' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: '800', color: '#1e293b' }}>จัดการข้อมูลผู้ใช้และโครงสร้างองค์กร</Typography>
          </Box>
        </Box>
        <Button
          component={NavLink}
          to="/adminfrom"
          variant="contained"
          startIcon={<PersonAddIcon />}
          sx={{
            borderRadius: '50px',
            textTransform: 'none',
            bgcolor: '#F9C824',
            px: 3,
            py: 1.2,
            boxShadow: '0 4px 14px rgba(249, 200, 36, 0.4)',
            '&:hover': { bgcolor: '#F9C824' }
          }}
        >
          เพิ่มผู้ใช้ใหม่
        </Button>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<GroupIcon />} title="ผู้ใช้ทั้งหมด" count={stats.total} color="#064460" delay={0.1} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<DomainIcon />} title="สำนักงาน" count={stats.office} color="#2ECC71" delay={0.2} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<AssignmentIndIcon />} title="ที่ปรึกษา" count={stats.advisor} color="#F9C824" delay={0.3} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<SchoolIcon />} title="นักศึกษา" count={stats.student} color="#E74C3C" delay={0.4} />
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={3} justifyContent="center">
        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{
            borderRadius: 4,
            bgcolor: 'white',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            minHeight: 600
          }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 'bold',
                        borderRadius: 2,
                        mr: 1,
                        minHeight: 44
                      },
                      '& .Mui-selected': {
                        bgcolor: alpha('#064460', 0.1),
                        color: '#064460'
                      },
                      '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: 3,
                        bgcolor: '#064460'
                      }
                    }}
                  >
                    <Tab icon={<DomainIcon fontSize="small" />} iconPosition="start" label="สำนักงาน" />
                    <Tab icon={<AssignmentIndIcon fontSize="small" />} iconPosition="start" label="ที่ปรึกษา" />
                    <Tab icon={<SchoolIcon fontSize="small" />} iconPosition="start" label="นักศึกษา" />
                  </Tabs>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <TextField
                    placeholder="พิมพ์เพื่อค้นหา..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />,
                    }}
                    sx={{
                      width: { xs: '100%', md: 300 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '50px',
                        bgcolor: '#f8fafc',
                        '& fieldset': { borderColor: '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#cbd5e1' },
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 3, bgcolor: '#fcfcfc', minHeight: 500 }}>
              {tabValue === 0 && renderOfficeSection()}
              {tabValue === 1 && renderAcademicSection('Advisor')}
              {tabValue === 2 && renderAcademicSection('Student')}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={!!editUser}
        onClose={() => setEditUser(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 4, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
        }}
      >
        <DialogTitle sx={{
          borderBottom: '1px solid #f1f5f9',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <Box sx={{ p: 1, borderRadius: '50%', bgcolor: '#eff6ff', color: '#3b82f6' }}>
            <EditIcon />
          </Box>
          <Typography variant="h6" fontWeight="bold">แก้ไขข้อมูลผู้ใช้</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 4 }}>
          {editUser && (
            <Stack spacing={2.5}>
              <TextField
                label="ชื่อ-นามสกุล"
                fullWidth
                value={editUser.name || ''}
                onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                variant="outlined"
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="อีเมล"
                fullWidth
                value={editUser.email || ''}
                onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                variant="outlined"
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <Divider sx={{ my: 1 }}><Chip label="ข้อมูลสังกัด" size="small" /></Divider>

              {editUser.role === 'Office' && (
                <TextField
                  select
                  label="หน่วยงาน"
                  fullWidth
                  value={editUser.deptName || ''}
                  onChange={e => setEditUser({ ...editUser, deptName: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                >
                  {officeDepts.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                  <MenuItem value="อื่นๆ">อื่นๆ</MenuItem>
                </TextField>
              )}
              {(editUser.role === 'Advisor' || editUser.role === 'Student') && (
                <>
                  <TextField
                    select
                    label="คณะ"
                    fullWidth
                    value={editUser.faculty || ''}
                    onChange={e => setEditUser({ ...editUser, faculty: e.target.value })}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 2 } }}
                  >
                    {facultyList.map(fac => (
                      <MenuItem key={fac} value={fac}>{fac}</MenuItem>
                    ))}
                    <MenuItem value="อื่นๆ">อื่นๆ</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="สาขา"
                    fullWidth
                    value={editUser.branch || ''}
                    onChange={e => setEditUser({ ...editUser, branch: e.target.value })}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 2 } }}
                    disabled={!editUser.faculty || editUser.faculty === 'อื่นๆ'}
                  >
                    {(facultyBranches[editUser.faculty] || []).map(branch => (
                      <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                    ))}
                    <MenuItem value="อื่นๆ">อื่นๆ</MenuItem>
                  </TextField>
                </>
              )}
              {editUser.role === 'Student' && (
                <TextField
                  label="ที่ปรึกษา (ระบุชื่อ หรือ ID)"
                  fullWidth
                  value={editUser.advisorName || editUser.advisorId || ''}
                  onChange={e => setEditUser({ ...editUser, advisorName: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Button onClick={() => setEditUser(null)} sx={{ color: '#64748b', borderRadius: 2 }}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disableElevation
            sx={{
              bgcolor: '#064460',
              color: 'white',
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#095a80' }
            }}
          >
            บันทึกการแก้ไข
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>บันทึกข้อมูลสำเร็จ</DialogTitle>
        <DialogContent>
          <Typography>{successDialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)} variant="contained" sx={{ bgcolor: '#F9C824', '&:hover': { bgcolor: '#F9C824' } }}>
            ตกลง
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Box sx={{
            mx: 'auto',
            width: 50,
            height: 50,
            borderRadius: '50%',
            bgcolor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            color: '#ef4444'
          }}>
            <DeleteIcon />
          </Box>
          <Typography variant="h6" fontWeight="bold">ยืนยันการลบ</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography textAlign="center" color="text.secondary">
            คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ <br />
            <Typography component="span" fontWeight="bold" color="text.primary">"{userToDelete?.name}"</Typography> ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, color: '#64748b', borderColor: '#cbd5e1' }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disableElevation
            sx={{ borderRadius: 2, bgcolor: '#ef4444' }}
          >
            ลบผู้ใช้
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
