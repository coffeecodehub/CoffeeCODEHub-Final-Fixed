const SITE = (import.meta.env.VITE_SITE_URL || 'https://coffeecodehub.com').replace(/\/$/, '');

export function setSEO({ title, description, path = '/', image = '/favicon.png', type = 'website', schema }) {
  const fullTitle = title?.includes('CoffeeCODEHub') ? title : `${title} | CoffeeCODEHub`;
  document.title = fullTitle;
  const canonical = `${SITE}${path}`;
  const tags = [
    ['name', 'description', description],
    ['property', 'og:title', fullTitle],
    ['property', 'og:description', description],
    ['property', 'og:type', type],
    ['property', 'og:url', canonical],
    ['property', 'og:image', image.startsWith('http') ? image : `${SITE}${image}`],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', fullTitle],
    ['name', 'twitter:description', description],
  ];
  tags.forEach(([attr, key, value]) => {
    if (!value) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
    el.setAttribute('content', value);
  });
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
  link.href = canonical;
  const old = document.getElementById('page-jsonld');
  if (old) old.remove();
  if (schema) {
    const script = document.createElement('script'); script.id = 'page-jsonld'; script.type = 'application/ld+json'; script.textContent = JSON.stringify(schema); document.head.appendChild(script);
  }
}

export const agencySchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'CoffeeCODEHub',
  url: SITE,
  logo: `${SITE}/coffeecodehub-logo.png`,
  description: 'CoffeeCODEHub builds modern websites, web applications, mobile apps, UI/UX experiences and digital solutions for businesses.',
  areaServed: 'Worldwide',
  serviceType: ['Web Development', 'Software Development', 'Mobile App Development', 'UI/UX Design', 'WordPress Development', 'E-commerce Development', 'Digital Marketing', 'Branding'],
};
