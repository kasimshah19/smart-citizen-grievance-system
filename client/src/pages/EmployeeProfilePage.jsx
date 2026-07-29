import { User, Mail, Phone, Building2, CheckCircle2 } from "lucide-react";
import EmployeeLayout from "../components/layout/EmployeeLayout";
import { useAuth } from "../contexts/AuthContext";

function EmployeeProfilePage() {
  const { citizen } = useAuth();

  const initials = citizen?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <EmployeeLayout breadcrumb="Profile">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-ink mb-1">My Profile</h1>
        <p className="text-slate text-sm mb-8">
          Your account details. Contact your administrator to update this information.
        </p>

        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <div className="bg-ink px-6 py-8 flex items-center gap-4">
            <span className="w-16 h-16 rounded-full bg-signal text-paper text-xl font-medium flex items-center justify-center shrink-0">
              {initials}
            </span>
            <div>
              <h2 className="font-display text-xl text-paper">{citizen?.fullName}</h2>
              <p className="text-paper/60 text-sm">{citizen?.role} — {citizen?.department}</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <User size={16} className="text-slate mt-0.5" />
              <div>
                <p className="text-xs text-slate">Full Name</p>
                <p className="text-sm text-ink">{citizen?.fullName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={16} className="text-slate mt-0.5" />
              <div>
                <p className="text-xs text-slate">Email Address</p>
                <p className="text-sm text-ink">{citizen?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone size={16} className="text-slate mt-0.5" />
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-slate">Mobile Number</p>
                  <p className="text-sm text-ink">{citizen?.phone}</p>
                </div>
                {citizen?.phoneVerified && (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 size={16} className="text-slate mt-0.5" />
              <div>
                <p className="text-xs text-slate">Department</p>
                <p className="text-sm text-ink">{citizen?.department}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-line">
              <p className="text-xs text-slate">
                To change your password, go to your account settings link shared by your administrator, or
                contact them for a password reset.
              </p>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default EmployeeProfilePage;