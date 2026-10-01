// The admin panel is a separate app served by the backend (BACKEND/admin-ui, see README).
// Set VITE_ADMIN_URL when it has its own domain (e.g. https://admin.aicardly.com/admin).
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || `${import.meta.env.VITE_API_URL}/admin`;
