import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, MenuItem, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Import ฟอร์มย่อย
import OfficeForm from '../office/OfficeForm';
import AdvisorForm from './AdvisorForm';
import StudentForm from './StudentForm';

export default function AdminPage({ users, setUsers, advisors }) {
  const [currentRole, setCurrentRole] = useState('Office');
  const location = useLocation();

  // --- State ใหม่สำหรับเก็บข้อมูลที่กำลังแก้ไข ---
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (location.state?.userToEdit) {
      const user = location.state.userToEdit;
      setEditData(user);
      setCurrentRole(user.role);
      // Clear state so refresh doesn't keep it? Or keep it.
      // window.history.replaceState({}, document.title); // Optional
    }
  }, [location.state]);



  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', py: 6 }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>

        {/* Form Section */}
        <Paper elevation={0} sx={{ p: 4, mb: 6, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color={editData ? "#F9C824" : "#F9C824"} gutterBottom>
              {editData ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editData ? `กำลังแก้ไข: ${editData.name}` : "กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่ในระบบ"}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 3, border: '1px solid #f1f5f9' }}>
            <TextField
              select
              fullWidth
              label="เลือกบทบาท"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              disabled={!!editData}
              sx={{ mb: 3 }}
              variant="outlined"
              size="medium"
            >
              <MenuItem value="Office">สำนักงาน (Office)</MenuItem>
              <MenuItem value="Advisor">อาจารย์ที่ปรึกษา (Advisor)</MenuItem>
              <MenuItem value="Student">นักศึกษา (Student)</MenuItem>
            </TextField>

            <Divider sx={{ mb: 4, borderColor: '#f1f5f9' }} />

            {/* Forms */}
            {currentRole === 'Office' && (
              <OfficeForm setUsers={setUsers} users={users} editData={editData} setEditData={setEditData} />
            )}
            {currentRole === 'Advisor' && (
              <AdvisorForm setUsers={setUsers} users={users} editData={editData} setEditData={setEditData} />
            )}
            {currentRole === 'Student' && (
              <StudentForm setUsers={setUsers} users={users} advisors={advisors} editData={editData} setEditData={setEditData} />
            )}

            {editData && (
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => { setEditData(null); }}
                sx={{ mt: 3, borderRadius: 2 }}
              >
                ยกเลิกการแก้ไข
              </Button>
            )}
          </Box>
        </Paper>

      </Box>
    </Box>
  );
}