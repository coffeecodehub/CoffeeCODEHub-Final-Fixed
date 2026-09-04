import { api, apiBlob } from '../../lib/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaXTwitter, FaGripVertical } from 'react-icons/fa6';
import { mediaUrl } from '../../lib/media';
import {
  FiPlus, FiTrash2, FiX, FiLogOut, FiDownload, FiRefreshCw,
  FiArrowLeft, FiExternalLink, FiEdit3, FiUploadCloud
} from 'react-icons/fi';
import {
  FaFacebookF, FaInstagram, FaLinkedinIn, FaGithub, FaTiktok,
  FaYoutube, FaWhatsapp, FaTelegram, FaDiscord, FaPinterestP, FaThreads, FaSnapchat, FaRedditAlien
} from 'react-icons/fa6';
import {
  FiMonitor, FiCode, FiSmartphone, FiPenTool, FiShoppingCart,
  FiBarChart2, FiCpu, FiDatabase, FiServer, FiCloud, FiShield,
  FiCamera, FiGlobe, FiLayers, FiTrendingUp, FiBriefcase, FiZap
} from 'react-icons/fi';

const nav = ['Dashboard', 'Homepage', 'Services', 'Projects', 'Reviews', 'Leads', 'Team', 'Blogs', 'Settings'];
const token = () => localStorage.getItem('cch_admin_token') || '';
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

const ICONS = [
  ['monitor', 'Website / Monitor', FiMonitor], ['code', 'Code / Software', FiCode],
  ['mobile', 'Mobile App', FiSmartphone], ['palette', 'UI/UX / Design', FiPenTool],
  ['cart', 'E-commerce / Store', FiShoppingCart], ['marketing', 'Marketing / Growth', FiBarChart2],
  ['rocket', 'Launch / Strategy', FiCpu], ['database', 'Database', FiDatabase],
  ['server', 'Server / Backend', FiServer], ['cloud', 'Cloud', FiCloud],
  ['shield', 'Security', FiShield], ['camera', 'Media / Creative', FiCamera],
  ['globe', 'Web / Global', FiGlobe], ['layers', 'Platforms / Systems', FiLayers],
  ['trending', 'Analytics / Growth', FiTrendingUp], ['briefcase', 'Business', FiBriefcase],
  ['zap', 'Automation / Fast', FiZap]
];
const ICON_MAP = Object.fromEntries(ICONS.map(([id, , Icon]) => [id, Icon]));

function Login({ onLogin }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [err, setErr] = useState(''), [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setLoading(true); setErr('');
    try { const r = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); localStorage.setItem('cch_admin_token', r.token); localStorage.setItem('cch_admin_user', JSON.stringify(r.admin)); onLogin(r.admin); }
    catch (e) { setErr(e.message); } finally { setLoading(false); }
  }
  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5"><form onSubmit={submit} className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl"><div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden"><img src="/coffeecodehub-logo.png" alt="CoffeeCODEHub" className="w-full h-full object-contain p-1" /></div><p className="text-xs font-black tracking-[.2em] text-[#b77900] mt-6">COFFECODEHUB CMS</p><h1 className="mt-2 text-3xl font-black">Admin sign in</h1><p className="mt-2 text-slate-500">Manage services, projects, reviews, leads and website content.</p><label className="block mt-7 text-sm font-bold">Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" className="mt-2 w-full border rounded-xl px-4 py-3" required /></label><label className="block mt-4 text-sm font-bold">Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" className="mt-2 w-full border rounded-xl px-4 py-3" required /></label>{err && <p className="mt-4 bg-red-50 text-red-600 p-3 rounded-xl">{err}</p>}<button disabled={loading} className="mt-6 w-full bg-[#F59E0B] py-3 rounded-xl font-black">{loading ? 'Signing in...' : 'Sign in'}</button></form></div>;
}

function useAdminData(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api(endpoint)
      .then((r) => { if (active) { setData(r.data || []); setLoading(false); } })
      .catch(() => { if (active) { setData([]); setLoading(false); } });
    return () => { active = false; };
  }, [endpoint]);

  const load = async () => {
    setLoading(true);
    try { const r = await api(endpoint); setData(r.data || []); }
    catch { setData([]); }
    finally { setLoading(false); }
  };
  return [data, setData, load, loading];
}
function Back() { return <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"><FiArrowLeft /> Public website</Link>; }

function ImageUpload({ label, value, onChange, multiple = false, folder = 'coffeecodehub' }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function upload(e) {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setBusy(true); setError('');
    try {
      const urls = [];
      for (const file of (multiple ? files : files.slice(0, 1))) {
        const form = new FormData(); form.append('file', file); form.append('folder', folder);
        const r = await api('/media', { method: 'POST', body: form }); urls.push(r.url);
      }
      onChange(multiple ? [...(value || []), ...urls] : urls[0]);
    } catch (err) { setError(err.message); } finally { setBusy(false); e.target.value = ''; }
  }
  const list = multiple ? (value || []) : (value ? [value] : []);
  return <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 p-4 bg-slate-50/70"><div className="flex items-center justify-between gap-4"><div><p className="font-black text-sm">{label}</p><p className="text-xs text-slate-500 mt-1">Upload an image in any common format. The server automatically converts it to WebP. Maximum 15 MB per image.</p></div><label className="cursor-pointer inline-flex items-center gap-2 bg-slate-950 text-white px-4 py-2.5 rounded-xl text-sm font-bold"><FiUploadCloud /> {busy ? 'Uploading...' : 'Choose image'}<input type="file" hidden accept="image/*" multiple={multiple} onChange={upload} disabled={busy} /></label></div>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}{list.length > 0 && <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">{list.map((url, i) => <div key={`${url}-${i}`} className="relative rounded-xl overflow-hidden border bg-white"><img src={mediaUrl(url)} alt={`${label} ${i + 1}`} className="w-full aspect-video object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('bg-red-50'); }} /><button type="button" onClick={() => onChange(multiple ? list.filter((_, j) => j !== i) : '')} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 text-red-600 flex items-center justify-center shadow"><FiX /></button></div>)}</div>}</div>;
}

function IconPicker({ value, onChange }) {
  const Icon = ICON_MAP[value] || FiCode;
  return <div className="md:col-span-2"><label className="text-sm font-bold text-slate-700">Service Icon</label><div className="mt-2 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">{ICONS.map(([id, name, I]) => <button type="button" key={id} onClick={() => onChange(id)} className={`p-3 rounded-xl border text-left ${value === id ? 'border-[#F59E0B] bg-amber-50' : 'bg-white hover:border-amber-300'}`}><I className="text-xl text-[#b77900]" /><span className="block text-[11px] font-bold mt-2 leading-4">{name}</span></button>)}</div><div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500"><span className="w-8 h-8 rounded-lg bg-slate-950 text-[#F59E0B] flex items-center justify-center"><Icon /></span> Selected: <b>{ICONS.find(x => x[0] === value)?.[1] || 'Code / Software'}</b></div></div>;
}

function ListInput({ label, value, onChange, placeholder }) {
  const [draft, setDraft] = useState(''); const items = Array.isArray(value) ? value : [];
  function add() { const v = draft.trim(); if (v) { onChange([...items, v]); setDraft(''); } }
  return <div className="md:col-span-2"><label className="text-sm font-bold">{label}</label><div className="mt-2 flex gap-2"><input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder={placeholder} className="flex-1 border rounded-xl px-4 py-3"/><button type="button" onClick={add} className="px-4 rounded-xl bg-slate-950 text-white font-bold">Add</button></div><div className="flex flex-wrap gap-2 mt-3">{items.map((x, i) => <span key={`${x}-${i}`} className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 text-sm font-semibold">{x}<button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}><FiX /></button></span>)}</div></div>;
}

function FormFieldBuilder({ value, onChange }) {
  const fields = Array.isArray(value) ? value : [];
  const types = [['text', 'Short text'], ['textarea', 'Long text'], ['email', 'Email'], ['phone', 'Phone'], ['number', 'Number'], ['select', 'Dropdown'], ['multiselect', 'Multiple choice'], ['checkbox', 'Checkbox'], ['radio', 'Radio buttons'], ['url', 'Website URL'], ['budget', 'Budget'], ['date', 'Date']];
  const add = () => onChange([...fields, { fieldId: `field-${Date.now()}`, label: '', name: '', type: 'text', placeholder: '', required: false, options: [] }]);
  const update = (i, key, val) => onChange(fields.map((f, j) => j === i ? { ...f, [key]: val } : f));
  return <div className="md:col-span-2 rounded-2xl border bg-slate-50 p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-black">Client Request Form Fields</h3><p className="text-xs text-slate-500 mt-1">No JSON needed. Add the questions you want clients to answer for this service.</p></div><button type="button" onClick={add} className="inline-flex items-center gap-2 bg-[#F59E0B] px-3 py-2 rounded-xl text-sm font-black"><FiPlus /> Add field</button></div><div className="mt-4 space-y-3">{fields.map((f, i) => <div key={f.fieldId || i} className="bg-white border rounded-2xl p-4"><div className="flex items-center gap-2 text-slate-400"><FaGripVertical /><span className="text-xs font-black">FIELD {i + 1}</span><button type="button" onClick={() => onChange(fields.filter((_, j) => j !== i))} className="ml-auto text-red-500"><FiTrash2 /></button></div><div className="grid md:grid-cols-2 gap-3 mt-3"><label className="text-xs font-bold">Question / Label<input value={f.label || ''} onChange={e => update(i, 'label', e.target.value)} placeholder="e.g. What features should your website have?" className="mt-1 w-full border rounded-lg px-3 py-2.5" /></label><label className="text-xs font-bold">Field name<input value={f.name || ''} onChange={e => update(i, 'name', e.target.value.replace(/\s+/g, '_'))} placeholder="e.g. required_features" className="mt-1 w-full border rounded-lg px-3 py-2.5" /></label><label className="text-xs font-bold">Input type<select value={f.type || 'text'} onChange={e => update(i, 'type', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5">{types.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label><label className="text-xs font-bold">Placeholder<input value={f.placeholder || ''} onChange={e => update(i, 'placeholder', e.target.value)} placeholder="Helpful hint shown inside the field" className="mt-1 w-full border rounded-lg px-3 py-2.5" /></label>{['select', 'multiselect', 'radio'].includes(f.type) && <label className="md:col-span-2 text-xs font-bold">Options (one per line)<textarea value={(f.options || []).join('\n')} onChange={e => update(i, 'options', e.target.value.split('\n').map(x => x.trim()).filter(Boolean))} placeholder={'Business website\nE-commerce store\nWeb application'} rows="3" className="mt-1 w-full border rounded-lg px-3 py-2.5" /></label>}<label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={!!f.required} onChange={e => update(i, 'required', e.target.checked)} className="accent-[#F59E0B]" /> Required field</label></div></div>)}{!fields.length && <div className="py-8 text-center text-sm text-slate-500">No custom fields yet. The standard contact details are already collected.</div>}</div></div>;
}

function ServiceEditor({ editing, onClose, load }) {
  const [d, setD] = useState(() => ({ title: '', slug: '', shortDescription: '', fullDescription: '', category: 'Development', iconIdentifier: 'code', image: '', technologies: [], keyFeatures: [], deliverables: [], formFields: [], seoTitle: '', metaDescription: '', isActive: true, isFeatured: false, displayOrder: 0, ...editing }));
  const [error, setError] = useState(''), [saving, setSaving] = useState(false);
  const u = (k, v) => setD(x => ({ ...x, [k]: v }));
  async function save(e) { e.preventDefault(); setSaving(true); setError(''); try { await api(editing?._id ? `/services/${editing._id}` : '/services', { method: editing?._id ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(d) }); onClose(); load(); } catch (e) { setError(e.message); } finally { setSaving(false); } }
  return <form onSubmit={save} className="mt-7 bg-white border rounded-3xl p-6 md:p-8 grid md:grid-cols-2 gap-5"><div className="md:col-span-2 flex items-start justify-between"><div><p className="text-xs uppercase tracking-widest font-black text-[#b77900]">Service CMS</p><h2 className="text-2xl font-black mt-1">{editing?._id ? 'Edit service' : 'Add a service'}</h2><p className="text-sm text-slate-500 mt-1">Everything here appears on the public Services page when enabled.</p></div><button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><FiX /></button></div><label className="text-sm font-bold">Service Name<input required value={d.title} onChange={e => u('title', e.target.value)} placeholder="e.g. Custom Web Development" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">URL Slug<input required value={d.slug} onChange={e => u('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="custom-web-development" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Category<input value={d.category || ''} onChange={e => u('category', e.target.value)} placeholder="Development, Design, Growth..." className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Display Order<input type="number" value={d.displayOrder ?? 0} onChange={e => u('displayOrder', Number(e.target.value))} placeholder="1" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="md:col-span-2 text-sm font-bold">Short Description<textarea required value={d.shortDescription || ''} onChange={e => u('shortDescription', e.target.value)} placeholder="A concise, client-facing explanation of the service and its business value." rows="3" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="md:col-span-2 text-sm font-bold">Complete Service Description<textarea value={d.fullDescription || ''} onChange={e => u('fullDescription', e.target.value)} placeholder="Explain what you build, who it is for, what problems it solves and what clients receive." rows="7" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><IconPicker value={d.iconIdentifier} onChange={v => u('iconIdentifier', v)} /><ImageUpload label="Service Cover Image" value={d.image} onChange={v => u('image', v)} folder="coffeecodehub/services" /><ListInput label="Technologies" value={d.technologies} onChange={v => u('technologies', v)} placeholder="e.g. React, Node.js, MongoDB" /><ListInput label="Key Features" value={d.keyFeatures} onChange={v => u('keyFeatures', v)} placeholder="e.g. Responsive UI, API integrations" /><ListInput label="Deliverables" value={d.deliverables} onChange={v => u('deliverables', v)} placeholder="e.g. Production deployment, documentation" /><FormFieldBuilder value={d.formFields} onChange={v => u('formFields', v)} /><label className="text-sm font-bold">SEO Title<input value={d.seoTitle || ''} onChange={e => u('seoTitle', e.target.value)} placeholder="Custom Web Development Services | CoffeeCODEHub" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">SEO Meta Description<textarea value={d.metaDescription || ''} onChange={e => u('metaDescription', e.target.value)} placeholder="Describe this service naturally for search users." rows="3" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={!!d.isActive} onChange={e => u('isActive', e.target.checked)} className="accent-[#F59E0B] w-4 h-4" /> Show service publicly</label><label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={!!d.isFeatured} onChange={e => u('isFeatured', e.target.checked)} className="accent-[#F59E0B] w-4 h-4" /> Feature on homepage</label>{error && <p className="md:col-span-2 bg-red-50 text-red-600 p-3 rounded-xl">{error}</p>}<div className="md:col-span-2 flex gap-3"><button disabled={saving} className="bg-slate-950 text-white px-6 py-3 rounded-xl font-bold">{saving ? 'Saving...' : 'Save Service'}</button><button type="button" onClick={onClose} className="border px-6 py-3 rounded-xl font-bold">Cancel</button></div></form>;
}

function ProjectEditor({ editing, onClose, load }) {
  const [d, setD] = useState(() => ({ title: '', slug: '', category: '', shortDescription: '', fullDescription: '', clientName: '', coverImage: '', gallery: [], liveUrl: '', sourceUrl: '', techStack: [], challenges: '', solution: '', results: '', caseStudy: '', isFeatured: false, isPublished: true, displayOrder: 0, ...editing }));
  const [error, setError] = useState(''), [saving, setSaving] = useState(false); const u = (k, v) => setD(x => ({ ...x, [k]: v }));
  async function save(e) { e.preventDefault(); setSaving(true); setError(''); try { await api(editing?._id ? `/projects/${editing._id}` : '/projects', { method: editing?._id ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(d) }); onClose(); load(); } catch (e) { setError(e.message); } finally { setSaving(false); } }
  return <form onSubmit={save} className="mt-7 bg-white border rounded-3xl p-6 md:p-8 grid md:grid-cols-2 gap-5"><div className="md:col-span-2 flex items-start justify-between"><div><p className="text-xs uppercase tracking-widest font-black text-[#b77900]">Portfolio CMS</p><h2 className="text-2xl font-black mt-1">{editing?._id ? 'Edit project' : 'Add project'}</h2><p className="text-sm text-slate-500 mt-1">Publish a real case study with images, technology and a live project link.</p></div><button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><FiX /></button></div><label className="text-sm font-bold">Project Name<input required value={d.title} onChange={e => u('title', e.target.value)} placeholder="e.g. E-commerce Platform" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">URL Slug<input required value={d.slug} onChange={e => u('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="ecommerce-platform" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Category<input value={d.category || ''} onChange={e => u('category', e.target.value)} placeholder="Web Development, Mobile, Software..." className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Client Name<input value={d.clientName || ''} onChange={e => u('clientName', e.target.value)} placeholder="Optional client/company name" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="md:col-span-2 text-sm font-bold">Short Description<textarea value={d.shortDescription || ''} onChange={e => u('shortDescription', e.target.value)} placeholder="What was built and why it mattered." rows="3" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="md:col-span-2 text-sm font-bold">Complete Project Description<textarea value={d.fullDescription || ''} onChange={e => u('fullDescription', e.target.value)} placeholder="Explain the client problem, goals and delivered solution." rows="5" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><ImageUpload label="Cover Image" value={d.coverImage} onChange={v => u('coverImage', v)} folder="coffeecodehub/projects" /><ImageUpload label="Project Gallery (multiple images)" value={d.gallery} onChange={v => u('gallery', v)} multiple folder="coffeecodehub/projects/gallery" /><ListInput label="Technology Stack" value={d.techStack} onChange={v => u('techStack', v)} placeholder="e.g. React, Node.js, MongoDB" /><label className="text-sm font-bold">Live Project URL<input type="url" value={d.liveUrl || ''} onChange={e => u('liveUrl', e.target.value)} placeholder="https://client-project.com" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Source / Repository URL<input type="url" value={d.sourceUrl || ''} onChange={e => u('sourceUrl', e.target.value)} placeholder="https://github.com/... (optional)" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Challenges<textarea value={d.challenges || ''} onChange={e => u('challenges', e.target.value)} placeholder="What problem or constraints did the project have?" rows="4" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Solution<textarea value={d.solution || ''} onChange={e => u('solution', e.target.value)} placeholder="How did CoffeeCODEHub solve it?" rows="4" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Results<textarea value={d.results || ''} onChange={e => u('results', e.target.value)} placeholder="Use real outcomes only. Avoid invented metrics." rows="4" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="md:col-span-2 text-sm font-bold">Case Study<textarea value={d.caseStudy || ''} onChange={e => u('caseStudy', e.target.value)} placeholder="Detailed case-study narrative shown on the project page." rows="8" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={!!d.isFeatured} onChange={e => u('isFeatured', e.target.checked)} className="accent-[#F59E0B] w-4 h-4" /> Featured project</label><label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={!!d.isPublished} onChange={e => u('isPublished', e.target.checked)} className="accent-[#F59E0B] w-4 h-4" /> Published publicly</label>{error && <p className="md:col-span-2 bg-red-50 text-red-600 p-3 rounded-xl">{error}</p>}<div className="md:col-span-2 flex gap-3"><button disabled={saving} className="bg-slate-950 text-white px-6 py-3 rounded-xl font-bold">{saving ? 'Saving...' : 'Save Project'}</button><button type="button" onClick={onClose} className="border px-6 py-3 rounded-xl font-bold">Cancel</button></div></form>;
}

function SimpleCRUD({ type, endpoint, fields, editor = null }) {
  const [items, , load, loading] = useAdminData(endpoint); const [editing, setEditing] = useState(null); const [error, setError] = useState('');
  async function save(e) { e.preventDefault(); setError(''); const form = new FormData(e.currentTarget); const obj = {}; for (const [k, v] of form.entries()) { const field = fields.find(x => x[0] === k); if (field?.[3] === 'boolean') obj[k] = v === 'on'; else if (['skills', 'tags'].includes(k)) obj[k] = v.split(',').map(x => x.trim()).filter(Boolean); else obj[k] = v; } for (const f of fields) if (f[3] === 'boolean' && !Object.prototype.hasOwnProperty.call(obj, f[0])) obj[f[0]] = false; try { await api(editing?._id ? `${endpoint}/${editing._id}` : endpoint, { method: editing?._id ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(obj) }); setEditing(null); load(); } catch (e) { setError(e.message); } }
  async function del(id) { if (!window.confirm('Delete this item permanently?')) return; try { await api(`${endpoint.replace(/\/admin$/, '')}/${id}`, { method: 'DELETE', headers: authHeaders() }); load(); } catch (e) { setError(e.message); } }
  return <div><div className="flex items-start justify-between gap-4"><div><Back /><h1 className="mt-5 text-4xl font-black">{type}</h1><p className="text-slate-500 mt-2">Manage {type.toLowerCase()} from the CoffeeCODEHub CMS.</p></div><button onClick={() => setEditing({})} className="bg-[#F59E0B] px-4 py-3 rounded-xl font-black flex gap-2 items-center"><FiPlus /> Add</button></div>{editing && (editor ? editor(editing, () => setEditing(null), load) : <form onSubmit={save} className="mt-7 bg-white border rounded-3xl p-6 grid md:grid-cols-2 gap-4"><div className="md:col-span-2 flex items-center justify-between"><h2 className="text-xl font-black">{editing._id ? 'Edit' : 'Create'} {type.slice(0, -1)}</h2><button type="button" onClick={() => setEditing(null)} className="p-2 rounded-full hover:bg-slate-100"><FiX /></button></div>{fields.map(f => <label key={f[0]} className="text-sm font-bold text-slate-700">{f[1]}<input name={f[0]} required={!!f[2]} type={f[3] === 'boolean' ? 'checkbox' : (f[3] || 'text')} defaultChecked={f[3] === 'boolean' ? !!editing[f[0]] : undefined} defaultValue={f[3] !== 'boolean' ? (Array.isArray(editing[f[0]]) ? editing[f[0]].join(', ') : editing[f[0]] ?? '') : undefined} placeholder={f[4] || ''} className="mt-2 w-full border rounded-xl px-4 py-3" /></label>)}{error && <p className="md:col-span-2 bg-red-50 text-red-600 p-3 rounded-xl">{error}</p>}<div className="md:col-span-2 flex gap-3"><button className="bg-slate-950 text-white px-5 py-3 rounded-xl font-bold">Save</button><button type="button" onClick={() => setEditing(null)} className="border px-5 py-3 rounded-xl font-bold">Cancel</button></div></form>)}<div className="mt-7 bg-white border rounded-3xl overflow-hidden"><div className="divide-y">{loading ? <div className="p-10 text-center text-slate-500">Loading...</div> : items.map(i => <div key={i._id} className="p-5 flex items-center gap-4"><div className="flex-1 min-w-0"><b className="block truncate">{i.title || i.name || i.clientName || i.designation}</b><span className="text-sm text-slate-500">{i.slug || i.category || i.email || i.status || ''}</span></div><button onClick={() => setEditing(i)} className="p-2 rounded-lg hover:bg-slate-100" title="Edit"><FiEdit3 /></button><button onClick={() => del(i._id)} className="text-red-500 p-2 rounded-lg hover:bg-red-50" title="Delete"><FiTrash2 /></button></div>)}{!loading && !items.length && <div className="p-10 text-center text-slate-500">No items yet.</div>}</div></div></div>;
}

function Dashboard() { const [d, setD] = useState(null); const load = () => api('/dashboard').then(r => setD(r.data)).catch(() => null); useEffect(() => { api('/dashboard').then(r => setD(r.data)).catch(() => null); }, []); return <div><div className="flex items-start justify-between gap-4"><div><Back /><h1 className="mt-5 text-4xl font-black">Dashboard</h1><p className="text-slate-500 mt-2">A live overview of CoffeeCODEHub business activity.</p></div><button onClick={load} className="p-3 rounded-xl bg-white border" title="Refresh"><FiRefreshCw /></button></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">{[['Leads', d?.leads], ['Active Services', d?.services], ['Published Projects', d?.projects], ['Client Reviews', d?.reviews], ['Published Blogs', d?.blogs], ['Team Members', d?.team]].map(([k, v]) => <div key={k} className="bg-white border rounded-3xl p-6 shadow-sm"><p className="text-slate-500 text-sm">{k}</p><b className="text-4xl mt-3 block">{v ?? '—'}</b></div>)}</div></div>; }

function Reviews() { const [items, , load] = useAdminData('/reviews/admin'); async function del(id) { if (window.confirm('Delete this review permanently?')) { await api(`/reviews/${id}`, { method: 'DELETE', headers: authHeaders() }); load(); } } return <div><Back /><h1 className="mt-5 text-4xl font-black">Client Reviews</h1><p className="text-slate-500 mt-2">Client feedback appears publicly as soon as it is submitted. You only need to delete a review if it is inappropriate or unwanted.</p><div className="mt-7 space-y-4">{items.map(r => <div key={r._id} className="bg-white border rounded-3xl p-6"><div className="flex justify-between gap-4"><div><b>{r.clientName}</b><p className="text-sm text-slate-500">{r.companyName || 'Client'} · <span className="text-[#F59E0B]">{'★'.repeat(r.rating)}</span></p></div><span className="text-xs uppercase font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">Published</span></div><p className="mt-4 text-slate-700 leading-7">{r.feedbackText}</p>{r.clientWebsiteUrl && <a href={r.clientWebsiteUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#b77900]">Client website <FiExternalLink /></a>}{r.projectLink && <a href={r.projectLink} target="_blank" rel="noreferrer" className="mt-3 ml-3 inline-flex items-center gap-1 text-sm font-bold text-[#b77900]">Project / work link <FiExternalLink /></a>}{r.proofScreenshots?.length > 0 && <div className="mt-5 flex gap-3">{r.proofScreenshots.map((u, i) => <a key={u} href={mediaUrl(u)} target="_blank" rel="noreferrer"><img src={mediaUrl(u)} alt={`Proof ${i + 1}`} className="w-28 h-20 object-cover rounded-xl border" /></a>)}</div>}<div className="mt-5"><button onClick={() => del(r._id)} className="px-4 py-2 rounded-xl border text-red-600 font-bold inline-flex items-center gap-2"><FiTrash2 /> Delete review</button></div></div>)}{!items.length && <div className="bg-white border rounded-3xl p-10 text-center text-slate-500">No reviews submitted yet.</div>}</div></div>; }
function Leads() {
  const [items, , load] = useAdminData('/leads');
  const [selected, setSelected] = useState(null);

  async function status(id, s) {
    await api(`/leads/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status: s })
    });

    load();
  }

  async function del(id) {
    if (window.confirm('Delete this lead permanently?')) {
      await api(`/leads/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      setSelected(null);
      load();
    }
  }

  async function exportExcel() {
    try {
      const blob = await apiBlob('/leads/export');

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `coffeecodehub-leads-${new Date()
        .toISOString()
        .slice(0, 10)}.xls`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (e) {
      window.alert(
        e.message || 'Export failed. Please sign in again.'
      );
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Back />

          <h1 className="mt-5 text-4xl font-black">
            Leads Inbox
          </h1>

          <p className="text-slate-500 mt-2">
            Every service request is retained until you choose to delete it.
          </p>
        </div>

        <button
          onClick={exportExcel}
          className="inline-flex items-center gap-2 bg-slate-950 text-white px-4 py-3 rounded-xl font-bold"
        >
          <FiDownload />
          Export Excel
        </button>
      </div>

      <div className="mt-7 space-y-4">
        {items.map(l => (
          <div
            key={l._id}
            className="bg-white border rounded-3xl p-6"
          >
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <b>{l.clientName}</b>

                <p className="text-sm text-slate-500">
                  {l.email} · {l.phone || 'No phone'} ·{' '}
                  <span className="font-bold text-slate-700">
                    {l.requestId}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <select
                  value={l.status}
                  onChange={e =>
                    status(l._id, e.target.value)
                  }
                  className="border rounded-xl px-3 py-2 text-sm font-bold"
                >
                  {[
                    'New',
                    'In Review',
                    'Contacted',
                    'In Discussion',
                    'Proposal Sent',
                    'Won',
                    'Closed',
                    'Rejected'
                  ].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    setSelected(
                      selected?._id === l._id
                        ? null
                        : l
                    )
                  }
                  className="px-3 py-2 rounded-xl border font-bold"
                >
                  Details
                </button>

                <button
                  onClick={() => del(l._id)}
                  className="p-2 rounded-xl border text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <p className="mt-4">
              <b>Service:</b>{' '}
              {l.selectedService ||
                'Other / General inquiry'}
            </p>

            {selected?._id === l._id && (
              <div className="mt-4 rounded-2xl bg-slate-50 border p-5">
                <p>
                  <b>Company:</b>{' '}
                  {l.companyName || '—'}
                </p>

                <p className="mt-2">
                  <b>Budget:</b>{' '}
                  {l.estimatedBudget || '—'} ·{' '}
                  <b>Timeline:</b>{' '}
                  {l.timeline || '—'}
                </p>

                <p className="mt-4 font-bold">
                  Project details
                </p>

                <p className="mt-1 text-slate-600 whitespace-pre-line">
                  {l.projectScopeDetails}
                </p>

                {l.formData &&
                  Object.keys(l.formData).length > 0 && (
                    <>
                      <p className="mt-4 font-bold">
                        Custom fields
                      </p>

                      <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap bg-white p-3 rounded-xl border">
                        {JSON.stringify(
                          l.formData,
                          null,
                          2
                        )}
                      </pre>
                    </>
                  )}

                <p className="mt-4 text-xs font-bold uppercase text-slate-400">
                  Email notification: {l.emailStatus}
                </p>
              </div>
            )}
          </div>
        ))}

        {!items.length && (
          <div className="bg-white border rounded-3xl p-10 text-center text-slate-500">
            No service requests yet.
          </div>
        )}
      </div>
    </div>
  );
}
function Homepage() { const [data, setData] = useState({ hero: {}, stats: [], about: {}, process: [], whyUs: [], finalCta: {} }); const [msg, setMsg] = useState(''); useEffect(() => { api('/settings/homepage').then(r => setData(r.data || {})).catch(() => null); }, []); const u = (path, v) => setData(x => { const y = { ...x }; let ref = y; const parts = path.split('.'); parts.forEach((p, i) => { if (i === parts.length - 1) ref[p] = v; else { ref[p] = { ...(ref[p] || {}) }; ref = ref[p]; } }); return y; }); async function save(e) { e.preventDefault(); await api('/settings/homepage', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }); setMsg('Homepage saved.'); } return <div><Back /><h1 className="mt-5 text-4xl font-black">Homepage CMS</h1><p className="text-slate-500 mt-2">Edit homepage copy and hero media without touching code.</p><form onSubmit={save} className="mt-7 bg-white border rounded-3xl p-6 space-y-6"><div className="grid md:grid-cols-2 gap-5"><label className="md:col-span-2 text-sm font-bold">Hero title<textarea value={data.hero?.title || ''} onChange={e => u('hero.title', e.target.value)} placeholder="The main promise you want visitors to remember." rows="2" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="md:col-span-2 text-sm font-bold">Hero description<textarea value={data.hero?.description || ''} onChange={e => u('hero.description', e.target.value)} placeholder="Explain what CoffeeCODEHub builds and who it helps." rows="3" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Primary CTA<input value={data.hero?.primaryCta || ''} onChange={e => u('hero.primaryCta', e.target.value)} placeholder="Start Your Project" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Secondary CTA<input value={data.hero?.secondaryCta || ''} onChange={e => u('hero.secondaryCta', e.target.value)} placeholder="Explore Our Work" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="md:col-span-2 text-sm font-bold">About heading<input value={data.about?.heading || ''} onChange={e => u('about.heading', e.target.value)} placeholder="Technology, design and growth under one roof." className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="md:col-span-2 text-sm font-bold">About description<textarea value={data.about?.description || ''} onChange={e => u('about.description', e.target.value)} placeholder="Describe the company and its approach." rows="4" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><ImageUpload label="Homepage Hero Image" value={data.hero?.image || ''} onChange={v => u('hero.image', v)} folder="coffeecodehub/home" /><div className="md:col-span-2 rounded-2xl border bg-slate-50 p-5"><div className="flex items-center justify-between"><div><h3 className="font-black">Homepage Stats</h3><p className="text-xs text-slate-500">Add only truthful numbers or factual statements.</p></div><button type="button" onClick={() => u('stats', [...(data.stats || []), { label: '', value: '' }])} className="bg-[#F59E0B] px-3 py-2 rounded-xl text-sm font-black"><FiPlus /></button></div><div className="mt-4 space-y-3">{(data.stats || []).map((x, i) => <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2"><input value={x.label || ''} onChange={e => u(`stats.${i}.label`, e.target.value)} placeholder="Label e.g. Core Services" className="border rounded-xl px-3 py-2" /><input value={x.value || ''} onChange={e => u(`stats.${i}.value`, e.target.value)} placeholder="Value e.g. 8" className="border rounded-xl px-3 py-2" /><button type="button" onClick={() => u('stats', data.stats.filter((_, j) => j !== i))} className="text-red-500 px-2"><FiTrash2 /></button></div>)}</div></div></div><button className="bg-[#F59E0B] px-6 py-3 rounded-xl font-black">Save Homepage</button>{msg && <span className="ml-4 text-emerald-600 font-semibold">{msg}</span>}</form></div>; }

const socialFields = [
  ['facebook', 'Facebook', FaFacebookF, 'https://facebook.com/yourpage'], ['instagram', 'Instagram', FaInstagram, 'https://instagram.com/yourhandle'],
  ['linkedin', 'LinkedIn', FaLinkedinIn, 'https://linkedin.com/company/yourcompany'], ['twitter', 'X / Twitter', FaXTwitter, 'https://x.com/yourhandle'],
  ['tiktok', 'TikTok', FaTiktok, 'https://tiktok.com/@yourhandle'], ['youtube', 'YouTube', FaYoutube, 'https://youtube.com/@yourchannel'],
  ['github', 'GitHub', FaGithub, 'https://github.com/yourorg'], ['whatsapp', 'WhatsApp', FaWhatsapp, 'https://wa.me/923114909975'],
  ['telegram', 'Telegram', FaTelegram, 'https://t.me/yourhandle'], ['discord', 'Discord', FaDiscord, 'https://discord.gg/yourserver'],
  ['pinterest', 'Pinterest', FaPinterestP, 'https://pinterest.com/yourprofile'],
  ['threads', 'Threads', FaThreads, 'https://threads.net/@yourhandle'], ['snapchat', 'Snapchat', FaSnapchat, 'https://snapchat.com/add/yourhandle'], ['reddit', 'Reddit', FaRedditAlien, 'https://reddit.com/u/yourusername']
];
function Settings() { const [data, setData] = useState({ socialLinks: {} }), [msg, setMsg] = useState(''); useEffect(() => { api('/settings').then(r => setData(r.data || {})).catch(() => null); }, []); const u = (k, v) => setData(x => ({ ...x, [k]: v })); const social = (k, v) => setData(x => ({ ...x, socialLinks: { ...(x.socialLinks || {}), [k]: v } })); async function save(e) { e.preventDefault(); await api('/settings', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }); setMsg('Settings saved successfully.'); } return <div><Back /><h1 className="mt-5 text-4xl font-black">Site Settings</h1><p className="text-slate-500 mt-2">Business identity, images, contact details, social links and SEO defaults.</p><form onSubmit={save} className="mt-7 bg-white border rounded-3xl p-6 md:p-8 grid md:grid-cols-2 gap-5"><label className="text-sm font-bold">Company Name<input value={data.companyName || ''} onChange={e => u('companyName', e.target.value)} placeholder="CoffeeCODEHub" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Tagline<input value={data.tagline || ''} onChange={e => u('tagline', e.target.value)} placeholder="Digital products & IT services" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Business Email<input value={data.email || ''} onChange={e => u('email', e.target.value)} placeholder="hello@coffeecodehub.com" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Phone<input value={data.phone || ''} onChange={e => u('phone', e.target.value)} placeholder="+92 311 4909975" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">WhatsApp Number<input value={data.whatsapp || ''} onChange={e => u('whatsapp', e.target.value)} placeholder="923114909975" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Address<input value={data.address || ''} onChange={e => u('address', e.target.value)} placeholder="Lahore, Pakistan" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Google Maps / Location Link<input value={data.mapUrl || ''} onChange={e => u('mapUrl', e.target.value)} placeholder="https://maps.google.com/?q=CoffeeCODEHub" type="url" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><ImageUpload label="Company Logo" value={data.logo || ''} onChange={v => u('logo', v)} folder="coffeecodehub/brand" /><ImageUpload label="Favicon" value={data.favicon || ''} onChange={v => u('favicon', v)} folder="coffeecodehub/brand" /><ImageUpload label="Default Open Graph / Social Share Image" value={data.defaultOgImage || ''} onChange={v => u('defaultOgImage', v)} folder="coffeecodehub/seo" /><label className="md:col-span-2 text-sm font-bold">Footer Description<textarea value={data.footerDescription || ''} onChange={e => u('footerDescription', e.target.value)} placeholder="Short professional description shown in the footer." rows="3" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><div className="md:col-span-2 rounded-2xl border bg-slate-50 p-5"><h3 className="font-black">Social Media Links</h3><p className="text-xs text-slate-500 mt-1">No JSON. Paste the full URL for each platform. Empty fields stay hidden from the footer.</p><div className="mt-4 grid md:grid-cols-2 gap-4">{socialFields.map(([k, label, I, placeholder]) => <label key={k} className="text-sm font-bold"><span className="flex items-center gap-2">{I && <I className="text-[#b77900]" />}{label}</span><input value={data.socialLinks?.[k] || ''} onChange={e => social(k, e.target.value)} placeholder={placeholder} type="url" className="mt-2 w-full border rounded-xl px-4 py-3" /></label>)}</div></div><label className="text-sm font-bold">Default SEO Title<input value={data.defaultSeoTitle || ''} onChange={e => u('defaultSeoTitle', e.target.value)} placeholder="CoffeeCODEHub | Web Development & IT Services" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Default SEO Description<textarea value={data.defaultSeoDescription || ''} onChange={e => u('defaultSeoDescription', e.target.value)} placeholder="A clear description of CoffeeCODEHub services and value." rows="3" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><div className="md:col-span-2"><button className="bg-[#F59E0B] px-6 py-3 rounded-xl font-black">Save Settings</button>{msg && <span className="ml-4 text-emerald-600 font-semibold">{msg}</span>}</div></form></div>; }

export default function Admin() {
  const [admin, setAdmin] = useState(() => { try { return JSON.parse(localStorage.getItem('cch_admin_user')); } catch { return null; } });
  const [tab, setTab] = useState('Dashboard');
  useEffect(() => { if (admin) localStorage.setItem('cch_admin_user', JSON.stringify(admin)); }, [admin]);
  useEffect(() => { if (localStorage.getItem('cch_admin_token')) api('/auth/me').catch(() => { localStorage.removeItem('cch_admin_token'); localStorage.removeItem('cch_admin_user'); setAdmin(null); }); }, []);
  if (!admin || !localStorage.getItem('cch_admin_token')) return <Login onLogin={setAdmin} />;
  const content = {
    Dashboard: <Dashboard />, Homepage: <Homepage />,
    Services: <SimpleCRUD type="Services" endpoint="/services/admin" editor={(e, close, load) => <ServiceEditor editing={e} onClose={close} load={load} />} />,
    Projects: <SimpleCRUD type="Projects" endpoint="/projects/admin" editor={(e, close, load) => <ProjectEditor editing={e} onClose={close} load={load} />} />,
    Reviews: <Reviews />, Leads: <Leads />,
    Team: <SimpleCRUD type="Team" endpoint="/team/admin" fields={[["name", "Name", true, 'text', 'e.g. Ahmed Khan'], ["designation", "Designation", true, 'text', 'Founder & CEO'], ["bio", "Bio", false, 'text', 'Short professional bio'], ["skills", "Skills (comma separated)", false, 'text', 'React, Node.js, UI/UX'], ["displayOrder", "Display Order", false, 'number', '1'], ["isActive", "Visible", false, 'boolean']]} editor={(e, close, load) => <TeamEditor editing={e} onClose={close} load={load} />} />,
    Blogs: <SimpleCRUD type="Blogs" endpoint="/blogs/admin" fields={[["title", "Title", true, 'text', 'Blog title'], ["slug", "Slug", true, 'text', 'blog-title'], ["excerpt", "Excerpt", false, 'text', 'Short summary'], ["content", "Content", false, 'text', 'Full article content'], ["category", "Category", false, 'text', 'Web Development'], ["author", "Author", false, 'text', 'CoffeeCODEHub'], ["tags", "Tags (comma separated)", false, 'text', 'React, SEO, Business'], ["status", "Status", false, 'text', 'draft or published']]} editor={(e, close, load) => <BlogEditor editing={e} onClose={close} load={load} />} />,
    Settings: <Settings />
  }[tab];
  return <div className="min-h-screen bg-slate-100 flex"><aside className="hidden md:flex fixed inset-y-0 left-0 w-72 bg-slate-950 text-white p-6 flex-col"><Link to="/" className="flex items-center gap-3"><img src="/coffeecodehub-logo.png" alt="CoffeeCODEHub" className="w-12 h-12 object-contain" /><span className="font-black text-xl">Coffee<span className="text-[#F59E0B]">CODE</span>Hub</span></Link><p className="text-xs text-slate-500 mt-2">Business CMS</p><nav className="mt-8 flex-1 min-h-0 overflow-y-auto pr-2 space-y-1">{nav.map(n => <button key={n} onClick={() => setTab(n)} className={`w-full text-left px-4 py-3 rounded-xl font-semibold ${tab === n ? 'bg-[#F59E0B] text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}>{n}</button>)}</nav><button onClick={() => { localStorage.removeItem('cch_admin_token'); localStorage.removeItem('cch_admin_user'); setAdmin(null); }} className="mt-auto flex items-center gap-2 text-slate-400 px-4 py-3"><FiLogOut /> Logout</button></aside><main className="md:ml-72 flex-1 p-5 lg:p-10"><div className="md:hidden flex overflow-x-auto gap-2 mb-6">{nav.map(n => <button onClick={() => setTab(n)} key={n} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold ${tab === n ? 'bg-slate-950 text-white' : 'bg-white border'}`}>{n}</button>)}</div>{content}</main></div>;
}

function TeamEditor({ editing, onClose, load }) { const [d, setD] = useState(() => ({ name: '', designation: '', bio: '', avatarUrl: '', socialLinks: {}, skills: [], displayOrder: 0, isActive: true, ...editing })); const [error, setError] = useState(''); const u = (k, v) => setD(x => ({ ...x, [k]: v })); const social = (k, v) => setD(x => ({ ...x, socialLinks: { ...(x.socialLinks || {}), [k]: v } })); async function save(e) { e.preventDefault(); try { await api(editing?._id ? `/team/${editing._id}` : '/team', { method: editing?._id ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(d) }); onClose(); load(); } catch (e) { setError(e.message); } } return <form onSubmit={save} className="mt-7 bg-white border rounded-3xl p-6 grid md:grid-cols-2 gap-5"><div className="md:col-span-2 flex justify-between"><div><p className="text-xs uppercase tracking-widest font-black text-[#b77900]">Team CMS</p><h2 className="text-2xl font-black mt-1">{editing?._id ? 'Edit team member' : 'Add team member'}</h2></div><button type="button" onClick={onClose}><FiX /></button></div><label className="text-sm font-bold">Name<input required value={d.name} onChange={e => u('name', e.target.value)} placeholder="e.g. Ahmed Khan" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Designation<input required value={d.designation} onChange={e => u('designation', e.target.value)} placeholder="Founder & CEO" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="md:col-span-2 text-sm font-bold">Professional Bio<textarea value={d.bio || ''} onChange={e => u('bio', e.target.value)} placeholder="Explain the member's expertise and responsibility." rows="4" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><ImageUpload label="Team Member Photo" value={d.avatarUrl} onChange={v => u('avatarUrl', v)} folder="coffeecodehub/team" /><ListInput label="Skills" value={d.skills} onChange={v => u('skills', v)} placeholder="React, Node.js, UI/UX" /><div className="md:col-span-2 rounded-2xl border bg-slate-50 p-5"><h3 className="font-black">Social Profiles</h3><p className="text-xs text-slate-500 mt-1">Paste profile links. No JSON required.</p><div className="grid md:grid-cols-3 gap-3 mt-4">{socialFields.map(([k,l,I,ph]) => <label key={k} className="text-xs font-bold"><span className="flex items-center gap-2 mb-1">{I && <I className="text-[#b77900]"/>}{l}</span><input type="url" value={d.socialLinks?.[k] || ''} onChange={e => social(k, e.target.value)} placeholder={ph} className="mt-1 w-full border rounded-lg px-3 py-2.5" /></label>)}</div></div><label className="text-sm font-bold">Display Order<input type="number" value={d.displayOrder || 0} onChange={e => u('displayOrder', Number(e.target.value))} placeholder="1" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={!!d.isActive} onChange={e => u('isActive', e.target.checked)} className="accent-[#F59E0B] w-4 h-4" /> Visible publicly</label>{error && <p className="md:col-span-2 bg-red-50 text-red-600 p-3 rounded-xl">{error}</p>}<div className="md:col-span-2"><button className="bg-slate-950 text-white px-6 py-3 rounded-xl font-bold">Save Team Member</button></div></form>; }

function BlogEditor({ editing, onClose, load }) { const [d, setD] = useState(() => ({ title: '', slug: '', excerpt: '', content: '', coverImage: '', category: '', author: 'CoffeeCODEHub', tags: [], status: 'draft', ...editing })); const [error, setError] = useState(''); const u = (k, v) => setD(x => ({ ...x, [k]: v })); async function save(e) { e.preventDefault(); try { await api(editing?._id ? `/blogs/${editing._id}` : '/blogs', { method: editing?._id ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(d) }); onClose(); load(); } catch (e) { setError(e.message); } } return <form onSubmit={save} className="mt-7 bg-white border rounded-3xl p-6 grid md:grid-cols-2 gap-5"><div className="md:col-span-2 flex justify-between"><div><p className="text-xs uppercase tracking-widest font-black text-[#b77900]">Blog CMS</p><h2 className="text-2xl font-black mt-1">{editing?._id ? 'Edit blog' : 'Create blog'}</h2></div><button type="button" onClick={onClose}><FiX /></button></div><label className="text-sm font-bold">Title<input required value={d.title} onChange={e => u('title', e.target.value)} placeholder="How to choose a web development company" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Slug<input required value={d.slug} onChange={e => u('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="choose-web-development-company" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="md:col-span-2 text-sm font-bold">Excerpt<textarea value={d.excerpt || ''} onChange={e => u('excerpt', e.target.value)} placeholder="A useful summary for search and blog cards." rows="3" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><ImageUpload label="Blog Cover Image" value={d.coverImage} onChange={v => u('coverImage', v)} folder="coffeecodehub/blogs" /><label className="text-sm font-bold">Category<input value={d.category || ''} onChange={e => u('category', e.target.value)} placeholder="Web Development / SEO / Business" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Author<input value={d.author || ''} onChange={e => u('author', e.target.value)} placeholder="CoffeeCODEHub" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><ListInput label="Tags" value={d.tags} onChange={v => u('tags', v)} placeholder="React, SEO, Business" /><label className="md:col-span-2 text-sm font-bold">Article Content<textarea required value={d.content || ''} onChange={e => u('content', e.target.value)} placeholder="Write genuinely useful content for your audience. Avoid keyword stuffing." rows="14" className="mt-2 w-full border rounded-xl px-4 py-3" /></label><label className="text-sm font-bold">Status<select value={d.status || 'draft'} onChange={e => u('status', e.target.value)} className="mt-2 w-full border rounded-xl px-4 py-3"><option value="draft">Draft</option><option value="published">Published</option></select></label>{error && <p className="md:col-span-2 bg-red-50 text-red-600 p-3 rounded-xl">{error}</p>}<div className="md:col-span-2"><button className="bg-slate-950 text-white px-6 py-3 rounded-xl font-bold">Save Blog</button></div></form>; }
