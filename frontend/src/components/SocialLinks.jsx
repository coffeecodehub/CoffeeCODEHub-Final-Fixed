import {
  FaFacebookF, FaInstagram, FaLinkedinIn, FaGithub, FaTiktok, FaYoutube,
  FaWhatsapp, FaTelegram, FaDiscord, FaPinterestP, FaThreads, FaSnapchat,
  FaRedditAlien
} from 'react-icons/fa6';
import { FaXTwitter } from 'react-icons/fa6';

const SOCIALS = [
  ['facebook', 'Facebook', FaFacebookF],
  ['instagram', 'Instagram', FaInstagram],
  ['linkedin', 'LinkedIn', FaLinkedinIn],
  ['twitter', 'X / Twitter', FaXTwitter],
  ['tiktok', 'TikTok', FaTiktok],
  ['youtube', 'YouTube', FaYoutube],
  ['whatsapp', 'WhatsApp', FaWhatsapp],
  ['github', 'GitHub', FaGithub],
  ['telegram', 'Telegram', FaTelegram],
  ['discord', 'Discord', FaDiscord],
  ['pinterest', 'Pinterest', FaPinterestP],
  ['threads', 'Threads', FaThreads],
  ['snapchat', 'Snapchat', FaSnapchat],
  ['reddit', 'Reddit', FaRedditAlien],
];

function getSocialItems(socialLinks = {}) {
  return SOCIALS.map(([key, label, Icon]) => ({ key, label, Icon, url: socialLinks?.[key] })).filter(item => item.url);
}

export default function SocialLinks({ socialLinks, className = '', itemClassName = '', showLabels = false }) {
  const items = getSocialItems(socialLinks);
  if (!items.length) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {items.map(({ key, label, Icon, url }) => (
        <a key={key} href={url} target="_blank" rel="noreferrer" aria-label={label} title={label}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-slate-950 transition ${itemClassName}`}>
          <Icon className="text-base" />
          {showLabels && <span className="ml-2 text-sm font-bold">{label}</span>}
        </a>
      ))}
    </div>
  );
}
