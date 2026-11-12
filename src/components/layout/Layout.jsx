import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import PageBackground from "./PageBackground";
import { ScrollProgress } from "../motion/primitives";
import PortfolioChat from "../chat/PortfolioChat";

export default function Layout() {
  return (
    <div className="relative isolate flex min-h-screen w-full max-w-full flex-col overflow-x-clip bg-bg text-text">
      <ScrollProgress />
      <PageBackground />
      <Nav />

      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      <Footer />
      <PortfolioChat />
    </div>
  );
}