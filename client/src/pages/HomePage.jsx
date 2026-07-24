import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function HomePage() {
  const { citizen, logout } = useAuth();

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="border-b border-line px-6 py-5 flex items-center justify-between">
        <span className="font-display text-lg tracking-tight text-ink">
          Nagrik<span className="text-signal">.</span>
        </span>
        <nav className="flex gap-3 text-sm items-center">
          {citizen ? (
            <>
              <Link to="/dashboard" className="px-4 py-2 text-ink hover:text-signal transition-colors">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 border border-line rounded-full text-ink hover:border-ink transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-ink hover:text-signal transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="px-4 py-2 bg-ink text-paper rounded-full hover:bg-signal transition-colors">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex items-center px-6">
        <div className="max-w-2xl mx-auto text-center py-24">
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-slate border border-line rounded-full px-3 py-1 mb-6">
            Civic Grievance Registry
          </span>
          <h1 className="font-display text-5xl md:text-6xl text-ink leading-tight mb-6">
            Report it. Track it.<br />Get it resolved.
          </h1>
          <p className="text-slate text-lg mb-10 max-w-lg mx-auto">
            A direct line between citizens and the departments responsible for fixing what's broken in your neighborhood.
          </p>
          <div className="flex gap-4 justify-center">
            {citizen ? (
              <Link to="/dashboard" className="px-6 py-3 bg-signal text-paper rounded-full font-medium hover:bg-signal-dark transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="px-6 py-3 bg-signal text-paper rounded-full font-medium hover:bg-signal-dark transition-colors">
                  Create an account
                </Link>
                <Link to="/login" className="px-6 py-3 border border-line text-ink rounded-full font-medium hover:border-ink transition-colors">
                  I already have one
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