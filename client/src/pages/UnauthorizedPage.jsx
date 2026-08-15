import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

function UnauthorizedPage() {
  return (
    <div className="min-h-dvh bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <ShieldAlert size={40} className="text-error mx-auto mb-4" />
        <h1 className="font-display text-2xl text-ink mb-2">Access Denied</h1>
        <p className="text-slate text-sm mb-6">
          You don't have permission to view this page.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-ink text-paper rounded-full text-sm font-medium hover:bg-signal transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;