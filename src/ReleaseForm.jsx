import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, MenuItem, 
  FormGroup, FormControlLabel, Checkbox, Paper, Divider, Chip, 
  FormControl, InputLabel, Select, FormHelperText, useTheme
} from '@mui/material';
import { motion } from 'framer-motion';

export default function ReleaseForm({ onAddRelease, authorizedPersonnel = [], currentUser }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('');
  const [rollbackPlan, setRollbackPlan] = useState('');
  const [errors, setErrors] = useState({});
  const [approvers, setApprovers] = useState([]); 
  const [approverToAdd, setApproverToAdd] = useState(''); 
  const [checklist, setChecklist] = useState([{ id: 1, task: 'Ініціювати бекап бази даних', done: false }]);
  const [newTask, setNewTask] = useState('');

  const availableApprovers = authorizedPersonnel.filter(
    p => p.id !== currentUser?.id && !approvers.find(a => a.id === p.id)
  );

  const handleAddApprover = () => {
    const user = authorizedPersonnel.find(u => u.id === approverToAdd);
    if (user) {
      setApprovers([...approvers, { ...user, approved: false }]);
      setApproverToAdd('');
      setErrors({ ...errors, approvers: null });
    }
  };

  const handleRemoveApprover = (id) => setApprovers(approvers.filter(a => a.id !== id));

  const handleAddTask = () => {
    if (newTask.trim()) {
      setChecklist([...checklist, { id: Date.now(), task: newTask, done: false }]);
      setNewTask('');
      setErrors({ ...errors, checklist: null });
    }
  };

  const handleDeleteTask = (id) => setChecklist(checklist.filter(c => c.id !== id));
  const toggleChecklist = (id) => setChecklist(checklist.map(c => c.id === id ? { ...c, done: !c.done } : c));

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "[ERR] Назва релізу відсутня";
    if (!environment) newErrors.environment = "[ERR] Локація не визначена";
    if (approvers.length === 0) newErrors.approvers = "[ERR] Потрібен хоча б один наглядач";
    if (checklist.length === 0) newErrors.checklist = "[ERR] Чекліст порожній";
    if (!rollbackPlan.trim()) newErrors.rollbackPlan = "[ERR] План втечі (Rollback) обов'язковий.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const newRelease = {
      id: Date.now(), name, environment, team: currentUser?.role || 'SYNDICATE',
      status: 'draft', date: new Date().toISOString().split('T')[0],
      approvers, checklist, rollbackPlan
    };
    if (onAddRelease) onAddRelease(newRelease);
    navigate('/');
  };

  const inputProps = {
    sx: { 
      fieldset: { borderRadius: 0, borderColor: 'divider' },
      '&:hover fieldset': { borderColor: 'primary.main !important' },
      '& .Mui-focused fieldset': { borderColor: 'primary.main !important', boxShadow: isDark ? `0 0 10px ${theme.palette.primary.main}40` : 'none' }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" color="secondary" gutterBottom sx={{ letterSpacing: 2, textTransform: 'uppercase' }}>
          &gt; INIT_NEW_RELEASE
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mb: 4, opacity: 0.8 }}>
          // ЗАПОВНІТЬ ДАНІ. УВАЖНО ПЕРЕВІРТЕ КОЖЕН ПУНКТ.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          <Typography variant="h6" color="text.primary" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            [1] IDENTIFICATION_DATA
          </Typography>
          <TextField label="> RELEASE_NAME *" value={name} onChange={(e) => { setName(e.target.value); setErrors({...errors, name: null}); }} error={!!errors.name} helperText={errors.name} fullWidth {...inputProps} />
          
          <FormControl fullWidth error={!!errors.environment} sx={inputProps.sx}>
            <InputLabel>> TARGET_ENVIRONMENT *</InputLabel>
            <Select value={environment} label="> TARGET_ENVIRONMENT *" onChange={(e) => { setEnvironment(e.target.value); setErrors({...errors, environment: null}); }} sx={{ borderRadius: 0 }}>
              <MenuItem value="Staging">STAGING_AREA</MenuItem>
              <MenuItem value="Production">PRODUCTION_CORE</MenuItem>
            </Select>
            {errors.environment && <FormHelperText sx={{ color: 'error.main' }}>{errors.environment}</FormHelperText>}
          </FormControl>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="text.primary" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
            [2] WARDEN_APPROVAL_FLOW
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <FormControl fullWidth error={!!errors.approvers} sx={inputProps.sx}>
              <InputLabel>> SELECT_OVERSEER</InputLabel>
              <Select value={approverToAdd} label="> SELECT_OVERSEER" onChange={(e) => setApproverToAdd(e.target.value)} sx={{ borderRadius: 0 }}>
                {availableApprovers.map(p => <MenuItem key={p.id} value={p.id}>{p.name} ({p.role})</MenuItem>)}
              </Select>
              {errors.approvers && <FormHelperText sx={{ color: 'error.main' }}>{errors.approvers}</FormHelperText>}
            </FormControl>
            <Button variant="outlined" color="primary" onClick={handleAddApprover} disabled={!approverToAdd} sx={{ height: 56, borderWidth: 2 }}>
              ADD_AUTHORITY
            </Button>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {approvers.map(a => (
              <Chip key={a.id} label={`${a.name} [${a.role}]`} onDelete={() => handleRemoveApprover(a.id)} sx={{ borderRadius: 0, borderWidth: 1, borderStyle: 'solid', borderColor: 'primary.main', bgcolor: 'transparent', color: 'primary.main' }} />
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="text.primary" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
            [3] LOCKDOWN_CHECKLIST
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField size="small" fullWidth label="> NEW_DIRECTIVE" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddTask()} error={!!errors.checklist} helperText={errors.checklist} {...inputProps} />
            <Button variant="outlined" color="secondary" onClick={handleAddTask} sx={{ borderWidth: 2 }}>APPEND</Button>
          </Box>
          <FormGroup sx={{ border: 1, borderStyle: 'dashed', borderColor: 'divider', p: 2 }}>
            {checklist.map(c => (
              <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 1 }}>
                <FormControlLabel control={<Checkbox checked={c.done} onChange={() => toggleChecklist(c.id)} color="success" />} label={<Typography sx={{ color: c.done ? 'success.main' : 'primary.main', textDecoration: c.done ? 'line-through' : 'none' }}>{c.task}</Typography>} />
                <Button size="small" color="error" onClick={() => handleDeleteTask(c.id)} sx={{ minWidth: 'auto' }}>[X]</Button>
              </Box>
            ))}
          </FormGroup>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="error.main" sx={{ borderBottom: 1, borderColor: 'error.main', pb: 1, mb: 2 }}>
            [4] ESCAPE_ROUTE (ROLLBACK) *
          </Typography>
          <TextField 
            label="> INJECT_ROLLBACK_STRATEGY" multiline rows={3} value={rollbackPlan} onChange={(e) => { setRollbackPlan(e.target.value); setErrors({...errors, rollbackPlan: null}); }} error={!!errors.rollbackPlan} helperText={errors.rollbackPlan || "// План дій при збої"} fullWidth 
            sx={{
              fieldset: { borderRadius: 0, borderColor: 'error.main' },
              '&:hover fieldset': { borderColor: 'error.dark !important' },
              '& .Mui-focused fieldset': { borderColor: 'error.main !important', boxShadow: isDark ? `0 0 10px ${theme.palette.error.main}40` : 'none' },
              input: { color: 'error.main' }, textarea: { color: 'error.main' }, label: { color: 'error.main' }
            }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => navigate('/')}>ABORT_MISSION</Button>
          <Button variant="contained" color="primary" size="large" onClick={handleSave}>GENERATE_DRAFT</Button>
        </Box>
      </Paper>
    </motion.div>
  );
}