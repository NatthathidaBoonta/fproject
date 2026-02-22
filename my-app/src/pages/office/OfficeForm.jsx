import React, { useState } from 'react';
import { Stack, TextField, MenuItem, Button } from '@mui/material';

function OfficeForm({ setUsers }) {
  const [data, setData] = useState({ email: '', password: '', name: '', deptName: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...data, role: 'Office', id: Date.now() };
    console.log("JSON Office:", JSON.stringify(payload));
    setUsers(prev => [...prev, payload]);
    alert("บันทึกเจ้าหน้าที่สำเร็จ");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField label="อีเมล" name="email" fullWidth onChange={(e) => setData({ ...data, email: e.target.value })} required />
        <TextField label="รหัสผ่าน" type="password" fullWidth onChange={(e) => setData({ ...data, password: e.target.value })} required />
        <TextField label="ชื่อเจ้าหน้าที่" fullWidth onChange={(e) => setData({ ...data, name: e.target.value })} required />
        <TextField select label="หน่วยงาน" fullWidth onChange={(e) => setData({ ...data, deptName: e.target.value })} required>
          <MenuItem value="ฝ่ายทะเบียน">เจ้าหน้าที่ฝ่ายทะเบียน</MenuItem>
          <MenuItem value="ฝ่ายศูนย์ภาษา">เจ้าหน้าที่ฝ่ายศูนย์ภาษา</MenuItem>
          <MenuItem value="ฝ่ายกิจกรรม">เจ้าหน้าที่ฝ่ายกิจกรรม</MenuItem>
          <MenuItem value="ฝ่ายวิทยบริการและเทคโนโลยี">เจ้าหน้าที่ฝ่ายวิทยบริการและเทคโนโลยี</MenuItem>
        </TextField>
        <Button type="submit" variant="contained" size="large" sx={{ py: 1.5, fontWeight: 'bold', bgcolor: '#F9C824', '&:hover': { bgcolor: '#F9C824' } }}>บันทึกข้อมูลสำนักงาน</Button>
      </Stack>
    </form>
  );
}
export default OfficeForm;
