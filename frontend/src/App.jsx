import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Global static components jo har page par chahiye
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import WhatsappButton from './WhatsappButton';

// Dynamic lazy imports (sirf zaroorat par download honge)
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Services = lazy(() => import('./Services'));
const ServiceDetail = lazy(() => import('./ServiceDetail'));
const Projects = lazy(() => import('./Projects'));
const ProjectDetail = lazy(() => import('./ProjectDetail'));
const Contact = lazy(() => import('./Contact'));
const Blog = lazy(() => import('./Blog'));
const BlogDetail = lazy(() => import('./BlogDetail'));
const Team = lazy(() => import('./Team'));
const Review = lazy(() => import('./Review'));
const Admin = lazy(() => import('./pages/admin/Admin'));

// Lightweight placeholder loader jab tak koi naya page download ho raha ho
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
    </div>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const admin = pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!admin && <Navbar />}
      
      <main className={admin ? 'min-h-screen' : 'min-h-[calc(100vh-5rem)]'}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/team" element={<Team />} />
            <Route path="/review" element={<Review />} />
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </Suspense>
      </main>

      {!admin && <Footer />}
      {!admin && <WhatsappButton />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Shell />
    </Router>
  );
}