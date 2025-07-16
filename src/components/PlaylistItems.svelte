<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Root } from '../utils/fetch/queue';

  // Datos iniciales (pueden estar vacíos o ser un mock)
  let playlistItems: Root[] = [];

  // Método para actualizar los elementos de la lista de reproducción
  const updatePlaylist = (event: CustomEvent<Root[]>) => {
    console.log('Playlist actualizada:', event.detail);
    playlistItems = event.detail;
  };

  // Escuchar el evento personalizado en el lado del cliente
  onMount(() => {
    // Definimos la función de una manera que pueda ser añadida y eliminada
    const handleUpdate = (event: Event) => {
      updatePlaylist(event as CustomEvent<Root[]>);
    };

    window.addEventListener('updatePlaylist', handleUpdate);

    // Limpiar el event listener cuando el componente se destruye
    return () => {
      window.removeEventListener('updatePlaylist', handleUpdate);
    };
  });

  // Función para simular una actualización de datos
  // En una aplicación real, esto podría ser llamado desde cualquier lugar
  const simulateUpdate = () => {
    const newData: Root[] = [
      // Aquí puedes añadir datos de ejemplo que cumplan con la interfaz Root
      // Por ejemplo:
      {
        playlistPanelVideoRenderer: {
            title: { runs: [{ text: 'Nuevo Video 1' }] },
            longBylineText: { runs: [{ text: 'Artista del Nuevo Video 1' }] },
            thumbnail: { thumbnails: [{ url: 'https://via.placeholder.com/120x90', width: 120, height: 90 }] },
            lengthText: { runs: [{ text: '4:30' }], accessibility: { accessibilityData: { label: '4 minutos 30 segundos' } } },
            videoId: 'newVideoId1',
            selected: false,
            // ... (rellena otros campos necesarios)
        } as any // Usamos 'as any' para simplificar el ejemplo
      },
      {
        playlistPanelVideoRenderer: {
            title: { runs: [{ text: 'Nuevo Video 2' }] },
            longBylineText: { runs: [{ text: 'Artista del Nuevo Video 2' }] },
            thumbnail: { thumbnails: [{ url: 'https://via.placeholder.com/120x90', width: 120, height: 90 }] },
            lengthText: { runs: [{ text: '3:15' }], accessibility: { accessibilityData: { label: '3 minutos 15 segundos' } } },
            videoId: 'newVideoId2',
            selected: true,
            // ... (rellena otros campos necesarios)
        } as any // Usamos 'as any' para simplificar el ejemplo
      }
    ];

    const event = new CustomEvent('updatePlaylist', { detail: newData });
    window.dispatchEvent(event);
  };
</script>

<div class="p-4 bg-gray-900 text-white min-h-screen">
  <h1 class="text-2xl font-bold mb-4">Mi Lista de Reproducción</h1>

  <button
    on:click={simulateUpdate}
    class="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
  >
    Simular Actualización de Playlist
  </button>

  {#if playlistItems.length > 0}
    <ul class="space-y-2">
      {#each playlistItems as item (item.playlistPanelVideoRenderer.videoId)}
        {@const video = item.playlistPanelVideoRenderer}
        <li
          class="flex items-center p-2 rounded-lg transition-colors"
          class:bg-gray-700={video.selected}
          class:hover:bg-gray-800={!video.selected}
        >
          <img
            src={video.thumbnail.thumbnails[0].url}
            alt="Miniatura de {video.title.runs[0].text}"
            class="w-20 h-15 object-cover rounded mr-4"
          />
          <div class="flex-grow">
            <h3 class="font-semibold text-lg">{video.title.runs[0].text}</h3>
            <p class="text-gray-400 text-sm">{video.longBylineText.runs[0].text}</p>
          </div>
          <span class="text-gray-400 text-sm">{video.lengthText.runs[0].text}</span>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-gray-500">La lista de reproducción está vacía.</p>
  {/if}
</div>