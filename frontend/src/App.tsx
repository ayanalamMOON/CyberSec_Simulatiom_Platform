import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import SimulationLibraryPage from './pages/SimulationLibraryPage';
import SimulationDetailPage from './pages/SimulationDetailPage';
import HastadAttackPage from './pages/HastadAttackPage';
import AboutPage from './pages/AboutPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/simulations" element={<SimulationLibraryPage />} />
          <Route path="/simulations/:id" element={<SimulationDetailPage />} />
          <Route path="/simulations/hastad-attack" element={<HastadAttackPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;