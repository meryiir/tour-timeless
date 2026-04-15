import { Outlet } from "react-router-dom";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import BackToTop from "./BackToTop";
import WhatsAppFloatButton from "./WhatsAppFloatButton";
import PublicSeoDefaults from "./PublicSeoDefaults";
import LanguageUrlSync from "./LanguageUrlSync";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
      <PublicSeoDefaults />
      <LanguageUrlSync />
      <PublicHeader />
      <main className="flex-1 pt-0 overflow-x-hidden w-full max-w-full">
        <Outlet />
      </main>
      <PublicFooter />
      <WhatsAppFloatButton />
      <BackToTop />
    </div>
  );
}
