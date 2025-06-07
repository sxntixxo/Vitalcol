import { Stethoscope } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-blue-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <Stethoscope className="w-7 h-7 mr-2" />
        <h1 className="text-xl font-bold">VitalCol</h1>
        <span className="text-sm ml-2 font-light">Asistente de Triaje Médico</span>
      </div>
    </header>
  );
};

export default Header;