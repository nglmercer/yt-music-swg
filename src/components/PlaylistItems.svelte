<script lang="ts">
  import { onMount } from 'svelte';
  import type { Root, PlaylistPanelVideoRenderer } from '../utils/fetch/queue';
  import { emitter } from '@utils/Emitter';
  import { YTMusicApi } from '@utils/fetch/fetchapi';
  let playlistItems: Root[] = [];

  onMount(() => {
    emitter.on('updatePlaylist', (data: Root[]) => {
      if (!data) return;
      playlistItems = data;
    });
  });

  function play(data:PlaylistPanelVideoRenderer,index:number) {
    const id = data.videoId
    console.log("play",data,index);
/*     emitter.emit('playVideo', id);

*/
    YTMusicApi.setQueueIndex(index)
  }

  // Optional: allow Space/Enter to trigger the click
  function handleKey(e: KeyboardEvent, data: PlaylistPanelVideoRenderer,index:number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      play(data,index);
    }
  }
</script>

<div class="flex flex-col h-dvh bg-gray-900 text-white">
  <h1 class="p-4 text-2xl font-bold shrink-0">Mi Lista de Reproducción</h1>

  <div class="flex-1 overflow-y-auto px-4 pb-4">
    {#if playlistItems.length}
      <ul class="space-y-2">
        {#each playlistItems as item (item.playlistPanelVideoRenderer.videoId)}
          {@const video = item.playlistPanelVideoRenderer}

          <li>
            <button
              type="button"
              class="w-full flex items-center p-2 rounded-lg text-left transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                     {video.selected ? 'bg-gray-700' : 'hover:bg-gray-800'}"
              on:click={() => play(video,playlistItems.indexOf(item))}
              on:keydown={(e) => handleKey(e, video,playlistItems.indexOf(item))}
            >
              <img
                src={video.thumbnail.thumbnails[0].url}
                alt=""
                class="w-16 object-cover rounded mr-4 aspect-square"
              />
              <div class="flex-grow">
                <h3 class="font-semibold text-lg">{video.title.runs[0].text}</h3>
                <p class="text-gray-400 text-sm">{video.longBylineText.runs[0].text}</p>
              </div>
              <span class="text-gray-400 text-sm">{video.lengthText.runs[0].text}</span>
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-gray-500">La lista de reproducción está vacía.</p>
    {/if}
  </div>
</div>