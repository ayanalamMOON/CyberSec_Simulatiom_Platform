import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import SimulationLibraryPage from './pages/SimulationLibraryPage';
import SimulationDetailPage from './pages/SimulationDetailPage';
import HastadAttackPage from './pages/HastadAttackPage';
import AboutPage from './pages/AboutPage';
import CBCPaddingOraclePage from './pages/CBCPaddingOraclePage';
import MITMAttackPage from './pages/MITMAttackPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-darkbg dark:text-white transition-colors duration-300">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/simulations" element={<SimulationLibraryPage />} />
            <Route path="/simulations/:id" element={<SimulationDetailPage />} />
            <Route path="/simulations/hastad-attack" element={<HastadAttackPage />} />
            <Route path="/simulations/cbc-padding-oracle" element={<CBCPaddingOraclePage />} />
            <Route path="/simulations/mitm-attack" element={<MITMAttackPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="bottom-right" theme="colored" />
      </div>
    </ThemeProvider>
  );
};

export default App;