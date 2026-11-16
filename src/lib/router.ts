import { useEffect, useState } from 'react';

// Hash routing with plain names (e.g. #languages or #languages-ab12cd-study).
// Segments are separated by "-": the first is the page, the rest are params.
export type Route = { page: string; params: string[] };

function parse(hash: string): Route {
  const clean = hash.replace(/^#/, '').trim();
  if (!clean) return { page: '', params: [] };
  const [page, ...params] = clean.split('-');
  return { page, params };
}

export function navigate(path: string) {
  const target = '#' + path.replace(/^#/, '');
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = target;
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash));
      document.getElementById('main-scroll')?.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
