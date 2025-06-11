import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <div className="flex flex-col h-screen bg-gray-50">
          <Header />
          <main className="flex-1 overflow-hidden">
            <ChatInterface />
          </main>
        </div>
      )}
    </>
  );
}

export default App;