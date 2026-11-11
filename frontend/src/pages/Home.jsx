import { useState } from 'react';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import TournamentsSection from '../components/landing/TournamentsSection';
import TrainingsSection from '../components/landing/TrainingsSection';

/**
 * Home Page Component
 * Main landing page for Anantapur Football Club
 * Contains: Hero, Stats, Tournaments & Training (tabbed view), and Footer sections
 */
const Home = () => {
  const [activeTab, setActiveTab] = useState('training');

  return (
    <>
      <HeroSection />
      <StatsSection />
      
      {/* Tournaments & Training Section */}
      <div className="w-full bg-gradient-to-b from-gray-50 to-white py-12 px-16 max-lg:px-8 max-md:px-5 max-[480px]:px-4 relative">
        <div 
          className="absolute inset-0 bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: 'url(/ACFC_Logo.png)',
            backgroundSize: '400px'
          }}
        ></div>
        <div className="max-w-7xl mx-auto relative">
          {/* Section Heading */}
          <div className="mb-8 text-center max-md:mb-6 max-[480px]:mb-5">
            <h2 className="text-[36px] font-bold text-gray-900 m-0 mb-3 max-md:text-3xl max-[480px]:text-[26px]">
              Tournaments & Training
            </h2>
            <p className="text-gray-600 text-lg m-0 max-w-2xl mx-auto max-md:text-base max-[480px]:text-sm">
              Compete at the highest level and develop your skills
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex justify-center gap-4 mb-10 max-md:mb-8 max-[480px]:mb-6">
            <button
              onClick={() => setActiveTab('training')}
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 max-md:px-6 max-md:py-2.5 max-md:text-base max-[480px]:px-4 max-[480px]:py-2 max-[480px]:text-sm ${
                activeTab === 'training'
                  ? 'bg-red-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-600 hover:text-red-600'
              }`}
            >
              Training
            </button>
            <button
              onClick={() => setActiveTab('tournament')}
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 max-md:px-6 max-md:py-2.5 max-md:text-base max-[480px]:px-4 max-[480px]:py-2 max-[480px]:text-sm ${
                activeTab === 'tournament'
                  ? 'bg-red-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-600 hover:text-red-600'
              }`}
            >
              Tournaments
            </button>
          </div>

          {/* Content Display */}
          <div>
            {activeTab === 'tournament' ? (
              <TournamentsSection compact={false} />
            ) : (
              <TrainingsSection compact={false} hideCompleted={true} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
