import { useState } from 'react';
import { Box, Typography, Chip, MenuItem, Select, Paper, Button, TextField, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { motion } from 'framer-motion';

const statusConfig = {
  draft: { color: 'default', label: '[DRAFT]' },
  review: { color: 'warning', label: '[REVIEW]' },
  approved: { color: 'primary', label: '[APPROVED]' },
  deployed: { color: 'success', label: '[DEPLOYED]' },
  'rolled back': { color: 'error', label: '[ROLLED BACK]' }
};

export default function Dashboard({ releases, onStatusChange, onDelete, onRollback }) {
  const [searchText, setSearchText] = useState('');
  const [envFilter, setEnvFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest'); // НОВИЙ СТАН ДЛЯ СОРТУВАННЯ
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmRollback, setConfirmRollback] = useState({ open: false, id: null });

  // ФІЛЬТРАЦІЯ ТА СОРТУВАННЯ В ОДНОМУ ПОТОЦІ
  const processedRows = releases
    .filter((r) => {
      const matchName = r.name.toLowerCase().includes(searchText.toLowerCase());
      const matchEnv = envFilter === 'All' || r.environment === envFilter;
      return matchName && matchEnv;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') return b.id - a.id; // Свіжіші зверху (за timestamp)
      if (sortBy === 'Oldest') return a.id - b.id; // Старіші зверху
      if (sortBy === 'Team') return (a.team || '').localeCompare(b.team || ''); // За алфавітом команд
      return 0;
    });

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

  return (
    <Box>
      <Typography variant="h4" color="primary" gutterBottom sx={{ letterSpacing: 2 }}>
        &gt; SYS_DASHBOARD
      </Typography>

      <Paper sx={{ display: 'flex', gap: 2, mb: 4, p: 2, flexWrap: 'wrap', border: 1, borderColor: 'primary.main', bgcolor: 'background.paper' }}>
        <TextField 
          label="> SEARCH_QUERY" 
          variant="outlined"
          size="small" 
          value={searchText} 
          onChange={(e) => setSearchText(e.target.value)} 
          sx={{ flexGrow: 1, minWidth: 200 }} 
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>&gt; ENVIRONMENT</InputLabel>
          <Select value={envFilter} label="> ENVIRONMENT" onChange={(e) => setEnvFilter(e.target.value)}>
            <MenuItem value="All">ALL_SECTORS</MenuItem>
            <MenuItem value="Staging">STAGING_AREA</MenuItem>
            <MenuItem value="Production">PRODUCTION_CORE</MenuItem>
          </Select>
        </FormControl>
        
        {/* НОВИЙ КОНТРОЛЕР ДЛЯ СОРТУВАННЯ */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>&gt; SORT_BY</InputLabel>
          <Select value={sortBy} label="> SORT_BY" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="Newest">TIME_DESC [Нові]</MenuItem>
            <MenuItem value="Oldest">TIME_ASC [Старі]</MenuItem>
            <MenuItem value="Team">TEAM_ALIAS [Команда]</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <motion.div variants={containerVariants} initial="hidden" animate="show">
        {processedRows.map((release) => (
          <motion.div key={release.id} variants={itemVariants}>
            <Paper 
              sx={{ 
                p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                borderLeft: 4, borderColor: release.environment === 'Production' ? 'error.main' : 'primary.main',
                transition: '0.3s', '&:hover': { boxShadow: 3 }
              }}
            >
              <Box sx={{ pl: 1 }}>
                <Typography variant="h6" color="text.primary" sx={{ textTransform: 'uppercase' }}>{release.name}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary">TIME: {release.date}</Typography>
                  {/* ДОДАНО ВІДОБРАЖЕННЯ КОМАНДИ НА КАРТЦІ */}
                  <Typography variant="caption" color="text.secondary">TEAM: {release.team}</Typography>
                  <Typography variant="caption" color={release.environment === 'Production' ? 'error.main' : 'primary.main'}>
                    ENV: {release.environment}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label={statusConfig[release.status].label} color={statusConfig[release.status].color} variant="outlined" sx={{ fontWeight: 'bold', borderRadius: 0, borderWidth: 2 }} />
                
                <Select
                  size="small"
                  value={release.status}
                  onChange={(e) => onStatusChange(release.id, e.target.value)}
                  sx={{ width: 140, borderRadius: 0 }}
                >
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>{config.label}</MenuItem>
                  ))}
                </Select>

                <Button color="error" variant="outlined" onClick={() => setConfirmDelete({ open: true, id: release.id })}>
                  PURGE
                </Button>
                <Button color="warning" variant="outlined" onClick={() => setConfirmRollback({ open: true, id: release.id })}>
                  ROLLBACK
                </Button>
              </Box>
            </Paper>
          </motion.div>
        ))}
      </motion.div>

      {/* Модальні вікна */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} PaperProps={{ sx: { bgcolor: 'background.paper', border: 1, borderColor: 'error.main', borderRadius: 0 } }}>
        <DialogTitle color="error.main">&gt; INITIATE_PURGE_PROTOCOL?</DialogTitle>
        <DialogContent>
          <DialogContentText color="text.primary">Попередження: Видалення даних є незворотнім. Видалити реліз назавжди?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, id: null })} color="primary">CANCEL</Button>
          <Button color="error" variant="contained" onClick={() => { onDelete(confirmDelete.id); setConfirmDelete({ open: false, id: null }); }}>CONFIRM_PURGE</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmRollback.open} onClose={() => setConfirmRollback({ open: false, id: null })} PaperProps={{ sx: { bgcolor: 'background.paper', border: 2, borderStyle: 'dashed', borderColor: 'warning.main', borderRadius: 0 } }}>
        <DialogTitle color="warning.main">&gt; CRITICAL: SYSTEM_ROLLBACK</DialogTitle>
        <DialogContent>
          <DialogContentText color="text.primary">Ви ініціюєте екстрений відкат системи. Ця дія відхилить поточний код із серверів.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRollback({ open: false, id: null })} color="primary">ABORT</Button>
          <Button color="warning" variant="contained" onClick={() => { onRollback(confirmRollback.id); setConfirmRollback({ open: false, id: null }); }} sx={{ color: '#000' }}>
            EXECUTE_ROLLBACK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}