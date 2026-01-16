/* eslint-disable no-undef */
import axios from 'axios';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

import useAuthStore from './useAuthStore';
import useConfigStore from './useConfigStore';
import useErrorStore, { ERROR_TYPES, ERROR_SEVERITY } from './useErrorStore';
import { appConfig, errorStoreConfig } from '../src/constant/config';

// Fungsi membuat API client dengan error handling terintegrasi
const createApiClient = ({ base_api }) => {
  const configStore = useConfigStore.getState();
  const authStore = useAuthStore.getState();
  const errorStore = useErrorStore.getState();
  const config = configStore.config;
  const userToken = authStore.userToken;

  const instance = axios.create({
    baseURL: base_api ?? config?.url_api ?? appConfig.url_api,
    timeout: 30000, // Increased timeout
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      // ...(config?.token && { token: config.token }),
    },
  });

  // Enhanced request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Set proper content type based on data type
      if (config.data instanceof FormData) {
        // Don't set Content-Type for FormData, let browser set it with boundary
        delete config.headers['Content-Type'];
      } else if (
        typeof URLSearchParams !== 'undefined' &&
        config.data instanceof URLSearchParams
      ) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (config.data && typeof config.data === 'object') {
        config.headers['Content-Type'] = 'application/json';
      }

      // Set authorization header
      const token =
        config.headers.Authorization ||
        (userToken ? `Bearer ${userToken}` : null);
      if (token) {
        config.headers['Authorization'] = token.startsWith('Bearer ')
          ? token
          : `Bearer ${token}`;
      }

      // Add platform info
      config.headers['X-Platform'] = Platform.OS;
      config.headers['X-App-Version'] = appConfig.version || '1.0.0';

      // Debug log if enabled
      if (errorStore.isDebugMode) {
        console.group(
          `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        console.log('URL:', config.baseURL + config.url);
        console.log('Method:', config.method?.toUpperCase());
        console.log('Headers:', config.headers);
        console.log('Params:', config.params);
        console.log('Data:', config.data);
        console.groupEnd();
      }

      return config;
    },
    (error) => {
      // Add request error to store
      errorStore.addError(error, ERROR_TYPES.NETWORK, ERROR_SEVERITY.HIGH, {
        phase: 'request_interceptor',
        timestamp: Date.now(),
      });
      return Promise.reject(error);
    }
  );

  // Enhanced response interceptor
  instance.interceptors.response.use(
    (response) => {
      // Debug log successful response
      if (errorStore.isDebugMode) {
        console.group(
          `✅ API Response: ${response.status} ${response.config.url}`
        );
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Data:', response.data);
        console.groupEnd();
      }
      return response;
    },
    (error) => {
      // Enhanced error handling with useErrorStore
      const { response, request, config } = error;

      if (response) {
        // Server responded with error status
        const errorContext = {
          endpoint: config?.url || '',
          method: config?.method?.toUpperCase() || '',
          statusCode: response.status,
          requestData: config?.data,
          requestParams: config?.params,
          responseData: response.data,
          timestamp: Date.now(),
          userAgent: Platform.OS,
        };

        // Add to error store based on status code
        if (response.status >= 500) {
          errorStore.addApiError(
            error,
            config?.url,
            config?.method,
            response.status,
            {
              ...errorContext,
              severity: ERROR_SEVERITY.HIGH,
              errorType: 'server_error',
            }
          );
        } else if (response.status === 401) {
          errorStore.addAuthError(error, {
            ...errorContext,
            reason: 'unauthorized',
          });
        } else if (response.status === 403) {
          errorStore.addPermissionError(error, config?.method, config?.url, {
            ...errorContext,
            reason: 'forbidden',
          });
        } else if (response.status >= 400) {
          errorStore.addApiError(
            error,
            config?.url,
            config?.method,
            response.status,
            {
              ...errorContext,
              severity: ERROR_SEVERITY.MEDIUM,
              errorType: 'client_error',
            }
          );
        }
      } else if (request) {
        // Network error (no response received)
        errorStore.addNetworkError(error, {
          endpoint: config?.url || '',
          method: config?.method?.toUpperCase() || '',
          timeout: config?.timeout,
          timestamp: Date.now(),
          errorType: 'no_response',
        });
      } else {
        // Request setup error
        errorStore.addError(error, ERROR_TYPES.RUNTIME, ERROR_SEVERITY.MEDIUM, {
          phase: 'request_setup',
          config: config,
          timestamp: Date.now(),
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Enhanced error handling dengan useErrorStore integration
const handleError = (error, showModalError = true, errorMode = 'toast') => {
  const { logout } = useAuthStore.getState();
  const { setError, addApiError, addNetworkError, addAuthError } =
    useErrorStore.getState();

  let errorInfo = {
    status: null,
    data: null,
    message: 'Terjadi kesalahan yang tidak diketahui',
    originalError: error?.response || error,
    isNetworkError: false,
    isAuthError: false,
    isServerError: false,
  };

  // Enhanced error parsing
  if (error?.isAxiosError) {
    const { response, request, config } = error;

    if (response) {
      // Server responded with error status
      errorInfo = {
        ...errorInfo,
        status: response.status,
        data: response.data,
        message:
          response.data?.message ||
          response.data?.error?.message ||
          response.statusText ||
          `HTTP ${response.status} Error`,
        isServerError: response.status >= 500,
        isAuthError: [401, 403].includes(response.status),
      };

      // Add to error store based on status
      const errorContext = {
        endpoint: config?.url || '',
        method: config?.method?.toUpperCase() || '',
        requestData: config?.data,
        requestParams: config?.params,
        userAgent: Platform.OS,
        timestamp: Date.now(),
      };

      if (response.status === 401) {
        addAuthError(error, {
          ...errorContext,
          reason: 'token_expired_or_invalid',
        });
      } else if (response.status >= 500) {
        addApiError(
          error,
          config?.url,
          config?.method,
          response.status,
          errorContext
        );
      }
    } else if (request) {
      // Network error (no response)
      errorInfo = {
        ...errorInfo,
        message:
          'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        isNetworkError: true,
      };

      addNetworkError(error, {
        endpoint: config?.url || '',
        method: config?.method?.toUpperCase() || '',
        reason: 'no_response',
        timestamp: Date.now(),
      });
    }
  } else if (error instanceof Error) {
    errorInfo.message = error.message;
  }

  // Enhanced toast/modal handling
  if (showModalError) {
    if (errorInfo.status === 401) {
      // Handle unauthorized - but don't show duplicate toast for auth errors
      if (!errorInfo.isAuthError) {
        Toast.show({
          type: 'error',
          text1: 'Sesi Berakhir',
          text2: 'Silakan login kembali untuk melanjutkan',
          position: 'bottom',
          visibilityTime: 4000,
        });
      }
      // Always logout for 401
      setTimeout(() => logout(), 1000);
    } else if (errorInfo.status === 403) {
      Toast.show({
        type: 'error',
        text1: 'Akses Ditolak',
        text2: 'Anda tidak memiliki izin untuk melakukan aksi ini',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } else if (errorInfo.isNetworkError) {
      Toast.show({
        type: 'error',
        text1: 'Koneksi Bermasalah',
        text2: errorInfo.message,
        position: 'bottom',
        visibilityTime: 5000,
      });
    } else if (errorInfo.isServerError) {
      Toast.show({
        type: 'error',
        text1: 'Server Bermasalah',
        text2: 'Mohon coba lagi dalam beberapa saat',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } else {
      // Handle other errors based on mode
      switch (errorMode) {
        case 'toast':
          Toast.show({
            type: 'error',
            text1: 'Terjadi Kesalahan',
            text2: errorInfo.message,
            position: 'bottom',
            visibilityTime: 4000,
          });
          break;
        case 'modal':
          setError({ isError: true, message: errorInfo.message });
          break;
        case 'silent':
          // Don't show any UI feedback
          break;
        default:
          Toast.show({
            type: 'error',
            text1: 'Terjadi Kesalahan',
            text2: errorInfo.message,
            position: 'bottom',
            visibilityTime: 4000,
          });
          break;
      }
    }
  }

  // Enhanced status messages
  const statusMessages = {
    400: 'Permintaan tidak valid',
    401: 'Akses ditolak - silakan login kembali',
    403: 'Anda tidak memiliki izin untuk aksi ini',
    404: 'Data yang diminta tidak ditemukan',
    408: 'Permintaan timeout - coba lagi',
    409: 'Konflik data - data mungkin sudah berubah',
    422: 'Data yang dikirim tidak valid',
    429: 'Terlalu banyak permintaan - coba lagi nanti',
    500: 'Kesalahan server internal',
    502: 'Server gateway bermasalah',
    503: 'Layanan tidak tersedia sementara',
    504: 'Gateway timeout',
  };

  return {
    ...errorInfo,
    message:
      errorInfo.message ||
      statusMessages[errorInfo.status] ||
      errorInfo.message,
  };
};
// Enhanced helper functions
const normalizeFileUri = (uri) => {
  if (!uri) return '';
  return Platform.OS === 'android' ? uri : uri.replace('file://', '');
};

// Enhanced createFormData with better validation
const createFormData = (items) => {
  if (!Array.isArray(items)) {
    console.warn('createFormData: items should be an array');
    return new FormData();
  }

  const formData = new FormData();

  items.forEach(({ key, value }, index) => {
    if (!key) {
      console.warn(`createFormData: Missing key for item at index ${index}`);
      return;
    }

    try {
      if (value?.uri) {
        // Handle file upload
        const fileData = {
          uri: normalizeFileUri(value.uri),
          name: value.fileName || value.name || `file_${Date.now()}_${index}`,
          type: value.mimeType || value.type || 'application/octet-stream',
        };
        formData.append(key, fileData);
      } else if (value === null || value === undefined) {
        // Handle null/undefined values
        formData.append(key, '');
      } else if (typeof value === 'object') {
        // Handle objects - stringify them
        formData.append(key, JSON.stringify(value));
      } else if (Array.isArray(value)) {
        // Handle arrays - either stringify or append each item
        value.forEach((item, i) => {
          if (typeof item === 'object') {
            formData.append(`${key}[${i}]`, JSON.stringify(item));
          } else {
            formData.append(`${key}[${i}]`, String(item));
          }
        });
      } else {
        // Handle primitive values
        formData.append(key, String(value));
      }
    } catch (error) {
      console.error(`createFormData: Error processing key "${key}":`, error);
      // Add error to store but don't break the process
      const { addError } = useErrorStore.getState();
      addError(error, ERROR_TYPES.RUNTIME, ERROR_SEVERITY.LOW, {
        context: 'createFormData',
        key,
        value: typeof value,
      });
    }
  });

  return formData;
};

// Enhanced debug handler with better formatting
const handleDebug = (
  context = '',
  data = {},
  isDebug = false,
  url = '',
  level = 'log'
) => {
  if (!isDebug) return;

  const timestamp = new Date().toISOString();
  const contextTitle = `[DEBUG ${timestamp}] ${context} - ${url}`;

  if (console.groupCollapsed) {
    console.groupCollapsed(contextTitle);
  } else {
    console.log(contextTitle);
  }

  // Enhanced data logging
  for (const [key, value] of Object.entries(data)) {
    try {
      if (level === 'error' && key === 'error') {
        console.error(`${key}:`, value);
      } else if (key === 'headers' && typeof value === 'object') {
        console.log(`${key}:`, JSON.stringify(value, null, 2));
      } else if (typeof value === 'object' && value !== null) {
        console.log(`${key}:`, value);
      } else {
        console[level](`${key}:`, value);
      }
    } catch (logError) {
      console.warn(`Failed to log ${key}:`, logError);
    }
  }

  if (console.groupEnd) {
    console.groupEnd();
  }
};

// Utility function to validate and normalize request parameters (for future use)
const _normalizeRequestParams = ({
  url,
  body = null,
  params = {},
  headers = {},
  token = null,
  bodyType = 'json',
  debug = false,
  showToast = true,
  handleErrorStatus = true,
  modeShowError = 'toast',
  ...extraOptions
}) => {
  // Validate required parameters
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required and must be a string');
  }

  // Normalize headers
  const normalizedHeaders = {
    ...headers,
    ...(token && {
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
    }),
  };

  // Normalize body based on bodyType
  let normalizedBody = body;
  if (bodyType === 'form-data' && body) {
    normalizedBody = Array.isArray(body) ? createFormData(body) : body;
  }

  return {
    url: url.trim(),
    body: normalizedBody,
    params: params || {},
    headers: normalizedHeaders,
    bodyType,
    debug: Boolean(debug),
    showToast: Boolean(showToast),
    handleErrorStatus: Boolean(handleErrorStatus),
    modeShowError: ['toast', 'modal', 'silent'].includes(modeShowError)
      ? modeShowError
      : 'toast',
    ...extraOptions,
  };
};

export const createHttpHelperFunctions = () => {
  const { debug: debugFromStore } = useConfigStore.getState();
  const errorStore = useErrorStore.getState();

  // Use debug mode from error store (which now uses config) with fallbacks
  const defaultDebugMode =
    errorStore.isDebugMode || debugFromStore || errorStoreConfig.isDebugMode;

  const POST = async ({
    url,
    baseUrl = '', // Menambahkan parameter baseUrl untuk memungkinkan URL penuh
    body = null,
    params = {},
    headers = {},
    bodyType = 'json',
    debug = defaultDebugMode,
    showToast = true,
    handleErrorStatus = true,
    modeShowError = 'toast',
    onUploadProgress = null,
    timeout = null,
    token = null,
  }) => {
    try {
      const api = createApiClient({ base_api: baseUrl });

      // Enhanced debug logging
      if (debug) {
        handleDebug(
          'POST Request',
          {
            url,
            params,
            headers,
            bodyType,
            bodySize: body
              ? typeof body === 'string'
                ? body.length
                : 'FormData/Object'
              : 0,
          },
          debug,
          url
        );
      }

      // Prepare request data based on bodyType
      let requestData = body;
      let requestHeaders = { ...headers };

      if (bodyType === 'form-data' && body) {
        requestData = Array.isArray(body) ? createFormData(body) : body;
        // Don't set Content-Type for FormData, let browser handle it
        delete requestHeaders['Content-Type'];
      }

      const response = await api.post(url ? url : '', requestData, {
        params,
        headers: {
          ...requestHeaders,
          ...(token && {
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          }),
        },
        onUploadProgress,
        ...(timeout && { timeout }),
      });

      // Debug response
      if (debug) {
        handleDebug(
          'POST Response',
          {
            status: response.status,
            statusText: response.statusText,
            dataSize: response.data ? JSON.stringify(response.data).length : 0,
          },
          debug,
          url
        );
      }

      // Show success toast if enabled
      if (showToast && response.status === 200 && response.data?.message) {
        Toast.show({
          type: 'success',
          text1: 'Berhasil',
          text2: response.data.message,
          position: 'bottom',
          visibilityTime: 3000,
        });
      }

      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        config: response.config,
      };
    } catch (error) {
      if (debug) {
        handleDebug(
          'POST Error',
          { error: error.message },
          debug,
          url,
          'error'
        );
      }
      throw handleError(error, handleErrorStatus, modeShowError);
    }
  };

  const GET = async ({
    url,
    params = {},
    headers = {},
    showToast = false, // Default false for GET
    debug = defaultDebugMode,
    token = null,
    handleErrorStatus = true,
    modeShowError = 'toast',
    timeout = null,
    cacheBuster = false,
  }) => {
    try {
      const api = createApiClient();

      // Add cache buster if requested
      const finalParams = cacheBuster ? { ...params, _t: Date.now() } : params;

      if (debug) {
        handleDebug(
          'GET Request',
          {
            url,
            params: finalParams,
            headers,
            cacheBuster,
          },
          debug,
          url
        );
      }

      const response = await api.get(url, {
        params: finalParams,
        headers: {
          ...headers,
          ...(token && {
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          }),
        },
        ...(timeout && { timeout }),
      });

      if (debug) {
        handleDebug(
          'GET Response',
          {
            status: response.status,
            statusText: response.statusText,
            dataSize: response.data ? JSON.stringify(response.data).length : 0,
          },
          debug,
          url
        );
      }

      // Show success toast only if explicitly requested for GET
      if (
        showToast &&
        [200, 201].includes(response.status) &&
        response.data?.message
      ) {
        Toast.show({
          type: 'success',
          text1: 'Data berhasil dimuat',
          text2: response.data.message,
          visibilityTime: 2000,
          position: 'bottom',
        });
      }

      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        config: response.config,
      };
    } catch (error) {
      if (debug) {
        handleDebug('GET Error', { error: error.message }, debug, url, 'error');
      }
      throw handleError(error, handleErrorStatus, modeShowError);
    }
  };

  const DELETE = async ({
    url,
    params = {},
    body = null,
    headers = {},
    debug = defaultDebugMode,
    showToast = true,
    modeShowError = 'toast',
    handleErrorStatus = true,
    token = null,
    timeout = null,
  }) => {
    try {
      const api = createApiClient();

      if (debug) {
        handleDebug(
          'DELETE Request',
          {
            url,
            params,
            headers,
            hasBody: !!body,
          },
          debug,
          url
        );
      }

      const response = await api.delete(url, {
        params,
        data: body,
        headers: {
          ...headers,
          ...(token && {
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          }),
        },
        ...(timeout && { timeout }),
      });

      if (debug) {
        handleDebug(
          'DELETE Response',
          {
            status: response.status,
            statusText: response.statusText,
          },
          debug,
          url
        );
      }

      if (showToast && response.data?.message) {
        Toast.show({
          type: 'success',
          text1: 'Berhasil Dihapus',
          text2: response.data.message,
          visibilityTime: 2000,
          position: 'bottom',
        });
      }

      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        config: response.config,
      };
    } catch (error) {
      if (debug) {
        handleDebug(
          'DELETE Error',
          { error: error.message },
          debug,
          url,
          'error'
        );
      }
      throw handleError(error, handleErrorStatus, modeShowError);
    }
  };

  const PUT = async ({
    url,
    params = {},
    body = null,
    headers = {},
    debug = defaultDebugMode,
    showToast = true,
    bodyType = 'json',
    modeShowError = 'toast',
    handleErrorStatus = true,
    token = null,
    timeout = null,
    onUploadProgress = null,
  }) => {
    try {
      const api = createApiClient();

      if (debug) {
        handleDebug(
          'PUT Request',
          {
            url,
            params,
            headers,
            bodyType,
            hasBody: !!body,
          },
          debug,
          url
        );
      }

      // Prepare request data based on bodyType
      let requestData = body;
      let requestHeaders = { ...headers };

      if (bodyType === 'form-data' && body) {
        requestData = Array.isArray(body) ? createFormData(body) : body;
        delete requestHeaders['Content-Type'];
      }

      const response = await api.put(url, requestData, {
        params,
        headers: {
          ...requestHeaders,
          ...(token && {
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          }),
        },
        onUploadProgress,
        ...(timeout && { timeout }),
      });

      if (debug) {
        handleDebug(
          'PUT Response',
          {
            status: response.status,
            statusText: response.statusText,
          },
          debug,
          url
        );
      }

      if (showToast && response.data?.message) {
        Toast.show({
          type: 'success',
          text1: 'Berhasil Diperbarui',
          text2: response.data.message,
          visibilityTime: 2000,
          position: 'bottom',
        });
      }

      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        config: response.config,
      };
    } catch (error) {
      if (debug) {
        handleDebug('PUT Error', { error: error.message }, debug, url, 'error');
      }
      throw handleError(error, handleErrorStatus, modeShowError);
    }
  };

  // Enhanced PATCH method (often needed for partial updates)
  const PATCH = async ({
    url,
    params = {},
    body = null,
    headers = {},
    debug = defaultDebugMode,
    showToast = true,
    bodyType = 'json',
    modeShowError = 'toast',
    handleErrorStatus = true,
    token = null,
    timeout = null,
  }) => {
    try {
      const api = createApiClient();

      if (debug) {
        handleDebug(
          'PATCH Request',
          {
            url,
            params,
            headers,
            bodyType,
            hasBody: !!body,
          },
          debug,
          url
        );
      }

      // Prepare request data
      let requestData = body;
      let requestHeaders = { ...headers };

      if (bodyType === 'form-data' && body) {
        requestData = Array.isArray(body) ? createFormData(body) : body;
        delete requestHeaders['Content-Type'];
      }

      const response = await api.patch(url, requestData, {
        params,
        headers: {
          ...requestHeaders,
          ...(token && {
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          }),
        },
        ...(timeout && { timeout }),
      });

      if (debug) {
        handleDebug(
          'PATCH Response',
          {
            status: response.status,
            statusText: response.statusText,
          },
          debug,
          url
        );
      }

      if (showToast && response.data?.message) {
        Toast.show({
          type: 'success',
          text1: 'Berhasil Diperbarui',
          text2: response.data.message,
          visibilityTime: 2000,
          position: 'bottom',
        });
      }

      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        config: response.config,
      };
    } catch (error) {
      if (debug) {
        handleDebug(
          'PATCH Error',
          { error: error.message },
          debug,
          url,
          'error'
        );
      }
      throw handleError(error, handleErrorStatus, modeShowError);
    }
  };

  return { POST, GET, DELETE, PUT, PATCH };
};
