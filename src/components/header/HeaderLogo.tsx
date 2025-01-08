import React from 'react';

export const HeaderLogo = () => {
  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      <img 
        src="/lovable-uploads/c59be568-ac29-4c04-ac17-49fce02a6865.png" 
        alt="Magi Mascot" 
        className="w-24 h-24 animate-bounce-slow"
      />
      <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FFDEE2] via-[#D3E4FD] to-[#FFDEE2] animate-gradient-flow text-transparent bg-clip-text">
        Magi Terminal V1 Alpha
      </h1>
      <p className="text-muted-foreground">Your AI-Powered DeFi Assistant</p>
      <span className="text-xs text-muted-foreground/60 hover:text-primary/80 transition-colors duration-300 mt-1 tracking-wide">
        Powered by <a 
          href="https://www.coingecko.com/en/coins/magnify-cash" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors duration-300"
        >
          $MAG
        </a>
      </span>
    </div>
  );
};