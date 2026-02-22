import React, { useState } from 'react';
import { Stack, TextField, MenuItem, Button } from '@mui/material';

function StudentForm({ setUsers, advisors }) {
  const [data, setData] = useState({ email: '', password: '', name: '', branch: '', faculty: '', advisorId: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...data, role: 'Student', id: Date.now() };
    console.log("JSON Student:", JSON.stringify(payload));
    setUsers(prev => [...prev, payload]);
    alert("บันทึกนักศึกษาสีำเร็จ");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField label="อีเมล" fullWidth onChange={(e) => setData({ ...data, email: e.target.value })} required />
        <TextField label="รหัสผ่าน" type="password" fullWidth onChange={(e) => setData({ ...data, password: e.target.value })} required />
        <TextField label="ชื่อนักศึกษา" fullWidth onChange={(e) => setData({ ...data, name: e.target.value })} required />
        <TextField label="สาขา" fullWidth onChange={(e) => setData({ ...data, branch: e.target.value })} />
        <TextField label="คณะ" fullWidth onChange={(e) => setData({ ...data, faculty: e.target.value })} />

        <TextField select label="เลือกอาจารย์ที่ปรึกษา" fullWidth value={data.advisorId} onChange={(e) => setData({ ...data, advisorId: e.target.value })} required>
          {advisors.length > 0 ? (
            advisors.map(adv => (
              <MenuItem key={adv.id} value={adv.name}>{adv.name} ({adv.branch})</MenuItem>
            ))
          ) : (
            <MenuItem disabled>ยังไม่มีรายชื่อที่ปรึกษาในระบบ</MenuItem>
          )}
        </TextField>

        <Button type="submit" variant="contained" size="large" sx={{ py: 1.5, fontWeight: 'bold', bgcolor: '#F9C824', '&:hover': { bgcolor: '#F9C824' } }}>บันทึกข้อมูลนักศึกษา</Button>
      </Stack>
    </form>
  );
}
export default StudentForm;