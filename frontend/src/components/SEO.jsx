import { useEffect } from 'react';
import { agencySchema, setSEO } from '../lib/seo';

export default function SEO({ title, description, path, image, schema }) {
  useEffect(() => {
    setSEO({ title, description, path, image, schema: schema || agencySchema });
  }, [title, description, path, image, schema]);
  return null;
}
