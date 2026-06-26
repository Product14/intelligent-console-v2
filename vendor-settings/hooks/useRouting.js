import {
  useRouter as useAppRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';

/**
 * @returns {Object} router object with push, replace, query, pathname, and asPath properties
 * @description This hook is used to get the router object with push, replace, query, pathname, and asPath properties
 */
export default function useRouting() {
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

  const router = isAppRouter
    ? {
        push: (path) => {
          if (path && typeof path === 'object' && path.pathname) {
            const queryString = path.query
              ? Object.entries(path.query)
                  .map(
                    ([key, value]) =>
                      `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
                  )
                  .join('&')
              : '';

            const url = queryString
              ? `${path.pathname}?${queryString}`
              : path.pathname;
            appRouter.push(url);
          } else {
            appRouter.push(path);
          }
        },

        replace: async (options) => {
          if (options && typeof options === 'object') {
            // Handle pathname + query objects
            if (options.pathname) {
              const queryString = options.query
                ? Object.entries(options.query)
                    .map(
                      ([key, value]) =>
                        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
                    )
                    .join('&')
                : '';

              const url = queryString
                ? `${options.pathname}?${queryString}`
                : options.pathname;
              return Promise.resolve(appRouter.replace(url));
            }
            // else if (options.query && !options.pathname) {
            //   const queryString = Object.entries(options.query)
            //     .map(
            //       ([key, value]) =>
            //         `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            //     )
            //     .join('&');

            //   const currentPathname = pathname || window.location.pathname;
            //   const url = queryString
            //     ? `${currentPathname}?${queryString}`
            //     : currentPathname;
            //   return Promise.resolve(appRouter.replace(url));
            // }
          }
          return Promise.resolve(appRouter.replace(options));
        },

        query: Object.fromEntries(searchParams?.entries() || []),
        pathname: pathname,
        asPath: pathname + '?' + searchParams?.toString(),
        isReady: true,
      }
    : pagesRouter;

  return router;
}
