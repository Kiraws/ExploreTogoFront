// Configuration de l'application
export const config = {
  // URL de l'API backend
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030',
  
  // Endpoints de l'API
  endpoints: {
    lieux: '/api/lieux',
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      register: '/api/auth/register',
    }
  },
  
  // Configuration des uploads
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 5,
  }
}

// Fonction utilitaire pour construire l'URL complète de l'API
export const buildApiUrl = (endpoint: string): string => {
  return `${config.apiUrl}${endpoint}`
}
