import React from 'react';
import { FaFire, FaTint, FaMountain, FaBolt, FaWind } from 'react-icons/fa';

interface ElementIconProps {
  element: string;
  className?: string;
}

const ElementIcon: React.FC<ElementIconProps> = ({ element, className }) => {
  switch (element.toUpperCase()) {
    case 'FUEGO':
      return <FaFire className={className} />;
    case 'AGUA':
      return <FaTint className={className} />;
    case 'TIERRA':
      return <FaMountain className={className} />;
    case 'RAYO':
      return <FaBolt className={className} />;
    case 'AIRE':
      return <FaWind className={className} />;
    default:
      return null;
  }
};

export default ElementIcon;
