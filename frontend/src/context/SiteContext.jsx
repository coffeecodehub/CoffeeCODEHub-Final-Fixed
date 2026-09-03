import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { SiteContext } from './siteContext';
import { DEFAULT_NAV, DEFAULT_SOCIALS } from './siteDefaults';

function normalizeSite(raw = {}) {
  const incoming = Array.isArray(raw.navigation) ? raw.navigation : [];
  const byPath = new Map(incoming.filter((x) => x && x.path).map((x) => [x.path, x]));
  const navigation = DEFAULT_NAV
    .map((item, index) => {
      const current = byPath.get(item.path);
      return current ? { ...item, ...current, displayOrder: index } : item;
    })
    .filter((x) => x.isActive !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  return { ...raw, navigation, socialLinks: { ...DEFAULT_SOCIALS, ...(raw.socialLinks || {}) } };
}

export function SiteProvider({ children }) {
  const [site, setSite] = useState(normalizeSite());
  const [home, setHome] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([api('/settings'), api('/settings/homepage')]).then(([a, b]) => {
      if (!active) return;
      if (a.status === 'fulfilled') setSite(normalizeSite(a.value.data || {}));
      if (b.status === 'fulfilled') setHome(b.value.data || {});
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  return <SiteContext.Provider value={{ site, home, ready }}>{children}</SiteContext.Provider>;
}
