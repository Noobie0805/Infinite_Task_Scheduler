import React from 'react';
import './App.css';
import TopSection from './components/TopSection/TopSection';
import FooterSection from './components/FooterSection/FooterSection';
import WeekDaysBar from './components/WeekdaysBar/WeekdaysBar';

function App() {
  return (
    <>
      <div className='fixed inset-0 w-full h-full -z-10' style={{
        backgroundImage: 'url("/images/27230.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'blur(8px)',
        
      }} />
      <div className='min-h-screen w-full flex items-center justify-center p-4'>
        <div className='w-[384px] rounded-[12px] h-[812px] overflow-hidden border-[1px] border-gray-300' style={{
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(5px)'
        }}>
          <TopSection />
          <WeekDaysBar />
          <FooterSection />
        </div>
      </div>
    </>
  );
}

export default App;