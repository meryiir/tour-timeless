import { Outlet } from "react-router-dom";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
      <PublicHeader />
      <main className="flex-1 pt-0 overflow-x-hidden w-full max-w-full">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
