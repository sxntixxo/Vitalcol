import { Stethoscope } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-blue-500">
      <div className="flex items-center animate-pulse">
        <Stethoscope className="w-12 h-12 text-white mr-3" />
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-white tracking-wide">
            VitalCol
          </h1>
          <span className="text-blue-100 text-sm mt-1">
            Asistente de Triaje Médico
          </span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;