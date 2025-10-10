import React from 'react';
import './App.css';
import TopSection from './components/TopSection/TopSection';
import FooterSection from './components/FooterSection/FooterSection';
import WeekDaysBar from './components/WeekdaysBar/WeekdaysBar';

function App() {
  return (
    <div className='w-[384px] ml-[auto] mr-[auto] border-[1px] border-gray-300 rounded-[12px] h-[812px] overflow-hidden'>
      <TopSection />
      <WeekDaysBar />
      <FooterSection />
    </div>
  );
}

export default App;