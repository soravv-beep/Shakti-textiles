import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ChatWidget from './components/layout/ChatWidget.jsx';
import EnquiryModal from './components/enquiry/EnquiryModal.jsx';
import { ToastViewport } from './components/ui/Toast.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Industries from './pages/Industries.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminEnquiries from './pages/admin/AdminEnquiries.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminTestimonials from './pages/admin/AdminTestimonials.jsx';
import AdminStats from './pages/admin/AdminStats.jsx';
import AdminCertificates from './pages/admin/AdminCertificates.jsx';
import AdminHero from './pages/admin/AdminHero.jsx';
import AdminIndustries from './pages/admin/AdminIndustries.jsx';
import AdminContent from './pages/admin/AdminContent.jsx';
import AdminAccounts from './pages/admin/AdminAccounts.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // NOTE: braces zaroori hain — window.scrollTo() naye Chrome mein Promise
    // return karta hai; implicit return karne pe React "destroy is not a
    // function" throw karta hai (useEffect cleanup must be a function).
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-blush">
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="stats" element={<AdminStats />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="hero" element={<AdminHero />} />
            <Route path="industries" element={<AdminIndustries />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="accounts" element={<AdminAccounts />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-blush">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
      <EnquiryModal />
      <ToastViewport />
    </div>
  );
}
