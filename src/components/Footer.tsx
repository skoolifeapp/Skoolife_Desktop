import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Top Section - Logo & Tagline */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold font-heading tracking-wide">SKOOLIFE</span>
          </Link>
          <p className="text-lg md:text-xl font-medium text-primary-foreground/90">
            Maîtrisez vos études, plus intelligemment.
          </p>
        </div>

        <div className="w-full h-px bg-primary-foreground/20 mb-12" />

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Fonctionnalités */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Fonctionnalités</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/features/calendar" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Calendrier
                </Link>
              </li>
              <li>
                <Link to="/features/pomodoro" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Pomodoro
                </Link>
              </li>
              <li>
                <Link to="/features/progression" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Progrès
                </Link>
              </li>
              <li>
                <Link to="/features/subjects" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Matières
                </Link>
              </li>
            </ul>
          </div>

          {/* Produit */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Produit</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/pricing" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Ressources</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://chat.whatsapp.com/KZaZ5cmGBoM60V5Qmqned5?mode=hqrc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Communauté WhatsApp
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Termes et conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="col-span-2 md:col-span-1">
            {/* Social Icons */}
            <div className="flex items-center gap-4 mb-6">
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>

            {/* Newsletter */}
            <div className="flex items-center gap-2">
              <input 
                type="email" 
                placeholder="Entrez votre email" 
                className="flex-1 px-4 py-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:border-primary-foreground/40"
              />
              <button className="px-4 py-2 rounded-lg bg-primary-foreground text-primary text-sm font-medium hover:bg-primary-foreground/90 transition-colors">
                S'abonner
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mt-6">
              <span className="text-sm text-primary-foreground/70">Operational</span>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-sm text-primary-foreground/70">
            © 2025 Skoolife. Fait avec ❤️ pour les étudiants.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
