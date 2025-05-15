import { Analytics } from '@vercel/analytics';

Analytics.init({
  projectId: 'prj_tcbcDL0P9q4SbHo6YBTebXSvfwi4', // Erstatt med ditt faktiske prosjekt-ID fra Vercel
});

Analytics.trackPageview();