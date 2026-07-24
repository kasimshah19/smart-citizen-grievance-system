import DashboardLayout from "../components/layout/DashboardLayout";

function ComingSoonPage({ title }) {
  return (
    <DashboardLayout>
      <div className="bg-white border border-line rounded-2xl p-16 text-center">
        <span className="inline-block font-mono text-xs uppercase tracking-widest text-slate border border-line rounded-full px-3 py-1 mb-4">
          Coming Soon
        </span>
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        <p className="text-slate text-sm mt-2">This section is under construction.</p>
      </div>
    </DashboardLayout>
  );
}

export default ComingSoonPage;