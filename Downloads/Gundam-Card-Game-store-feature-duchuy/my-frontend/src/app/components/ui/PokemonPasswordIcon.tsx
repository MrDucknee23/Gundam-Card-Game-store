import React, { useMemo, useState } from 'react';

type PokemonPasswordIconProps = {
  isOpen: boolean;
};

const POKEMON_CLOSED_SRC = '/images/pokemon-closed.png';
const POKEMON_OPEN_SRC = '/images/pokemon-open.png';

const PokeballClosedFallback = () => (
  <svg width="22" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#1f2937" strokeWidth="6" />
    <path d="M8 50 A42 42 0 0 1 92 50 L8 50 Z" fill="#ef4444" />
    <line x1="8" y1="50" x2="92" y2="50" stroke="#1f2937" strokeWidth="6" />
    <circle cx="50" cy="50" r="13" fill="#ffffff" stroke="#1f2937" strokeWidth="6" />
  </svg>
);

const PokeballOpenFallback = () => (
  <svg width="22" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 68 L38 42" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
    <path d="M86 68 L62 42" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />

    <path d="M18 60 A30 30 0 0 1 50 28 A30 30 0 0 1 82 60" fill="#ef4444" stroke="#1f2937" strokeWidth="6" />
    <path d="M18 66 A30 30 0 0 0 50 94 A30 30 0 0 0 82 66" fill="#ffffff" stroke="#1f2937" strokeWidth="6" />
    <circle cx="50" cy="63" r="11" fill="#ffffff" stroke="#1f2937" strokeWidth="6" />
  </svg>
);

export const PokemonPasswordIcon: React.FC<PokemonPasswordIconProps> = ({ isOpen }) => {
  const [failedSources, setFailedSources] = useState<string[]>([]);

  const src = useMemo(() => {
    const preferred = isOpen ? POKEMON_OPEN_SRC : POKEMON_CLOSED_SRC;
    return failedSources.includes(preferred) ? '' : preferred;
  }, [failedSources, isOpen]);

  if (!src) {
    return isOpen ? <PokeballOpenFallback /> : <PokeballClosedFallback />;
  }

  return (
    <img
      src={src}
      alt={isOpen ? 'Hiện mật khẩu' : 'Ẩn mật khẩu'}
      className="h-[28px] w-[28px] object-contain"
      draggable={false}
      onError={() => {
        setFailedSources((current) => (current.includes(src) ? current : [...current, src]));
      }}
    />
  );
};
