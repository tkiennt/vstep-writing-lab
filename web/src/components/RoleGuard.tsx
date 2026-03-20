'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { APP_ROUTES, Role } from '@/config/routes';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Mock current role for UI demonstration purposes
  // In a real app, this would come from a Context/Zustand store (e.g., useAuth)
  const currentRole: Role = 'user'; // Try changing this to 'teacher' or 'admin' to test
  const isAuthenticated = (currentRole as string) !== 'guest';

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Determine if the current route has specific role requirements if not provided explicitly
    let requiredRoles = allowedRoles;

    if (!requiredRoles) {
      const matchedRoute = APP_ROUTES.find(route => pathname.startsWith(route.path) && route.path !== '/');
      if (matchedRoute) {
        requiredRoles = matchedRoute.roles;
      }
    }

    if (requiredRoles && !requiredRoles.includes(currentRole)) {
      setIsAuthorized(false);
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, currentRole, allowedRoles, router]);

  if (isAuthorized === null || isAuthorized === false) {
    // Show a minimal loading state while verifying
    // Or return null to prevent flashing unauthorized content
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex space-x-2 items-center">
          <div className="w-2 h-2 bg-vstep-dark rounded-full"></div>
          <div className="w-2 h-2 bg-vstep-dark rounded-full animation-delay-200"></div>
          <div className="w-2 h-2 bg-vstep-dark rounded-full animation-delay-400"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
