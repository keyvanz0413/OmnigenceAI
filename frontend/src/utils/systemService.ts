import { API_CONFIG } from './apiConfig';

export type ServiceStatus = 'Active' | 'Operational' | 'Connected' | 'Error' | 'Checking';

export interface SystemStatusData {
  backend: ServiceStatus;
  storage: ServiceStatus;
  gateway: ServiceStatus;
}

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const getMockSystemStatus = async (): Promise<SystemStatusData> => {
  // Check real backend status
  const isBackendRunning = await checkBackendHealth();

  return {
    backend: isBackendRunning ? 'Connected' : 'Error',
    storage: 'Active',    // Mocked for now
    gateway: 'Operational' // Mocked for now
  };
};
