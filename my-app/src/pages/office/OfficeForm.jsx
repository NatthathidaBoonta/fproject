import React, { useState, useEffect } from 'react';
import { Stack, TextField, MenuItem, Button } from '@mui/material';
import { officeDepts } from '../../data/masterData';
import { createUser, updateUser } from '../../services/api';
import FormMessageDialog from '../../components/FormMessageDialog';

function OfficeForm({ onRefresh, editData, setEditData, onSaved }) {
  const [data, setData] = useState({
    id: '',
    email: '',
    password: '',
    name: '',
    deptName: ''
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
        deptName: editData.deptName || ''
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...data, role: 'Office' };
      if (editData) {
        await updateUser(editData.id, payload);
        const successMessage = "แก้ไขข้อมูลเจ้าหน้าที่สำเร็จ";
        setEditData(null);
        if (onSaved) onSaved(successMessage);
      } else {
        await createUser(payload);
        const successMessage = "บันทึกเจ้าหน้าที่สำเร็จ";
        if (onSaved) onSaved(successMessage);
      }
      setData({ id: '', email: '', password: '', name: '', deptName: '' });
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
          label="รหัสเจ้าหน้าที่"
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
          label="ชื่อเจ้าหน้าที่"
          fullWidth
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
        />
        <TextField
          select
          label="หน่วยงาน"
          fullWidth
          value={data.deptName}
          onChange={(e) => setData({ ...data, deptName: e.target.value })}
          required
        >
          {officeDepts.map(dept => (
            <MenuItem key={dept} value={dept}>{dept}</MenuItem>
          ))}
        </TextField>
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ py: 1.5, fontWeight: 'bold', bgcolor: '#F9C824', '&:hover': { bgcolor: '#F9C824' } }}
        >
          {editData ? "บันทึกการแก้ไข" : "บันทึกข้อมูลสำนักงาน"}
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
export default OfficeForm;
