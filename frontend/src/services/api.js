/**
 * API Service Configuration
 * 
 * This file contains all API-related configurations and helper functions
 * for connecting to the backend server.
 * 
 * Usage:
 * import { apiService, API_ENDPOINTS } from '../services/api';
 * const data = await apiService.get(API_ENDPOINTS.TOURNAMENTS);
 */

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

/**
 * Base URL for all API requests
 * Retrieved from environment variables for flexibility across environments
 * Falls back to localhost if not defined
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * API request timeout in milliseconds
 * Prevents requests from hanging indefinitely
 */
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

/**
 * Extended timeout for report generation (60 seconds)
 * PDF generation with Puppeteer takes longer
 */
const REPORT_TIMEOUT = 60000;

/**
 * Debug mode flag for logging API calls
 */
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Centralized API endpoints object
 * Makes it easy to manage and update endpoints in one place
 */
export const API_ENDPOINTS = {
  // Tournament endpoints
  TOURNAMENTS: '/tournaments',
  TOURNAMENT_BY_ID: (id) => `/tournaments/${id}`,
  
  // Training endpoints
  TRAININGS: '/trainings',
  TRAINING_BY_ID: (id) => `/trainings/${id}`,
  
  // Player endpoints
  PLAYERS: '/players',
  PLAYER_BY_ID: (id) => `/players/${id}`,
  
  // Admin endpoints
  ADMIN_LOGIN: '/admins/login',
  ADMIN_ME: '/admins/me',
  ADMINS: '/admins',
  ADMIN_BY_ID: (id) => `/admins/${id}`,
  ADMIN_DEMOTE: (id) => `/admins/${id}/demote`,
  ADMIN_PROMOTE: (id) => `/admins/${id}/promote`,
  ADMIN_PASSWORD: (id) => `/admins/${id}/password`,
  
  // Password reset endpoints
  FORGOT_PASSWORD: '/admins/forgot-password',
  VALIDATE_RESET_TOKEN: (token) => `/admins/validate-reset-token/${token}`,
  RESET_PASSWORD: '/admins/reset-password',
  
  // Password change with OTP (for logged-in users)
  REQUEST_PASSWORD_CHANGE_OTP: '/admins/change-password/request-otp',
  VERIFY_PASSWORD_CHANGE_OTP: '/admins/change-password/verify-otp',
  RESEND_PASSWORD_CHANGE_OTP: '/admins/change-password/resend-otp',
  
  // Audit Log endpoints (Super Admin only)
  AUDIT_LOGS: '/audit',
  AUDIT_STATS: '/audit/stats',
  AUDIT_ENTITY: (type, id) => `/audit/entity/${type}/${id}`,
  AUDIT_ACTOR: (id) => `/audit/actor/${id}`,
  AUDIT_EXPORT: '/audit/export',
  AUDIT_MY_ACTIVITY: '/audit/my-activity',
  AUDIT_ENUMS: '/audit/enums',
  AUDIT_BY_ID: (id) => `/audit/${id}`,
  
  // Audit Report endpoints (Super Admin only)
  AUDIT_REPORT_CURRENT_MONTH: '/audit/reports/current-month',
  AUDIT_REPORT_CUSTOM: '/audit/reports/custom',
  AUDIT_REPORT_TEST_CLEANUP: '/audit/reports/test-cleanup',
  
  // Restoration endpoints (Super Admin only)
  DELETED_RECORDS: '/restore/deleted',
  DELETED_BY_TYPE: (type) => `/restore/deleted/${type}`,
  RESTORE_STATS: '/restore/stats',
  RESTORE_PREVIEW: (type, id) => `/restore/preview/${type}/${id}`,
  RESTORE_VALIDATE: (type, id) => `/restore/validate/${type}/${id}`,
  RESTORE_RECORD: (type, id) => `/restore/${type}/${id}`,
  RESTORE_RETENTION: '/restore/retention',
  
  // Export endpoints
  EXPORT_INFO: '/export/info',
  EXPORT_SECTION: (section) => `/export/${section}`,
  EXPORT_ALL: '/export/all/combined',
  
  // Contact form
  CONTACT: '/contact',

  // Jersey Like endpoints
  JERSEY_LIKE_TOGGLE: '/jersey-likes/toggle',
  JERSEY_LIKE_STATUS: (jerseyId) => `/jersey-likes/status/${jerseyId}`,
  JERSEY_LIKE_BULK_STATUS: '/jersey-likes/bulk-status',
  JERSEY_LIKE_ANALYTICS: '/jersey-likes/analytics',
  JERSEY_LIKE_DETAILS: (jerseyId) => `/jersey-likes/details/${jerseyId}`,
  JERSEY_LIKE_RESET: (jerseyId) => `/jersey-likes/reset/${jerseyId}`,
  JERSEY_LIKE_RESTORE: (jerseyId) => `/jersey-likes/restore/${jerseyId}`,
  JERSEY_LIKE_DELETE: (jerseyId) => `/jersey-likes/${jerseyId}`,

  // Health and database monitoring endpoints
  PING: '/ping',
  HEALTH: '/health',
  DB_METRICS: '/db/metrics',

  // Gallery endpoints
  GALLERY: '/gallery',
  GALLERY_BY_ID: (id) => `/gallery/${id}`,
  GALLERY_BULK: '/gallery/bulk',
  GALLERY_REORDER: '/gallery/reorder/batch',

  // Contact Info endpoints (organization info)
  CONTACT_INFO: '/contact-info',
  CONTACT_INFO_SOCIAL: '/contact-info/social-links',

  // Contact Submissions endpoints (admin)
  CONTACT_SUBMISSIONS: '/contact/submissions',
  CONTACT_SUBMISSIONS_STATS: '/contact/submissions/stats',
  CONTACT_SUBMISSION_BY_ID: (id) => `/contact/submissions/${id}`,
  CONTACT_SUBMISSION_STATUS: (id) => `/contact/submissions/${id}/status`,

  // Upload endpoints
  UPLOAD_STATUS: '/upload/status',
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_IMAGES: '/upload/images',
  UPLOAD_DELETE: '/upload/image',

  // About page content endpoints
  ABOUT_JERSEYS: '/about-content/jerseys',
  ABOUT_JERSEYS_ALL: '/about-content/jerseys/all',
  ABOUT_JERSEY_BY_ID: (id) => `/about-content/jerseys/${id}`,
  ABOUT_JERSEYS_SEED: '/about-content/jerseys/seed',
};

// ============================================
// API SERVICE CLASS
// ============================================

/**
 * API Service class providing methods for HTTP requests
 * Handles common functionality like error handling, headers, and logging
 */
class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Creates headers object for API requests
   * @param {Object} customHeaders - Additional headers to include
   * @returns {Object} Headers object
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Attach auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Logs API request/response for debugging
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} data - Request/Response data
   */
  debugLog(method, url, data) {
    if (DEBUG_MODE) {
      console.log(`[API ${method}] ${url}`, data);
    }
  }

  /**
   * Generic request method with error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @param {number} timeout - Custom timeout in milliseconds (optional)
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}, timeout = API_TIMEOUT) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      this.debugLog(options.method || 'GET', url, options.body);

      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Auto-logout on 401 (expired / invalid token)
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('coach');
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      this.debugLog('RESPONSE', url, data);
      
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, params = {}) {
    // Build query string from params
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {number} timeout - Custom timeout in milliseconds (optional)
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data = {}, timeout = API_TIMEOUT) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, timeout);
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} Response data
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * UPLOAD request (for file uploads with FormData)
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with files
   * @param {Function} onProgress - Progress callback (optional)
   * @returns {Promise<Object>} Response data
   */
  async upload(endpoint, formData, onProgress = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress({ loaded: e.loaded, total: e.total });
          }
        });
      }
      
      // Load handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (err) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          // Handle HTTP errors
          if (xhr.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('coach');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || `HTTP Error: ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        }
      });
      
      // Error handler
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed - network error'));
      });
      
      // Abort handler
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });
      
      // Open and send request
      xhr.open('POST', url);
      
      // Set auth header (don't set Content-Type, browser will set it with boundary)
      const token = localStorage.getItem('authToken');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);
    });
  }
}

// ============================================
// EXPORT API SERVICE INSTANCE
// ============================================

/**
 * Singleton instance of ApiService
 * Use this throughout the application for API calls
 */
export const apiService = new ApiService(API_BASE_URL);

/**
 * Export timeout constants for special use cases
 */
export { REPORT_TIMEOUT };

// ============================================
// EXAMPLE USAGE (for reference)
// ============================================
/*
// In your component:

import { apiService, API_ENDPOINTS } from '../services/api';

// Fetch all tournaments
const fetchTournaments = async () => {
  try {
    const data = await apiService.get(API_ENDPOINTS.TOURNAMENTS);
    setTournaments(data.tournaments || data);
  } catch (error) {
    setError(error.message);
  }
};

// Fetch single tournament by ID
const fetchTournament = async (id) => {
  try {
    const data = await apiService.get(API_ENDPOINTS.TOURNAMENT_BY_ID(id));
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Create new tournament
const createTournament = async (tournamentData) => {
  try {
    const data = await apiService.post(API_ENDPOINTS.TOURNAMENTS, tournamentData);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
*/

export default apiService;
