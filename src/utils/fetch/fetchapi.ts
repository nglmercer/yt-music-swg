import { safeParse } from "../jsonutils/safeparse";
// Definimos los tipos para las opciones de fetch y para el cuerpo de la solicitud
type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

type RequestBody = Record<string, any> | FormData;

// Constantes de URLs con tipado explícito
const windowurl: string = typeof window !== "undefined" ? window.location.origin : "";
const baseurlApi: string = windowurl;
const PORT = '26538'
const baseurlTestApi: string = "http://localhost"+PORT; // API de desarrollo
const mockApi: string = "http://localhost"+PORT; // Otra opción de mock

// Determina la URL base de la API según el entorno
const actualBaseApi: string =
  import.meta.env.MODE === "development" ? baseurlTestApi : baseurlApi;

// --- NUEVA FUNCIÓN PARA MANEJAR RESPUESTAS ---
async function handleResponse<T>(res: Response): Promise<T | any> { // <-- CAMBIO 1: El retorno ahora es Promise<T | undefined>
  if (res.status === 204) {
    // Ahora es seguro devolver undefined porque está en el tipo de retorno.
    return Promise.resolve(undefined);
  }

  const text = await res.text();

  if (!text) {
    // También es seguro devolver undefined aquí.
    return Promise.resolve(undefined);
  }

  try {
    // Tu safeParse es ideal aquí. El resultado se casteará al tipo T.
    return safeParse(text) as T;
  } catch (error) {
    console.error("Falló el análisis de la respuesta:", error);
    return Promise.reject(new Error("La respuesta no pudo ser analizada."));
  }
}

// --- TU OBJETO HTTP MODIFICADO ---
const http = {
  get: <T>(url: string, options: FetchOptions = {}): Promise<T> => {
    return fetch(url, {
      method: 'GET',
      ...options
    }).then(handleResponse); // Usamos el manejador de respuesta
  },

  post: <T>(url: string, body: RequestBody = {}, options: FetchOptions = {}): Promise<T> => {
    if (body instanceof FormData) {
      const filteredHeaders = Object.fromEntries(
        Object.entries(options.headers || {}).filter(([key]) => key.toLowerCase() !== 'content-type')
      );

      const filteredOptions = { ...options, headers: filteredHeaders };

      return fetch(url, {
        method: 'POST',
        body: body,
        ...filteredOptions
      }).then(handleResponse); // Usamos el manejador de respuesta
    } else {
      const filteredOptions = { ...options };
      
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        body: JSON.stringify(body), // Usamos JSON.stringify para el cuerpo
        ...filteredOptions
      }).then(handleResponse); // Usamos el manejador de respuesta
    }
  },

  put: <T>(url: string, body: RequestBody = {}, options: FetchOptions = {}): Promise<T> => {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: JSON.stringify(body), // Usamos JSON.stringify para el cuerpo
      ...options
    }).then(handleResponse); // Usamos el manejador de respuesta
  },

  delete: <T>(url: string, options: FetchOptions = {}): Promise<T> => {
    return fetch(url, {
      method: 'DELETE',
      ...options
    }).then(handleResponse); // Usamos el manejador de respuesta
  }
};

// Polyfill de Storage para entornos de Server-Side Rendering (SSR)
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

/**
 * Obtiene parámetros de la URL, ya sea del query string o de la ruta.
 * @param paramNames - Nombres de los parámetros a extraer de la ruta.
 * @returns Un objeto con los parámetros.
 */
function getParams(paramNames: string[] = []): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  let paramsObject = Object.fromEntries(urlParams.entries());

  if (Object.keys(paramsObject).length === 0) {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);

    if (parts.length >= paramNames.length) {
      paramsObject = {};
      for (let i = 0; i < paramNames.length; i++) {
        paramsObject[paramNames[i]] = parts[i];
      }
    }
  }

  return paramsObject;
}
      

// Interfaces para tipar la información del usuario y los datos almacenados
interface UserInfo {
  token?: string;
  user?: Record<string, any>;
  [key: string]: any; 
}

// Clase BaseApi con tipado fuerte
class BaseApi {
  host: string;
  http: typeof http;
  token?: string;
  user: Record<string, any>;

  constructor(baseApi: string) {
    this.host = baseApi;
    this.http = http;
    const info: UserInfo = safeParse(localStorage.getItem("info")) || {};
    this.token = info.token || localStorage.getItem("token") || undefined;
    this.user = safeParse(info.user || safeParse(localStorage.getItem("user"))) || {};
  }

  /**
   * Cambia la URL base de la API.
   * @param host - La nueva URL base.
   */
  changeHost(host: string): void {
    this.host = host;
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
// --- Interfaces y Tipos para la API de YouTube Music ---

/** Modos de repetición del reproductor. */
export type RepeatMode = 'NONE' | 'ALL' | 'ONE';

/** Posición para insertar una canción en la cola. */
export type InsertPosition = 'INSERT_AT_END' | 'INSERT_AT_START';

/** Información detallada de una canción. */
export interface SongInfo {
  title: string;
  artist: string;
  views: number;
  uploadDate: string;
  imageSrc: string;
  isPaused: boolean;
  songDuration: number;
  elapsedSeconds: number;
  url: string;
  album: string;
  videoId: string;
  playlistId: string;
  mediaType: 'AUDIO' | 'VIDEO';
}

/** Información de la cola de reproducción (estructura a definir según la respuesta real). */
export interface QueueInfo {
  // El ejemplo de la API es un objeto vacío {}, así que lo dejamos flexible.
  // Podrías añadir propiedades específicas si conoces la estructura.
  [key: string]: any;
}

/** Cuerpo para la petición de búsqueda. */
export interface SearchBody {
  query: string;
  params?: string;
  continuation?: string;
}

/** Respuesta de la API de búsqueda (estructura a definir). */
export interface SearchResult {
  // El ejemplo de la API es un objeto vacío {}, así que lo dejamos flexible.
  [key: string]: any;
}


// --- Implementación de la Clase para la API de YouTube Music ---

/**
 * Clase que extiende BaseApi para interactuar con la API de YouTube Music.
 * 
 * @nota Antes de usar los métodos bajo /api/v1/*, debes autenticarte
 * llamando al método `authenticate(id)` para obtener y almacenar el token.
 */
class YouTubeMusicApi extends BaseApi {
  constructor(baseApi: string) {
    super(baseApi);
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
  async getCurrentSong(): Promise<SongInfo | null> {
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
  
  // --- Búsqueda ---

  /**
   * Busca una canción en YouTube Music.
   * @param body - El cuerpo de la solicitud con el query de búsqueda.
   * @returns Una promesa con los resultados de la búsqueda.
   */
  async search(body: SearchBody): Promise<SearchResult> {
    const url = `${this.host}/api/v1/search`;
    return this.request(this.http.post(url, body, { headers: this._authHeaders() }));
  }
}
const YTMusicApi = new YouTubeMusicApi(`http://localhost:${PORT}`);

export {
  YouTubeMusicApi,
  PORT,
  YTMusicApi
}