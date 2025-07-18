import type { 
  CleanItem, 
  CleanSection, 
  ItemWrapper, 
  ShelfWrapper, 
  YouTubeMusicSearchResponse 
} from './youtube-music';

/**
 * Extrae y simplifica los datos de un solo elemento de la lista de resultados.
 * @param itemWrapper - El objeto que contiene el musicResponsiveListItemRenderer.
 * @returns Un objeto CleanItem con los datos o null si falta información esencial.
 */
function extractItemData(itemWrapper: ItemWrapper): CleanItem | null {
  const renderer = itemWrapper.musicResponsiveListItemRenderer;
  if (!renderer) return null;

  try {
    const videoId = renderer.playlistItemData?.videoId;
    const title = renderer.flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.text;
    const subtitle = renderer.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
      .map(run => run.text)
      .join('');

    const thumbnails = renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails;
    const thumbnailUrl = thumbnails?.[thumbnails.length - 1]?.url;

    // Solo retornamos el objeto si tenemos todos los datos esenciales
    if (videoId && title && subtitle && thumbnailUrl) {
      return { videoId, title, subtitle, thumbnailUrl };
    }
    
    return null;
  } catch (e) {
    console.error("Error parseando un item:", e, itemWrapper);
    return null;
  }
}

/**
 * Transforma la respuesta completa de la API en una estructura de datos simple y organizada.
 * @param responseData - El objeto de respuesta completo de la API de YouTube Music.
 * @returns Un array de secciones limpias (CleanSection[]).
 */
export function parseYouTubeMusicResponse(responseData: YouTubeMusicSearchResponse): CleanSection[] {
  const shelves = responseData?.contents?.tabbedSearchResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents;

  if (!shelves) {
    console.error("No se encontró la ruta de contenido esperada en el JSON.");
    return [];
  }

  const results: CleanSection[] = [];

  shelves.forEach((shelf: ShelfWrapper) => {
    let sectionTitle: string | undefined;
    let items: (CleanItem | null)[] = [];

    // Maneja la sección de "Mejor resultado"
    if (shelf.musicCardShelfRenderer) {
      const card = shelf.musicCardShelfRenderer;
      sectionTitle = card.header?.musicCardShelfHeaderBasicRenderer?.title?.runs[0]?.text || "Mejor Resultado";
      items = (card.contents || []).map(extractItemData);
    } 
    // Maneja las secciones estándar (Canciones, Videos, etc.)
    else if (shelf.musicShelfRenderer) {
      const shelfRenderer = shelf.musicShelfRenderer;
      sectionTitle = shelfRenderer.title?.runs[0]?.text;
      items = (shelfRenderer.contents || []).map(extractItemData);
    }

    // Usamos un "type guard" para filtrar los nulos y que TypeScript sepa que el array resultante solo contiene CleanItem
    const validItems: CleanItem[] = items.filter((item): item is CleanItem => item !== null);

    if (sectionTitle && validItems.length > 0) {
      results.push({ sectionTitle, items: validItems });
    }
  });

  return results;
}