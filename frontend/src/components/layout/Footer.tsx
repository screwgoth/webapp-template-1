import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Made by <span className="font-medium text-foreground">screwgoth</span> • Version 1.0.0
        </p>
      </div>
    </footer>
  );
};
