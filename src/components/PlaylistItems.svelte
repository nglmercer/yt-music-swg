<script lang="ts">
  import { onMount } from 'svelte';
  import type { Root } from '../utils/fetch/queue';
  import { emitter } from '@utils/Emitter';
  let playlistItems: Root[] = [];

  const eventName = 'updatePlaylist';
  onMount(() => {

    emitter.on(eventName, (data:Root[])=>{
      console.log(eventName, data);
      if (!data) return;
      playlistItems = data;
    });
  });
</script>

<!-- Ocupará exactamente 100 vh -->
<div class="flex flex-col h-screen bg-gray-900 text-white">
  <h1 class="p-4 text-2xl font-bold shrink-0">Mi Lista de Reproducción</h1>

  <!-- Scroll solo en esta sección -->
  <div class="flex-1 overflow-y-auto px-4 pb-4">
    {#if playlistItems.length}
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
</div>