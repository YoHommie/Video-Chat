import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
import HomePage from "./routes/HomePage";

const App = () => (
  <Router>
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room" element={<Room />} />
          <Route path="/host" element={<CreateRoom />} />
      </Routes>
  </Router>
);

export default App;


