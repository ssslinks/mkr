import { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ThemeProvider, createTheme, CssBaseline, Box, Drawer, 
  List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, GlobalStyles, Switch
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

import Dashboard from './Dashboard';
import ReleaseForm from './ReleaseForm';
import AuditLog from './AuditLog';
import TeamSettings from './TeamSettings';
import mockData from './mockData.json';

const drawerWidth = 260;

const DEFAULT_TEAM = [
  { id: 'u1', name: 'Олександр', role: 'DevOps Lead' },
  { id: 'u2', name: 'Марія', role: 'QA Senior' },
  { id: 'u3', name: 'Іван', role: 'Security Manager' }
];

// Палітра для Темної теми (Black Hat)
const darkPalette = {
  mode: 'dark',
  background: { default: '#050505', paper: '#0a0a12' },
  primary: { main: '#00f3ff' },   // Неоновий блакитний
  secondary: { main: '#ff00ff' }, // Неоновий рожевий
  success: { main: '#39ff14' },   // Матричний зелений
  error: { main: '#ff003c' },     // Критичний червоний
  warning: { main: '#fdf500' },   // Кібер-жовтий
  divider: 'rgba(0, 243, 255, 0.2)'
};

// Палітра для Світлої теми (White Hat / Corp)
const lightPalette = {
  mode: 'light',
  background: { default: '#f1f5f9', paper: '#ffffff' },
  primary: { main: '#0284c7' },   // Строгий синій
  secondary: { main: '#9333ea' }, // Строгий фіолетовий
  success: { main: '#16a34a' },   // Класичний зелений
  error: { main: '#dc2626' },     // Червоний
  warning: { main: '#d97706' },   // Помаранчевий
  divider: '#cbd5e1'
};

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const [team, setTeam] = useState(DEFAULT_TEAM);
  const [currentUser, setCurrentUser] = useState(DEFAULT_TEAM[0]);
  const [releases, setReleases] = useState([]);
  const [logs, setLogs] = useState([]);

  // Динамічна генерація теми
  const theme = useMemo(() => createTheme({
    palette: darkMode ? darkPalette : lightPalette,
    typography: { 
      fontFamily: '"Courier New", "Share Tech Mono", monospace',
      h4: { textShadow: darkMode ? '0 0 10px rgba(0, 243, 255, 0.5)' : 'none' },
      h5: { textShadow: darkMode ? '0 0 10px rgba(255, 0, 255, 0.5)' : 'none' }
    },
    shape: { borderRadius: 0 }, // Залишаємо гострі кути для обох тем
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            border: `1px solid ${darkMode ? 'rgba(0, 243, 255, 0.3)' : '#cbd5e1'}`,
            boxShadow: darkMode ? '0 0 10px rgba(0, 243, 255, 0.05) inset' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            backgroundImage: darkMode 
              ? 'linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)' 
              : 'none',
            backgroundSize: '20px 20px',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase',
            boxShadow: darkMode ? '0 0 5px currentColor' : 'none',
            '&:hover': {
              boxShadow: darkMode ? '0 0 15px currentColor' : 'none',
              backgroundColor: 'currentColor',
              color: darkMode ? '#000' : '#fff'
            }
          }
        }
      }
    }
  }), [darkMode]);

  useEffect(() => {
    setTimeout(() => {
      const savedReleases = localStorage.getItem('releasesData');
      setReleases(savedReleases ? JSON.parse(savedReleases) : mockData.releases);
      const savedLogs = localStorage.getItem('auditLogs');
      setLogs(savedLogs ? JSON.parse(savedLogs) : []);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => { if (!loading) localStorage.setItem('releasesData', JSON.stringify(releases)); }, [releases, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('auditLogs', JSON.stringify(logs)); }, [logs, loading]);
  useEffect(() => { localStorage.setItem('theme', darkMode ? 'dark' : 'light'); }, [darkMode]);

  const handleAddLog = (action) => setLogs(prev => [{ id: Date.now(), time: new Date().toLocaleString(), user: currentUser.name, action }, ...prev]);

  // --- УНІВЕРСАЛЬНА ФУНКЦІЯ ДЛЯ СИСТЕМНИХ СПОВІЩЕНЬ ---
  const showNotification = (title, body) => {
    if (window.Notification && window.Notification.permission === "granted") {
      new window.Notification(title, { body });
    } else if (window.Notification && window.Notification.permission !== "denied") {
      window.Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new window.Notification(title, { body });
        }
      });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const releaseName = releases.find(r => r.id === id)?.name || "Невідомо";
    setReleases(releases.map(r => r.id === id ? { ...r, status: newStatus } : r));
    handleAddLog(`Змінено статус релізу "${releaseName}" на [${newStatus.toUpperCase()}]`);
    
    if (newStatus === 'deployed') {
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000);
      showNotification('SYSTEM_OVERRIDE', `✅ Директиву [${releaseName}] успішно інжектовано в Mainframe.`);
    } else {
      showNotification('STATUS_UPDATE', `🔄 Статус [${releaseName}] змінено на ${newStatus.toUpperCase()}`);
    }
  };

  const handleDeleteRelease = (id) => {
    const releaseName = releases.find(r => r.id === id)?.name || "Невідомо";
    handleAddLog(`[DATA PURGED]: Видалено реліз "${releaseName}"`);
    setReleases(releases.filter(r => r.id !== id));
    
    showNotification('DATA_PURGED', `🗑️ Реліз [${releaseName}] знищено без можливості відновлення.`);
  };

  const handleRollback = (id) => {
    const releaseName = releases.find(r => r.id === id)?.name || "Невідомо";
    setReleases(releases.map(r => r.id === id ? { ...r, status: 'rolled back' } : r));
    handleAddLog(`[CRITICAL WARNING]: Ініційовано відкат релізу "${releaseName}"`);
    
    showNotification('CRITICAL_WARNING', `🚨 Аварійний план активовано! Відкат релізу [${releaseName}].`);
  };

  const handleAddRelease = (newRelease) => {
    setReleases([newRelease, ...releases]);
    handleAddLog(`[NEW ENTRY]: Створено реліз "${newRelease.name}"`);
  };

  if (loading) return (
    <ThemeProvider theme={theme}><CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 }}>
        <CircularProgress color="primary" />
        <Typography variant="h5" color="primary" sx={{ letterSpacing: 5 }}>[ CONNECTING TO MAINFRAME... ]</Typography>
      </Box>
    </ThemeProvider>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ '*::-webkit-scrollbar': { width: '6px' }, '*::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: '0px' } }} />
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} colors={[theme.palette.primary.main, theme.palette.secondary.main]} />}
      
      <HashRouter>
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          
          <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' } }}>
            <Box sx={{ p: 3, textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Typography variant="h5" color="secondary" fontWeight="900">NEURO_RELEASE //</Typography>
              </motion.div>
            </Box>
            <List sx={{ px: 2, pt: 2 }}>
              <NavItem to="/" icon="[D]" text="DASHBOARD" />
              <NavItem to="/new" icon="[+]" text="NEW_RELEASE" />
              <NavItem to="/audit" icon="[A]" text="AUDIT_LOG" />
              <NavItem to="/team" icon="[U]" text="USERS_SYS" />
            </List>
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Перемикач теми */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>DAY</Typography>
              <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} color="primary" />
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>NIGHT</Typography>
            </Box>
            <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="primary">SYS.ADMIN: {currentUser.name}</Typography>
            </Box>
          </Drawer>

          <Box component="main" sx={{ flexGrow: 1, p: 4, overflow: 'auto', bgcolor: 'background.default' }}>
            <AnimatedRoutes 
              releases={releases} 
              logs={logs} 
              team={team} 
              authorizedPersonnel={team}
              setTeam={setTeam}
              currentUser={currentUser} 
              onStatusChange={handleStatusChange} 
              onDelete={handleDeleteRelease} 
              onRollback={handleRollback} 
              onAddRelease={handleAddRelease} 
            />
          </Box>
        </Box>
      </HashRouter>
    </ThemeProvider>
  );
}

function NavItem({ to, icon, text }) {
  return (
    <ListItem disablePadding sx={{ mb: 1 }}>
      <ListItemButton component={Link} to={to} sx={{ border: `1px solid transparent`, '&:hover': { border: `1px solid`, borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
        <Typography sx={{ mr: 2, color: 'primary.main', fontWeight: 'bold' }}>{icon}</Typography>
        <ListItemText primary={<Typography fontWeight="bold" color="text.primary">{text}</Typography>} />
      </ListItemButton>
    </ListItem>
  );
}

function AnimatedRoutes(props) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}><Dashboard {...props} /></motion.div>} />
        <Route path="/new" element={<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}><ReleaseForm {...props} /></motion.div>} />
        <Route path="/audit" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AuditLog logs={props.logs} /></motion.div>} />
        <Route path="/team" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TeamSettings {...props} /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
}