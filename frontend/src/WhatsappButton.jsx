import { FaWhatsapp } from 'react-icons/fa6';
import { useSite } from './context/useSite';

export default function WhatsappButton() {
  const { site } = useSite();
  const number = String(site.whatsapp || site.socialLinks?.whatsapp || '923114909975').replace(/\D/g, '');
  return (
    <a href={`https://wa.me/${number}`} target="_blank" rel="noreferrer" aria-label="Chat with CoffeeCODEHub on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
      title="WhatsApp CoffeeCODEHub">
      <FaWhatsapp className="text-3xl" />
    </a>
  );
}
