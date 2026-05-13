export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-slate-950 px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-5xl">
        
        <div className="mb-16 text-center">
          
          <p className="mb-3 font-semibold text-orange-400">
            CONTACT
          </p>

          <h2 className="mb-6 text-4xl font-bold">
            Parlons de votre projet
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Sphorix France vous accompagne dans vos besoins
            en gestion, transformation digitale et organisation.
          </p>
        </div>

        <form className="grid gap-6 rounded-3xl bg-slate-900 p-10">
          
          <div className="grid gap-6 md:grid-cols-2">
            
            <input
              type="text"
              placeholder="Nom"
              className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 outline-none transition focus:border-orange-500"
            />

            <input
              type="email"
              placeholder="Email"
              className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 outline-none transition focus:border-orange-500"
            />
          </div>

          <input
            type="text"
            placeholder="Sujet"
            className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 outline-none transition focus:border-orange-500"
          />

          <textarea
            placeholder="Votre message"
            rows={6}
            className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 outline-none transition focus:border-orange-500"
          />

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            
            <button className="w-fit rounded-full bg-orange-500 px-8 py-4 font-semibold transition hover:bg-orange-600">
              Envoyer le message
            </button>

            <a
              href="https://wa.me/+33781525393"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-orange-400 transition hover:text-orange-300"
            >
              Contacter via WhatsApp
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}