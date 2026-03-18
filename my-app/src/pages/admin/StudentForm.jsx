import React, { useState, useEffect } from 'react';
import { Stack, TextField, MenuItem, Button } from '@mui/material';
import { facultyList, facultyBranches } from '../../data/masterData';
import { createUser, updateUser } from '../../services/api';
import FormMessageDialog from '../../components/FormMessageDialog';

function StudentForm({ onRefresh, advisors, editData, setEditData, onSaved }) {
  const [data, setData] = useState({
    id: '',
    email: '',
    password: '',
    name: '',
    branch: '',
    faculty: '',
    advisorId: ''
  });
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editData) {
      setData({
        id: editData.id || '',
        email: editData.email || '',
        password: '',
        name: editData.name || '',
        branch: editData.branch || '',
        faculty: editData.faculty || '',
        advisorId: editData.advisorId || ''
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...data, role: 'Student' };
      if (editData) {
        await updateUser(editData.id, payload);
        const successMessage = "แก้ไขข้อมูลนักศึกษาสำเร็จ";
        setEditData(null);
        if (onSaved) onSaved(successMessage);
      } else {
        await createUser(payload);
        const successMessage = "บันทึกนักศึกษาสำเร็จ";
        if (onSaved) onSaved(successMessage);
      }
      setData({ id: '', email: '', password: '', name: '', branch: '', faculty: '', advisorId: '' });
      if (onRefresh) onRefresh();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด');
      setErrorDialogOpen(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          label="รหัสนักศึกษา"
          fullWidth
          value={data.id}
          onChange={(e) => setData({ ...data, id: e.target.value })}
          required
          disabled={!!editData}
        />
        <TextField
          label="อีเมล"
          fullWidth
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          required
        />
        <TextField
          label="รหัสผ่าน"
          type="password"
          fullWidth
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          required={!editData}
        />
        <TextField
          label="ชื่อนักศึกษา"
          fullWidth
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
        />

        <TextField
          select
          label="คณะ"
          fullWidth
          value={data.faculty}
          onChange={(e) => setData({ ...data, faculty: e.target.value, branch: '' })}
          required
        >
          {facultyList.map(fac => (
            <MenuItem key={fac} value={fac}>{fac}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="สาขา"
          fullWidth
          value={data.branch}
          onChange={(e) => setData({ ...data, branch: e.target.value })}
          required
          disabled={!data.faculty}
        >
          {(facultyBranches[data.faculty] || []).map(branch => (
            <MenuItem key={branch} value={branch}>{branch}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="เลือกอาจารย์ที่ปรึกษา"
          fullWidth
          value={data.advisorId}
          onChange={(e) => setData({ ...data, advisorId: e.target.value })}
          required
        >
          {advisors.length > 0 ? (
            advisors.map(adv => (
              <MenuItem key={adv.id} value={adv.id}>{adv.name} ({adv.branch})</MenuItem>
            ))
          ) : (
            <MenuItem disabled>ยังไม่มีรายชื่อที่ปรึกษาในระบบ</MenuItem>
          )}
        </TextField>

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ py: 1.5, fontWeight: 'bold', bgcolor: '#F9C824', '&:hover': { bgcolor: '#F9C824' } }}
        >
          {editData ? "บันทึกการแก้ไข" : "บันทึกข้อมูลนักศึกษา"}
        </Button>
      </Stack>
      <FormMessageDialog
        open={errorDialogOpen}
        title="ไม่สามารถบันทึกข้อมูลได้"
        message={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />
    </form>
  );
}
export default StudentForm;
