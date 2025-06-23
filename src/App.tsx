import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
// Import pages
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Journal from './pages/Journal';
import Goals from './pages/Goals';
import WeeklyReview from './pages/WeeklyReview';
import JohnGPT from './pages/JohnGPT';
import Insights from './pages/Insights';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/WeeklyReview" element={<WeeklyReview />} />
            <Route path="/JohnGPT" element={<JohnGPT />} />
            <Route path="/Insights" element={<Insights />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
