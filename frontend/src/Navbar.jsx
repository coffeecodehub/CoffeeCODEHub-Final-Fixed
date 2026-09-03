import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiArrowUpRight, FiMenu, FiX } from 'react-icons/fi';
import logo from './assets/logo-transparent.png';
import { useSite } from './context/useSite';
import { mediaUrl } from './lib/media';

export default function Navbar(){
  const {site}=useSite();
  const [open,setOpen]=useState(false);
  const loc=useLocation();
  const fallback=[{label:'Home',path:'/'},{label:'About',path:'/about'},{label:'Services',path:'/services'},{label:'Projects',path:'/projects'},{label:'Blog',path:'/blog'},{label:'Team',path:'/team'},{label:'Reviews',path:'/review'},{label:'Contact',path:'/contact'}];
  const stored=Array.isArray(site.navigation)?site.navigation:[];
  const byPath=new Map(stored.filter(x=>x&&x.path).map(x=>[x.path,x]));
  // Keep the public navigation deterministic. Older CMS records contained
  // stale displayOrder values that moved Reviews near the beginning.
  const links=fallback
    .map((item,index)=>({ ...item, ...(byPath.get(item.path)||{}), displayOrder:index }))
    .filter(x=>x.isActive!==false);
  return <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"><div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center"><Link to="/" onClick={()=>setOpen(false)} className="flex items-center gap-2.5"><img src={mediaUrl(site.logo)||logo} alt="CoffeeCODEHub logo" className="w-12 h-12 object-contain"/><span className="text-xl font-black tracking-tight text-slate-950">{site.companyName||<>coffee<span className="text-[#F59E0B]">CODE</span>.Hub</>}</span></Link><nav className="hidden lg:flex items-center gap-6 ml-auto">{links.map(({label,path})=><Link key={path} to={path} className={`text-sm font-semibold ${loc.pathname===path?'text-[#F59E0B]':'text-slate-600 hover:text-[#F59E0B]'}`}>{label}</Link>)}<Link to="/contact" className="ml-1 inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-400">Start a Project <FiArrowUpRight/></Link></nav><button className="lg:hidden ml-auto p-3 text-xl" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<FiX/>:<FiMenu/>}</button></div>{open&&<nav className="lg:hidden bg-white border-t px-5 py-5 space-y-2">{links.map(({label,path})=><Link onClick={()=>setOpen(false)} key={path} to={path} className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-amber-50 hover:text-[#F59E0B]">{label}</Link>)}<Link onClick={()=>setOpen(false)} to="/contact" className="mt-2 block text-center rounded-xl bg-[#F59E0B] px-5 py-3 font-black">Start a Project</Link></nav>}</header>
}
