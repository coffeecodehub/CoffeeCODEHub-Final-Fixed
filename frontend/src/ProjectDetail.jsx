import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from './components/SEO';
import BackButton from './components/BackButton';
import { api } from './lib/api';
import { fallbackProjects } from './lib/data';
import { mediaUrl } from './lib/media';

function normalizeProject(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    ...raw,
    gallery: Array.isArray(raw.gallery) ? raw.gallery.filter(Boolean) : [],
    techStack: Array.isArray(raw.techStack) ? raw.techStack.filter(Boolean) : [],
    title: raw.title || 'Untitled Project',
    category: raw.category || 'Project',
    shortDescription: raw.shortDescription || raw.desc || '',
    coverImage: raw.coverImage || raw.image || ''
  };
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api(`/projects/${encodeURIComponent(id)}`)
      .then(r => active && setP(normalizeProject(r.data)))
      .catch(async () => {
        // A card can briefly survive a deployment/browser cache. Refresh the
        // public list and resolve the same record before declaring it missing.
        try {
          const list = await api('/projects', { cache: 'no-store' });
          const match = (list.data || []).find(x =>
            String(x._id) === String(id) || x.slug === id || x.liveUrl === id
          );
          if (active && match) {
            setP(normalizeProject(match));
            setError('');
            return;
          }
        } catch (fallbackError) {
          // Ignore the secondary lookup error and use the local fallback below.
          void fallbackError;
        }
        const fallback = fallbackProjects.find(x => x.slug === id || String(x._id) === id);
        if (active) {
          const normalized = normalizeProject(fallback);
          setP(normalized);
          if (!normalized) setError('Project not found');
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  if (loading) return <main className="pt-32 min-h-[60vh] px-5"><div className="max-w-7xl mx-auto animate-pulse"><div className="h-4 w-24 bg-slate-200 rounded"/><div className="h-14 w-2/3 bg-slate-200 rounded mt-5"/><div className="h-5 w-1/2 bg-slate-200 rounded mt-5"/><div className="h-80 bg-slate-200 rounded-[2rem] mt-12"/></div></main>;
  if (!p) return <main className="pt-32 p-10 text-center min-h-[60vh]"><h1 className="text-3xl font-black">{error || 'Project not found'}</h1><Link className="text-[#b77900] font-bold" to="/projects">Back to projects</Link></main>;

  const cover = mediaUrl(p.coverImage);
  return <>
    <SEO title={p.title} description={p.shortDescription} path={`/project/${p.slug || id}`} image={cover} schema={{ '@context':'https://schema.org','@type':'CreativeWork','name':p.title,'description':p.shortDescription,'url':`https://coffeecodehub.com/project/${p.slug || id}` }} />
    <main className="pt-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-6"><BackButton /></div>
      <section className="bg-slate-950 text-white"><div className="max-w-7xl mx-auto px-5 lg:px-8 py-24"><p className="text-[#F59E0B] font-bold uppercase tracking-widest text-xs">{p.category}</p><h1 className="mt-4 text-5xl md:text-7xl font-black max-w-4xl">{p.title}</h1>{p.shortDescription && <p className="mt-6 max-w-2xl text-slate-300 text-lg leading-8">{p.shortDescription}</p>}</div></section>
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-14">
        {cover && <div className="overflow-hidden rounded-[2rem] border bg-slate-100"><img src={cover} alt={p.title} className="w-full aspect-video object-cover" fetchPriority="high" decoding="async" onError={e => { e.currentTarget.parentElement.style.display='none'; }} /></div>}
        {p.gallery.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">{p.gallery.map((u,i) => <div key={`${u}-${i}`} className="overflow-hidden rounded-2xl border bg-slate-100"><img src={mediaUrl(u)} alt={`${p.title} project screenshot ${i+1}`} loading="lazy" decoding="async" className="w-full aspect-[4/3] object-cover hover:scale-[1.02] transition-transform" /></div>)}</div>}
        <div className="grid lg:grid-cols-3 gap-10 mt-12"><article className="lg:col-span-2 space-y-10"><div><h2 className="text-3xl font-black">Case Study</h2><p className="mt-4 text-slate-600 leading-8 whitespace-pre-line">{p.caseStudy || p.fullDescription || 'Project details will be published here.'}</p></div>{p.challenges && <div><h2 className="text-2xl font-black">Challenge</h2><p className="mt-3 text-slate-600 leading-8 whitespace-pre-line">{p.challenges}</p></div>}{p.solution && <div><h2 className="text-2xl font-black">Solution</h2><p className="mt-3 text-slate-600 leading-8 whitespace-pre-line">{p.solution}</p></div>}{p.results && <div><h2 className="text-2xl font-black">Results</h2><p className="mt-3 text-slate-600 leading-8 whitespace-pre-line">{p.results}</p></div>}</article><aside className="rounded-3xl bg-slate-50 border p-6 h-fit"><h3 className="font-black">Technology</h3>{p.techStack.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{p.techStack.map(t => <span key={t} className="px-3 py-1 rounded-full bg-white border text-sm font-bold">{t}</span>)}</div>}{p.liveUrl && <a target="_blank" rel="noreferrer" href={p.liveUrl} className="mt-7 block rounded-xl bg-[#F59E0B] text-center py-3 font-black">Visit Live Project ↗</a>}{p.sourceUrl && <a target="_blank" rel="noreferrer" href={p.sourceUrl} className="mt-3 block rounded-xl border bg-white text-center py-3 font-bold">View Repository ↗</a>}</aside></div>
      </section>
    </main>
  </>;
}
