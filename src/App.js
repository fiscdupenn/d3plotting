import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ScatterPlot from './components/ScatterPlot';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ScatterPlot />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}