import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import Who from './components/Who';
import Chat from './components/Chat';

const App =()=>
{
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/chat" element={<Chat />} />
          <Route path="/" element={<Who />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};
export default App;