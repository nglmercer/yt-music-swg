<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { SongData } from "../utils/fetch/youtube-music"; // Asegúrate de que esta ruta de importación sea correcta en tu proyecto
  import { YTMusicApi } from "../utils/fetch/fetchapi";
  async function getdata(number:number) {
    let result;
    if (Number(number) >= 0) {
        result = await YTMusicApi.next();
    } else {
        result = await YTMusicApi.previous();
    }
    console.log("result", result);
    return result;
  }
  // --- ESTADO DEL COMPONENTE ---

  // El estado reactivo principal que almacena los datos de la canción.
  // Comienza como `null` para indicar que no hay ninguna canción activa.
  let songData: SongData | null = null;


</script>
