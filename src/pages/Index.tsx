import logoSkoolife from '@/assets/logo-skoolife.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Logo */}
        <div className="animate-fade-in">
          <img
            src={logoSkoolife}
            alt="Skoolife - Mascotte renard"
            className="w-40 h-40 md:w-52 md:h-52 rounded-3xl shadow-lg animate-float"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mt-8 animate-fade-in-delay-1">
          Skoolife
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-primary-foreground/80 mt-4 animate-fade-in-delay-2">
          Bientôt disponible.
        </p>
      </div>
    </div>
  );
};

export default Index;
