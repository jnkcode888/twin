import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
// Import pages
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Journal from './pages/Journal';
import Goals from './pages/Goals';
import WeeklyReview from './pages/WeeklyReview';
import JohnGPT from './pages/JohnGPT';
import Insights from './pages/Insights';
import Ideas from './pages/Ideas';
import Metrics from './pages/Metrics';
import Contradictions from './pages/Contradictions';

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/WeeklyReview" element={<WeeklyReview />} />
            <Route path="/JohnGPT" element={<JohnGPT />} />
            <Route path="/Insights" element={<Insights />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/contradictions" element={<Contradictions />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
