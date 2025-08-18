// src/hooks/usePageView.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../analytics";

export default function usePageView(extra = {}) {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname, extra);
  }, [location.pathname]);
}
