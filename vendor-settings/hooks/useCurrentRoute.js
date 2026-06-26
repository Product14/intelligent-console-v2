import { usePathname } from 'next/navigation';

const useCurrentRoute = () => {
  const pathname = usePathname();
  const [mainRoute, childRoute] = pathname.split('/').filter(Boolean);
  return { mainRoute: mainRoute || null, childRoute: childRoute || null };
};

export default useCurrentRoute;
