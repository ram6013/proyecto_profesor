import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar'; // Assuming Navbar is imported from a file
import { NotFoundPage } from './Pages/NotFoundPage';
import { TestPage } from './Pages/TestPage';
import { ExamGenerator } from './Pages/exam-generator';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route exact path="/" element={<ExamGenerator />} />
                <Route path="/TestPage" element={<TestPage />} />
                <Route path="/NotFoundPage" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default App;
