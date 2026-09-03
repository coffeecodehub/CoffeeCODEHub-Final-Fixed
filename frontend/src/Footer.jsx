import { Link } from 'react-router-dom';
import logo from './assets/logo.png';
import { FiMapPin, FiMail, FiPhone, FiArrowUpRight } from 'react-icons/fi';
import SocialLinks from './components/SocialLinks';
import { useSite } from './context/useSite';
import { mediaUrl } from './lib/media';

export default function Footer() {
  const { site } = useSite();
  const address = site.address || 'Pakistan';
  const mapUrl = site.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return (
    <footer className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={mediaUrl(site.logo)||logo} alt="CoffeeCODEHub" className="w-12 h-12 object-contain" />
            <span className="font-black text-xl">{site.companyName || <>coffee<span className="text-[#F59E0B]">CODE</span>.Hub</>}</span>
          </div>
          <p className="mt-5 max-w-md text-slate-400 leading-7">{site.footerDescription || 'Modern web, software, mobile, design and digital solutions for businesses.'}</p>
          <SocialLinks socialLinks={site.socialLinks} className="mt-6" itemClassName="border-white/10 bg-white/5 text-slate-200 hover:text-slate-950" />
        </div>
        <div>
          <h3 className="font-black">Explore</h3>
          <div className="mt-5 space-y-3 text-slate-400">
            {[['About','/about'],['Services','/services'],['Projects','/projects'],['Blog','/blog'],['Team','/team'],['Client Reviews','/review']].map(([n,p]) => <Link key={p} to={p} className="block hover:text-white">{n}</Link>)}
          </div>
        </div>
        <div>
          <h3 className="font-black">Contact & Location</h3>
          <div className="mt-5 space-y-4 text-slate-400">
            <a href={`mailto:${site.email || 'coffeecodehub@gmail.com'}`} className="flex gap-3 items-start hover:text-white"><FiMail className="mt-1 shrink-0" /><span className="break-all">{site.email || 'coffeecodehub@gmail.com'}</span></a>
            <a href={`tel:${site.phone || '03114909975'}`} className="flex gap-3 items-start hover:text-white"><FiPhone className="mt-1 shrink-0" /><span>{site.phone || '0311 4909975'}</span></a>
            <a href={mapUrl} target="_blank" rel="noreferrer" className="flex gap-3 items-start hover:text-white"><FiMapPin className="mt-1 shrink-0 text-[#F59E0B]" /><span>{address}</span><FiArrowUpRight className="mt-1 shrink-0" /></a>
          </div>
          <Link to="/contact" className="inline-flex mt-6 bg-[#F59E0B] text-slate-950 px-5 py-3 rounded-xl font-black">Request a Service</Link>
        </div>
      </div>
      <div className="border-t border-white/10"><div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col md:flex-row gap-2 justify-between text-sm text-slate-500"><span>© {new Date().getFullYear()} {site.companyName || 'CoffeeCODEHub'}. {site.copyrightText || 'All rights reserved.'}</span><span>Built with purpose.</span></div></div>
    </footer>
  );
}
