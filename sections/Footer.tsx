export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-10 text-white">
      
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        
        <div>
          <h2 className="text-2xl font-bold">
            Sphorix
            <span className="text-orange-500"> France</span>
          </h2>

          <p className="mt-2 text-slate-400">
            Gestion • Comptabilité • Transformation Digitale
          </p>
        </div>

        <div className="flex gap-6 text-slate-400">
          <a href="#">LinkedIn</a>
          <a href="#">WhatsApp</a>
          <a href="#">Email</a>
        </div>
      </div>

      <div className="mt-10 text-center text-sm text-slate-500">
        © 2026 Sphorix France — Tous droits réservés.
      </div>
    </footer>
  );
}