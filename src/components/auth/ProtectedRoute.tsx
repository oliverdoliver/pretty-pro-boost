import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperadmin?: boolean;
  requireBrfAdmin?: boolean;
  requireAnyRole?: boolean;
}

export function ProtectedRoute({
  children,
  requireSuperadmin = false,
  requireBrfAdmin = false,
  requireAnyRole = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isSuperadmin, isBrfAdmin, isBrfUser, roles } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSuperadmin && !isSuperadmin) {
    return <Navigate to="/portal" replace />;
  }

  if (requireBrfAdmin && !isBrfAdmin && !isSuperadmin) {
    return <Navigate to="/portal" replace />;
  }

  if (requireAnyRole && roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-serif font-semibold text-foreground mb-4">
            Ingen behörighet
          </h1>
          <p className="text-muted-foreground">
            Ditt konto har inte tilldelats några behörigheter ännu.
            Kontakta din administratör.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
