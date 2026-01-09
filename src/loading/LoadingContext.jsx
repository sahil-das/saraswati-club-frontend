import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext({
  isLoading: false,
  setLoading: () => {},
  showLoader: () => {},
  hideLoader: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  // Delay timer to prevent flickering for fast requests
  const [timerId, setTimerId] = useState(null);

  const showLoader = useCallback((immediate = false) => {
    if (immediate) {
      setIsLoading(true);
    } else {
      // Only show if request takes longer than 150ms
      const id = setTimeout(() => setIsLoading(true), 150);
      setTimerId(id);
    }
  }, []);

  const hideLoader = useCallback(() => {
    if (timerId) clearTimeout(timerId);
    setIsLoading(false);
  }, [timerId]);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading: setIsLoading, showLoader, hideLoader }}>
      {children}
    </LoadingContext.Provider>
  );
};