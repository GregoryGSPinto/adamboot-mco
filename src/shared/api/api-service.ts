import { httpClient } from './http-client';
import type { AxiosRequestConfig } from 'axios';

/**
 * Resposta paginada padronizada do backend.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Serviço base para módulos da API.
 * Cada módulo cria uma instância com seu basePath.
 *
 * Uso:
 *   const cicloApi = new ApiService<CicloDto>('/ciclos-melhoria');
 *   const lista = await cicloApi.list({ page: 1, limit: 20 });
 *   const ciclo = await cicloApi.getById('uuid');
 */
export class ApiService<T> {
  constructor(private readonly basePath: string) {}

  async getById(id: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await httpClient.get<T>(`${this.basePath}/${id}`, config);
    return data;
  }

  async list(
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<PaginatedResponse<T>> {
    const { data } = await httpClient.get<PaginatedResponse<T>>(this.basePath, {
      ...config,
      params,
    });
    return data;
  }

  async create<TPayload = Partial<T>>(
    payload: TPayload,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await httpClient.post<T>(this.basePath, payload, config);
    return data;
  }

  async update<TPayload = Partial<T>>(
    id: string,
    payload: TPayload,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await httpClient.patch<T>(
      `${this.basePath}/${id}`,
      payload,
      config,
    );
    return data;
  }

  async remove(id: string, config?: AxiosRequestConfig): Promise<void> {
    await httpClient.delete(`${this.basePath}/${id}`, config);
  }

  /** Chamada customizada para actions (ex: /ciclos/:id/avancar-fase) */
  async action<TPayload, TResponse = T>(
    id: string,
    actionPath: string,
    payload?: TPayload,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const { data } = await httpClient.post<TResponse>(
      `${this.basePath}/${id}/${actionPath}`,
      payload,
      config,
    );
    return data;
  }
}
