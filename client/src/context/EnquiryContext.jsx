import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const EnquiryContext = createContext(null);

export function EnquiryProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [productSlug, setProductSlug] = useState(null);

  const openEnquiry = useCallback((slug = null) => {
    setProductSlug(slug);
    setIsOpen(true);
  }, []);
  const closeEnquiry = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, productSlug, openEnquiry, closeEnquiry }),
    [isOpen, productSlug, openEnquiry, closeEnquiry],
  );
  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export function useEnquiry() {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error('useEnquiry must be used within EnquiryProvider');
  return ctx;
}
