// --- TIPOS PARA LOS DATOS LIMPIOS Y FINALES ---

/**
 * Representa un único resultado de búsqueda ya procesado y simplificado.
 */
export interface CleanItem {
  videoId: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
}

/**
 * Representa una sección de resultados (ej. "Canciones", "Álbumes")
 * que contiene una lista de items limpios.
 */
export interface CleanSection {
  sectionTitle: string;
  items: CleanItem[];
}


// --- INTERFACES PARA LA RESPUESTA COMPLEJA DE LA API (solo las partes que nos interesan) ---

interface Run {
  text: string;
}

interface Text {
  runs: Run[];
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface MusicResponsiveListItemRenderer {
  playlistItemData?: {
    videoId: string;
  };
  flexColumns: {
    musicResponsiveListItemFlexColumnRenderer: {
      text: Text;
    };
  }[];
  thumbnail?: {
    musicThumbnailRenderer: {
      thumbnail: {
        thumbnails: Thumbnail[];
      };
    };
  };
}

// Un contenedor para el renderer de cada item
interface ItemWrapper {
  musicResponsiveListItemRenderer?: MusicResponsiveListItemRenderer;
}

// Las dos estructuras de "sección" que hemos identificado
interface MusicShelfRenderer {
  title?: Text;
  contents?: ItemWrapper[];
}

interface MusicCardShelfRenderer {
  header?: {
    musicCardShelfHeaderBasicRenderer?: {
      title?: Text;
    };
  };
  contents?: ItemWrapper[];
}

// Un contenedor para los diferentes tipos de sección
interface ShelfWrapper {
  musicCardShelfRenderer?: MusicCardShelfRenderer;
  musicShelfRenderer?: MusicShelfRenderer;
}

/**
 * La estructura principal de la respuesta de la API de búsqueda.
 */
export interface YouTubeMusicSearchResponse {
  contents?: {
    tabbedSearchResultsRenderer?: {
      tabs: {
        tabRenderer?: {
          content?: {
            sectionListRenderer?: {
              contents: ShelfWrapper[];
            };
          };
        };
      }[];
    };
  };
}
export type{
  ItemWrapper,
  ShelfWrapper
}