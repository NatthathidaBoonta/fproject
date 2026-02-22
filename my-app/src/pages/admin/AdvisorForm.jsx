import React, { useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';

function AdvisorForm({ setUsers }) {
  const [data, setData] = useState({ email: '', password: '', name: '', branch: '', faculty: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...data, role: 'Advisor', id: Date.now() };
    console.log("JSON Advisor:", JSON.stringify(payload));
    setUsers(prev => [...prev, payload]);
    alert("บันทึกที่ปรึกษาสำเร็จ");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField label="อีเมล" fullWidth onChange={(e) => setData({ ...data, email: e.target.value })} required />
        <TextField label="รหัสผ่าน" type="password" fullWidth onChange={(e) => setData({ ...data, password: e.target.value })} required />
        <TextField label="ชื่ออาจารย์" fullWidth onChange={(e) => setData({ ...data, name: e.target.value })} required />
        <TextField label="สาขา" fullWidth onChange={(e) => setData({ ...data, branch: e.target.value })} />
        <TextField label="คณะ" fullWidth onChange={(e) => setData({ ...data, faculty: e.target.value })} />
        <Button type="submit" variant="contained" size="large" sx={{ py: 1.5, fontWeight: 'bold', bgcolor: '#F9C824', '&:hover': { bgcolor: '#F9C824' } }}>บันทึกข้อมูลที่ปรึกษา</Button>
      </Stack>
    </form>
  );
}
export default AdvisorForm;