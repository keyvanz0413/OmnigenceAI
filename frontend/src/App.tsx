import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LeftSideBar from './components/Dashboard/LeftSideBar';
import { useLayoutStore } from './store/useLayoutStore';
import { motion } from 'framer-motion';
import Dashboard from '@/pages/Dashboard';

const App: React.FC = () => {
  const { isSidebarExpanded } = useLayoutStore();

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <LeftSideBar />

        <motion.main
          animate={{ marginLeft: isSidebarExpanded ? 200 : 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="min-h-screen transition-all"
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<div className="p-8"><Dashboard /></div>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;
