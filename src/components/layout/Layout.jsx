import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import PageBackground from "./PageBackground";
import { ScrollProgress } from "../motion/primitives";

export default function Layout() {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-bg text-text">
      <ScrollProgress />
      <PageBackground />
      <Nav />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}