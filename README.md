# Youtube Music-swg

## Descripción

Youtube Music-swg es una aplicación web que emula la interfaz y funcionalidades de YouTube Music. Construida con Astro para el framework principal, integrada con Svelte para componentes interactivos, y estilizada con Tailwind CSS. Incluye características como reproducción de música, listas de reproducción, descargas, y un reproductor persistente.

## Instalación

1. Clona el repositorio:
   ```
   git clone https://github.com/tu-usuario/Youtube-Music-swg.git
   ```
2. Instala las dependencias:
   ```
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:4321`.

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run preview`: Previsualiza la build de producción.

## Tecnologías

- Astro
- Svelte
- Tailwind CSS
- TypeScript

## Estructura del proyecto

- `src/components/`: Componentes como Player, Sidebar, Navbar, etc.
- `src/layouts/`: Layouts principales.
- `src/pages/`: Páginas como index.astro y search.astro.
- `src/utils/`: Utilidades como Logger, Emitter, etc.

## Características

- Interfaz responsive con sidebar y reproductor fijo.
- Secciones para canciones favoritas, descargas, listas de reproducción y mixes.
- Integración de QR (posiblemente para sharing).
- Panel de configuraciones.


## 📚 YouTube Music REST API – Documentación de Rutas

> `Base URL` → `http://127.0.0.1`  
> Todas las peticiones **requieren** cabecera `Authorization: <token>` salvo `/auth/:id`.  
> El SDK expone la clase `YouTubeMusicApi` y una instancia global `YTMusicApi`.

---

## 🔐 Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/{id}` | Genera y devuelve un `accessToken` para el resto de llamadas. |

---

## 🎵 Controles del Reproductor
| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/v1/previous` | — | Pasa a la canción anterior. |
| `POST` | `/api/v1/next` | — | Pasa a la siguiente canción. |
| `POST` | `/api/v1/play` | — | Reanuda la reproducción. |
| `POST` | `/api/v1/pause` | — | Pausa la reproducción. |
| `POST` | `/api/v1/toggle-play` | — | Play / Pause alternado. |
| `POST` | `/api/v1/seek-to` | `{ seconds: number }` | Salta a un segundo concreto. |
| `POST` | `/api/v1/go-back` | `{ seconds: number }` | Retrocede *n* segundos. |
| `POST` | `/api/v1/go-forward` | `{ seconds: number }` | Avanza *n* segundos. |

---

## 📢 Like / Dislike
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/like` | Marca “Me gusta” la canción actual. |
| `POST` | `/api/v1/dislike` | Marca “No me gusta” la canción actual. |

---

## 🎶 Información de la canción actual
| Método | Ruta | Respuesta | Descripción |
|--------|------|-----------|-------------|
| `GET` | `/api/v1/song` | `SongData ⎮ null` | Devuelve los metadatos de la canción en curso. |

### `SongData`
```ts
{
  album: string;
  alternativeTitle: string;
  artist: string;
  elapsedSeconds: number;
  imageSrc: string;
  isPaused: boolean;
  mediaType: 'AUDIO' | 'VIDEO';
  playlistId: string;
  songDuration: number;
  tags: string[];
  title: string;
  uploadDate: string;
  url: string;
  videoId: string;
  views: number;
}
```

---

## 📋 Gestión de la Cola
| Método | Ruta | Body / Parámetros | Descripción |
|--------|------|-------------------|-------------|
| `GET` | `/api/v1/queue` | — | Obtiene la cola (`QueueInfo`). |
| `POST` | `/api/v1/queue` | `{ videoId: string, insertPosition: "INSERT_AT_END" \| "INSERT_AFTER_CURRENT_VIDEO" }` | Añade un video a la cola. |
| `DELETE` | `/api/v1/queue` | — | Limpia **toda** la cola. |
| `DELETE` | `/api/v1/queue/{index}` | `index: number` | Elimina el elemento situado en `index`. |
| `PATCH` | `/api/v1/queue` | `{ index: number }` | Salta al índice indicado de la cola. |

### `QueueInfo`
```ts
{
  autoPlaying: boolean;
  continuation?: string;
  items: Root[]; // definido en './queue'
}
```

---

## 🔎 Búsqueda
| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/v1/search` | `SearchBody` | Busca en YouTube Music. |

### `SearchBody`
```ts
{
  query: string;
  params?: string;        // filtros de YTM (opcional)
  continuation?: string;  // paginación (opcional)
}
```

Respuesta: `YouTubeMusicSearchResponse` → estructura original simplificada a `CleanSection[]` por la capa cliente.

---

## 🔊 Volumen
| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/v1/volume` | — | Obtiene el volumen (`{ state: number }`). |
| `POST` | `/api/v1/volume` | `{ volume: number }` | Establece volumen (0-100). |
| `POST` | `/api/v1/toggle-mute` | — | Silencia / des-silencia. |

---

## 🧩 Tipos Exportados

| Tipo | Uso |
|------|-----|
| `CleanItem` | Resultado individual simplificado tras procesar la búsqueda. |
| `CleanSection` | Agrupa `CleanItem` por secciones (“Canciones”, “Álbumes”, …). |
| `RepeatMode` | `'NONE' \| 'ALL' \| 'ONE'` |
| `InsertPosition` | `'INSERT_AT_END' \| 'INSERT_AFTER_CURRENT_VIDEO'` |

---

## Ejemplo Rápido (SDK)

```ts
import { YTMusicApi } from './youtube-music-api';

await YTMusicApi.authenticate('mi-device-id'); // sólo una vez // OPCIONAL(se puede desactivar)

await YTMusicApi.addToQueue('dQw4w9WgXcQ', 'INSERT_AFTER_CURRENT_VIDEO');
const current = await YTMusicApi.getCurrentSong();
console.log(current.title); // Never Gonna Give You Up
```