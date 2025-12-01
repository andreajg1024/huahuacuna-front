import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface BackButtonProps {
  onBack?: () => void;
  label?: string;
}

// BackButton es un componente genérico para navegar hacia atrás
// o volver a una vista definida explícitamente por el contenedor.
export const BackButton: React.FC<BackButtonProps> = ({ onBack, label = 'Regresar' }) => {
  const handleClick = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <Button variant="ghost" onClick={handleClick} className="mb-4 inline-flex items-center">
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
};
