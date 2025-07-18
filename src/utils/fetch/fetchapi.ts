import { safeParse } from "@utils/jsonutils/safeparse";
import type { 
  CleanItem, 
  CleanSection, 
  ItemWrapper, 
  ShelfWrapper, 
  YouTubeMusicSearchResponse,
  QueueInfo,
  SongData,
} from './youtube-music';
import {
  http
} from '@utils/fetch/commons/httpservice';
import apiConfig from './config/apiConfig';
interface UserInfo {
  token?: string;
  user?: Record<string, any>;
  [key: string]: any; 
}
apiConfig.update({
  host: "127.0.0.1"
});
// Polyfill (SSR)
const ssrSafeStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null
};

// Se asigna el localStorage real si está en el navegador, si no, el polyfill
const localStorage: Storage = typeof window !== 'undefined' 
  ? (window.localStorage || ssrSafeStorage) 
  : ssrSafeStorage;

class BaseApi {
  // Ya no guardamos 'host' como un string. Guardamos una referencia a la configuración.
  private config: typeof apiConfig;
  http: typeof http;
  token?: string;
  user: Record<string, any>;

  // El constructor ahora recibe el módulo de configuración
  constructor(config: typeof apiConfig) {
    this.config = config; // <-- Guarda la referencia
    this.http = http;

    const info:UserInfo = safeParse(localStorage.getItem("info")) || {};
    this.token = info.token || localStorage.getItem("token") || undefined;
    this.user = safeParse(info.user || safeParse(localStorage.getItem("user"))) || {};
  }

  /**
   * Devuelve la URL base actual obtenida desde el módulo de configuración.
   * Esto asegura que siempre usemos los valores más recientes.
   */
  get host(): string {
    return this.config.getFullUrl();
  }
  /**
   * Método para actualizar la configuración de la API dinámicamente.
   * Delega la lógica de actualización al módulo de configuración.
   * @param newConfig - Un objeto con las propiedades a cambiar (host, port).
   */
  updateConfig(newConfig: { host?: string; port?: number | string }): void {
    this.config.update(newConfig);
  }

  /**
   * Genera las cabeceras de autenticación.
   * @param contentType - El tipo de contenido de la solicitud.
   * @returns Un objeto con las cabeceras.
   */
  protected _authHeaders(contentType: string | null = 'application/json'): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `${this.token}`
    };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    return headers;
  }

  /**
   * Envuelve una promesa de solicitud a la API para manejar errores de forma centralizada.
   * @param promise - La promesa de fetch a ejecutar.
   * @returns La promesa con el resultado de la API.
   */
  async request<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      console.error('Error en la llamada a la API:', error);
      throw error;
    }
  }
}

export type RepeatMode = 'NONE' | 'ALL' | 'ONE';

/** Posición para insertar una canción en la cola. */
const VALID_INSERT_POSITIONS = ['INSERT_AT_END', 'INSERT_AFTER_CURRENT_VIDEO'] as const;
export function isValidInsertPosition(value: string): value is InsertPosition {
  return VALID_INSERT_POSITIONS.includes(value as InsertPosition);
}
export type InsertPosition = typeof VALID_INSERT_POSITIONS[number];
export interface SearchBody {
  query: string;
  params?: string;
  continuation?: string;
}

export interface VolumeLevel {
  state: number
}

class YouTubeMusicApi extends BaseApi {
  constructor(config: typeof apiConfig) {
    super(config);
  }

  // --- Autenticación ---

  /**
   * Obtiene un token de acceso para autorizar las llamadas a la API.
   * @param id - El identificador para la autenticación.
   * @returns Una promesa que se resuelve cuando la autenticación es exitosa.
   */
  async authenticate(id: string): Promise<void> {
    // Este endpoint es especial, no usa el token de autorización.
    const url = `${this.host}/auth/${id}`;
    const response = await this.request<{ accessToken: string }>(
      this.http.post(url, {})
    );
    if (response.accessToken) {
      this.token = response.accessToken;
      // Opcional: Persistir el nuevo token si se desea
      // localStorage.setItem("token", this.token); 
    }
  }
  
  // --- Controles del Reproductor ---

  /** Reproduce la canción anterior en la cola. */
  async previous(): Promise<void> {
    const url = `${this.host}/api/v1/previous`;
    return this.request(this.http.post(url, {}, { headers: this._authHeaders() }));
  }

  /** Reproduce la siguiente canción en la cola. */
  async next(): Promise<void> {
    const url = `${this.host}/api/v1/next`;
    return this.request(this.http.post(url, {}, { headers: this._authHeaders() }));
  }

  /** Cambia el estado del reproductor a "play". */
  async play(): Promise<void> {
    const url = `${this.host}/api/v1/play`;
    return this.request(this.http.post(url, {}, { headers: this._authHeaders() }));
  }

  /** Cambia el estado del reproductor a "pause". */
  async pause(): Promise<void> {
    const url = `${this.host}/api/v1/pause`;
    return this.request(this.http.post(url, {}, { headers: this._authHeaders() }));
  }
  
  /** Alterna entre reproducción y pausa. */
  async togglePlay(): Promise<void> {
    const url = `${this.host}/api/v1/toggle-play`;
    return this.request(this.http.post(url, {}, { headers: this._authHeaders() }));
  }

  /** Busca un momento específico en la canción actual.
   * @param seconds - El tiempo en segundos al que saltar.
   */
  async seekTo(seconds: number): Promise<void> {
    const url = `${this.host}/api/v1/seek-to`;
    return this.request(this.http.post(url, { seconds }, { headers: this._authHeaders() }));
  }

  /** Retrocede la canción actual un número de segundos.
   * @param seconds - El número de segundos a retroceder.
   */
  async goBack(seconds: number): Promise<void> {
    const url = `${this.host}/api/v1/go-back`;
    return this.request(this.http.post(url, { seconds }, { headers: this._authHeaders() }));
  }

  /** Avanza la canción actual un número de segundos.
   * @param seconds - El número de segundos a avanzar.
   */
  async goForward(seconds: number): Promise<void> {
    const url = `${this.host}/api/v1/go-forward`;
    return this.request(this.http.post(url, { seconds }, { headers: this._authHeaders() }));
  }

  // --- Información de la Canción ---

  /** Marca la canción actual como "me gusta". */
  async likeSong(): Promise<void> {
    const url = `${this.host}/api/v1/like`;
    return this.request(this.http.post(url, {}, { headers: this._authHeaders() }));
  }

  /** Marca la canción actual como "no me gusta". */
  async dislikeSong(): Promise<void> {
    const url = `${this.host}/api/v1/dislike`;
    return this.request(this.http.post(url, {}, { headers: this._authHeaders() }));
  }

  /** Obtiene la información de la canción actual.
   * @returns Una promesa con la información de la canción o `null` si no hay.
   */
  async getCurrentSong(): Promise<SongData | null> {
    const url = `${this.host}/api/v1/song`;
    return this.request(this.http.get(url, { headers: this._authHeaders() }));
  }
  
  // --- Gestión de la Cola ---

  /** Obtiene la información de la cola de reproducción actual.
   * @returns Una promesa con la información de la cola o `null` si está vacía.
   */
  async getQueue(): Promise<QueueInfo | null> {
    const url = `${this.host}/api/v1/queue`;
    return this.request(this.http.get(url, { headers: this._authHeaders() }));
  }

  /** Añade una canción a la cola de reproducción.
   * @param videoId - El ID del video a añadir.
   * @param insertPosition - Dónde insertar la canción.
   */
  async addToQueue(videoId: string, insertPosition: InsertPosition = 'INSERT_AT_END'): Promise<void> {
    // Validación adicional (opcional)
    if (!isValidInsertPosition(insertPosition)) {
      throw new Error(`Invalid insertPosition: ${insertPosition}. Valid options: ${VALID_INSERT_POSITIONS.join(', ')}`);
    }
    
    const url = `${this.host}/api/v1/queue`;
    const body = { videoId, insertPosition };
    return this.request(this.http.post(url, body, { headers: this._authHeaders() }));
  }

  /** Limpia la cola de reproducción. */
  async clearQueue(): Promise<void> {
    const url = `${this.host}/api/v1/queue`;
    return this.request(this.http.delete(url, { headers: this._authHeaders() }));
  }
  
  /** Elimina una canción específica de la cola.
   * @param index - El índice de la canción a eliminar.
   */
  async removeQueueItem(index: number): Promise<void> {
    const url = `${this.host}/api/v1/queue/${index}`;
    return this.request(this.http.delete(url, { headers: this._authHeaders() }));
  }
  async setQueueIndex(index:number) {
    const url = `${this.host}/api/v1/queue`;
    return this.request(this.http.patch(url, {index}, { headers: this._authHeaders() }));
  }
  // --- Búsqueda ---

  /**
   * Busca una canción en YouTube Music.
   * @param body - El cuerpo de la solicitud con el query de búsqueda.
   * @returns Una promesa con los resultados de la búsqueda.
   */
  async search(body: SearchBody): Promise<YouTubeMusicSearchResponse> {
    const url = `${this.host}/api/v1/search`;
    return this.request(this.http.post(url, body, { headers: this._authHeaders() }));
  }
  // --- volume ---
  async getVolume(): Promise<VolumeLevel> {
    const url = `${this.host}/api/v1/volume`;
    return this.request(this.http.get(url, { headers: this._authHeaders() }));
  }
  async setVolume(volume: number): Promise<void> {
    const url = `${this.host}/api/v1/volume`;
    return this.request(this.http.post(url, { volume }, { headers: this._authHeaders() }));
  }
  //toggle-mute
  async toggleMute(): Promise<void> {
    const url = `${this.host}/api/v1/toggle-mute`;
    return this.request(this.http.post(url, {}, { headers: this._authHeaders() }));
  }
}
const YTMusicApi = new YouTubeMusicApi(apiConfig);
console.log("apiConfig",apiConfig.getFullUrl())
export {
  YouTubeMusicApi,
  YTMusicApi
}