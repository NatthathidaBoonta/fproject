import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function FormMessageDialog({ open, title, message, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#F9C824', '&:hover': { bgcolor: '#F9C824' } }}>
          ตกลง
        </Button>
      </DialogActions>
    </Dialog>
  );
}
