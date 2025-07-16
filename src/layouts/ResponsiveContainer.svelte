<!-- ResponsiveContainer.svelte -->
<script>
  // No se necesita lógica de JavaScript para este componente de diseño.
</script>

<div class="w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
    
    <!-- Slot para el contenido de la izquierda (Imagen) -->
    <div class="lg:col-span-2">
      <slot name="left-content"></slot>
    </div>

    <!-- Slot para el contenido de la derecha (Lista) -->
    <div class="lg:col-span-3">
      <slot name="right-content"></slot>
    </div>

  </div>
</div>