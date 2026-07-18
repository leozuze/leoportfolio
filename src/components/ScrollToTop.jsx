import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router keeps scroll position between route changes by default —
// this forces every navigation (nav links, footer links, programmatic
// navigation) to land at the top of the new page instead.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
