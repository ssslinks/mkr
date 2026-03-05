import { useState } from 'react';
import { Box, Typography, Button, MenuItem, TextField, Paper } from '@mui/material';

export default function Login({ onLogin, users }) {
  const [userId, setUserId] = useState('');
  return (
    <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper sx={{ p: 5, width: 400, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>🚀 Вхід</Typography>
        <TextField select label="Профіль" value={userId} onChange={(e) => setUserId(e.target.value)} fullWidth sx={{ mb: 3 }}>
          {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>)}
        </TextField>
        <Button variant="contained" fullWidth onClick={() => onLogin(users.find(u => u.id === userId))} disabled={!userId}>Увійти</Button>
      </Paper>
    </Box>
  );
}