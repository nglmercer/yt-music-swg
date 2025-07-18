<script lang="ts">
  import { onMount } from "svelte";
  import {emitter} from "@utils/Emitter";
  import type{ CleanItem,CleanSection } from "@utils/fetch/youtube-music";
  import { YTMusicApi } from "@utils/fetch/fetchapi";
  import { LocalStorageData } from "@components/Instances";
  // --- estado interno que podrá cambiar el cliente
  let cleanData: CleanSection[] = $state([]);

  // --- API pública que el cliente puede invocar
  export function setData(newData: CleanSection[]) {
    cleanData = newData;
    LocalStorageData.set('cleanData', newData)
  }

  function emitVideoSelected(videoId: string, target: HTMLElement) {
    console.log('emitiendo videoSelected', videoId)
    emitter.emit('videoSelected', videoId);
    YTMusicApi.addToQueue(videoId,'INSERT_AFTER_CURRENT_VIDEO');
  }
  onMount(async () => {
      if (LocalStorageData.get('cleanData')) {
        cleanData = LocalStorageData.get('cleanData') as CleanSection[];
      }
      emitter.on('dataUpdated', (newData: CleanSection[]) => {
        cleanData = newData;
        LocalStorageData.set('cleanData', newData)
      });
  })
  //YTMusicApi.clearQueue();
</script>

<div id="results-container" class="p-4">
  {#each cleanData as section}
    <div class="mb-8">
      <h2 class="text-xl md:text-2xl font-bold mb-4 text-white">{section.sectionTitle}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {#each section.items as item}
          <div
            class="group cursor-pointer"
            onclick={(e) => emitVideoSelected(item.videoId, e.currentTarget as HTMLElement)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                emitVideoSelected(item.videoId, e.currentTarget as HTMLElement);
              }
            }}
            role="button"
            tabindex="0"
            aria-label={`Reproducir ${item.title}`}
          >
            <div class="aspect-square bg-gray-700 rounded-lg mb-2 md:mb-3 relative overflow-hidden">
              <img src={item.thumbnailUrl} alt={item.title} class="w-full h-full object-cover" />
              <button
                class="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-1.5 md:p-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              >
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
            <h3 class="text-sm md:text-base font-medium truncate text-white">{item.title}</h3>
            <p class="text-sm text-gray-400 truncate">{item.subtitle}</p>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>