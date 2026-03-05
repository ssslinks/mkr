import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

export default function AuditLog({ logs }) {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" color="secondary" gutterBottom sx={{ letterSpacing: 2, textTransform: 'uppercase' }}>
        &gt; SYS_AUDIT_LOG
      </Typography>
      <Typography variant="body2" color="primary" sx={{ mb: 3 }}>
        [ ЗАПИСИ БЕЗПЕКИ ТА КРИТИЧНИХ ЗМІН СИСТЕМИ ]
      </Typography>

      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 0 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ borderBottom: 2, borderColor: 'success.main' }}>
              <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>&gt; TIMESTAMP</TableCell>
              <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>&gt; USER_ID</TableCell>
              <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>&gt; ACTION_EXECUTED</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: 'success.main', opacity: 0.5, py: 5 }}>[ NO_RECORDS_FOUND ]</TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow 
                  key={log.id} 
                  component={motion.tr}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  sx={{ '&:hover': { bgcolor: 'action.hover' }, borderBottom: 1, borderColor: 'divider' }}
                >
                  <TableCell sx={{ color: 'text.primary' }}>[{log.time}]</TableCell>
                  <TableCell sx={{ color: 'primary.main' }}>{log.user}</TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>
                    {log.action.includes('CRITICAL') || log.action.includes('PURGED') 
                      ? <span style={{ color: theme.palette.error.main, fontWeight: 'bold' }}>{log.action}</span>
                      : log.action
                    }
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}