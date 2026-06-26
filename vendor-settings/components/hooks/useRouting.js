import {
  useRouter as useAppRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';

export const useRouting = () => {
  let pagesRouter;
  let appRouter;
  let pathname;
  let searchParams;

  try {
    // Try Pages Router first
    pagesRouter = useNextRouter();
  } catch (e) {
    // If Pages Router fails, try App Router
    try {
      appRouter = useAppRouter();
      pathname = usePathname();
      searchParams = useSearchParams();
    } catch (e) {
      console.error('No router available');
    }
  }

  const isAppRouter = !!appRouter;

  const router = {
    push: (path) => {
      if (isAppRouter) {
        appRouter.push(path);
      } else {
        pagesRouter.push(path);
      }
    },

    query: isAppRouter
      ? Object.fromEntries(searchParams?.entries() || [])
      : pagesRouter?.query || {},

    pathname: isAppRouter ? pathname : pagesRouter?.pathname,

    asPath: isAppRouter
      ? pathname + '?' + searchParams?.toString()
      : pagesRouter?.asPath,
  };

  return router;
};
