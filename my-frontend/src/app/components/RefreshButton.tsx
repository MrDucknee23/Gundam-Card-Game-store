import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  label?: string;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, label = 'Làm mới' }) => {
  const [spinning, setSpinning] = useState(false);

  const handleClick = async () => {
    setSpinning(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setSpinning(false), 600);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={spinning}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-60"
    >
      <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
      {label}
    </button>
  );
};
