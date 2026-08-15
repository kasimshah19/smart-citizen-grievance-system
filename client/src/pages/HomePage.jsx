import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

function HomePage() {
  const { citizen, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };


  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Helmet htmlAttributes={{ lang: i18n.language }}>
        <title>Nagrik | Smart Citizen Grievance Registry</title>
        <meta name="description" content="A direct line between citizens and departments responsible for fixing what's broken in your neighborhood. Report and track civic issues." />
        <link rel="canonical" href="https://nagrik.vercel.app/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Nagrik",
            "applicationCategory": "GovernmentApplication",
            "operatingSystem": "Web",
            "description": "A platform for citizens to report, track, and resolve local civic governance issues.",
            "url": "https://nagrik.vercel.app/"
          })}
        </script>
      </Helmet>

      <header className="border-b border-line px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-display text-lg tracking-tight text-ink">
          Nagrik<span className="text-signal">.</span>
        </span>
        <nav className="flex flex-wrap justify-center gap-2 sm:gap-3 text-sm items-center">
          {/* Language Switcher */}
          <div className="flex bg-ink/5 rounded-full p-1 sm:mr-2">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${i18n.language.startsWith('en') ? 'bg-white shadow-sm text-ink' : 'text-slate hover:text-ink'}`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${i18n.language.startsWith('hi') ? 'bg-white shadow-sm text-ink' : 'text-slate hover:text-ink'}`}
            >
              HI
            </button>
          </div>

          <Link to="/community" className="px-4 py-2 text-ink hover:text-signal transition-colors">
            {t("nav.community_feed")}
          </Link>
          {citizen ? (
            <>
              <Link to="/dashboard" className="px-4 py-2 text-ink hover:text-signal transition-colors">
                {t("nav.dashboard")}
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 border border-line rounded-full text-ink hover:border-ink transition-colors"
              >
                {t("nav.log_out")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-ink hover:text-signal transition-colors">
                {t("nav.log_in")}
              </Link>
              <Link to="/signup" className="px-4 py-2 bg-ink text-paper rounded-full hover:bg-signal transition-colors">
                {t("nav.sign_up")}
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex items-center px-6">
        <div className="max-w-2xl mx-auto text-center py-24">
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-slate border border-line rounded-full px-3 py-1 mb-6">
            {t("home.subtitle")}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-tight mb-6" dangerouslySetInnerHTML={{ __html: t("home.title") }}></h1>
          <p className="text-slate text-lg mb-10 max-w-lg mx-auto">
            {t("home.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {citizen ? (
              <Link to="/dashboard" className="px-6 py-3 bg-signal text-paper rounded-full font-medium hover:bg-signal-dark transition-colors">
                {t("home.go_to_dashboard")}
              </Link>
            ) : (
              <>
                <Link to="/signup" className="px-6 py-3 bg-signal text-paper rounded-full font-medium hover:bg-signal-dark transition-colors">
                  {t("home.create_account")}
                </Link>
                <Link to="/login" className="px-6 py-3 border border-line text-ink rounded-full font-medium hover:border-ink transition-colors">
                  {t("home.already_have_one")}
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;