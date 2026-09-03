import { useContext } from 'react';
import { SiteContext } from './siteContext';
export const useSite = () => useContext(SiteContext);
