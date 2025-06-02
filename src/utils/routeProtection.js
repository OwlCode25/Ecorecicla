// src/utils/routeProtection.js
// Este archivo contiene utilidades para proteger rutas en el cliente

export function redirectIfNotAuthenticated(redirectTo = "/login") {
  if (typeof window !== "undefined") {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null",
    );
    if (!currentUser) {
      window.location.href =
        redirectTo + "?message=Debes iniciar sesión para acceder";
      return false;
    }
    return true;
  }
  return false;
}

export function redirectIfAuthenticated(redirectTo = "/dashboard") {
  if (typeof window !== "undefined") {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null",
    );
    if (currentUser) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }
  return false;
}

export function getCurrentUser() {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  }
  return null;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser");
    window.location.href = "/";
  }
}

// Componente de protección que se puede usar en cualquier página
export function ProtectedPage() {
  return `
    <script>
      // Verificar autenticación
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (!currentUser) {
        window.location.href = '/login?message=Debes iniciar sesión para acceder';
      }
    </script>
  `;
}

// Componente para páginas que requieren NO estar logueado (login/register)
export function GuestPage() {
  return `
    <script>
      // Redirigir si ya está logueado
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (currentUser) {
        window.location.href = '/dashboard';
      }
    </script>
  `;
}
