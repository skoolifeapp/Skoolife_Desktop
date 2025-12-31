import { Link } from 'react-router-dom';
const LOGO_URL = '/logo.png';

const Footer = () => {
  const openCookieSettings = () => {
    // Open tarteaucitron panel if available
    if (typeof window !== 'undefined' && window.tarteaucitron) {
      const panel = document.getElementById('tarteaucitronManager');
      if (panel) {
        panel.click();
      } else {
        // Fallback: trigger the hashtag
        window.location.hash = '#tarteaucitron';
      }
    }
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={LOGO_URL} alt="Skoolife" className="w-8 h-8 md:w-10 md:h-10 rounded-xl" />
            <span className="text-lg md:text-xl font-bold font-heading">Skoolife</span>
          </Link>
          
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">À propos</Link>
            <Link to="/legal" className="hover:text-foreground transition-colors">Mentions légales</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
            <button
              onClick={openCookieSettings}
              className="hover:text-foreground transition-colors"
            >
              Gérer mes cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
