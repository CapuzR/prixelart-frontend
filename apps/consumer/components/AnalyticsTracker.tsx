import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag: (
      command: "config",
      targetId: string,
      config?: { page_path?: string },
    ) => void;
  }
}

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-0RWP9B33D8", {
        page_path: location.pathname + location.search,
      });
      console.log(`GA Pageview: ${location.pathname + location.search}`);
    }
  }, [location]);

  return null;
};

export default AnalyticsTracker;
