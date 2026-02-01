import LeadCatcherHeader from "../../components/leadcatcher/LeadCatcherHeader";
import LeadCatcherFooter from "../../components/leadcatcher/LeadCatcherFooter";

export default function LeadCatcherLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        header[data-site-header],
        footer[data-site-footer] {
          display: none !important;
        }
      `}</style>
      <LeadCatcherHeader />
      {children}
      <LeadCatcherFooter />
    </>
  );
}
