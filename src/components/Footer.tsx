import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-8 h-8 md:w-10 md:h-10 rounded-xl" />
            <span className="text-lg md:text-xl font-bold font-heading">Skoolife</span>
          </Link>
          
          <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground transition-colors">Tarifs</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">À propos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
