import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { motion } from 'framer-motion';

export default function TeamSettings({ team, currentUser }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" color="secondary" gutterBottom sx={{ letterSpacing: 2 }}>
        &gt; USERS_SYS_CONFIG
      </Typography>
      <Typography variant="body2" color="primary" sx={{ mb: 3 }}>
        [ КЕРУВАННЯ ДОСТУПОМ ДО MAINFRAME ]
      </Typography>

      <Paper sx={{ p: 3, mb: 4, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'background.paper', borderRadius: 0 }}>
        <TextField 
          label="> ALIAS (Ім'я)" size="small" value={name} onChange={e => setName(e.target.value)} 
          sx={{ flexGrow: 1, fieldset: { borderRadius: 0 } }} 
        />
        <TextField 
          label="> CLEARANCE_LEVEL (Посада)" size="small" value={role} onChange={e => setRole(e.target.value)} 
          sx={{ flexGrow: 1, fieldset: { borderRadius: 0 } }} 
        />
        <Button variant="contained" color="primary" disabled sx={{ height: 40 }}>
          REGISTER_NODE // WIP
        </Button>
      </Paper>

      <Paper sx={{ bgcolor: 'background.paper', borderRadius: 0 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ borderBottom: 2, borderColor: 'primary.main' }}>
              <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>&gt; ALIAS</TableCell>
              <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>&gt; CLEARANCE</TableCell>
              <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 'bold' }}>&gt; ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {team.map(m => (
              <TableRow key={m.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ color: m.id === currentUser.id ? 'success.main' : 'text.primary', fontWeight: m.id === currentUser.id ? 'bold' : 'normal' }}>
                  {m.name} {m.id === currentUser.id && '[YOU]'}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{m.role}</TableCell>
                <TableCell align="right">
                  <Button color="error" variant="outlined" disabled={m.id === currentUser.id} sx={{ borderRadius: 0 }}>
                    REVOKE_ACCESS
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </motion.div>
  );
}