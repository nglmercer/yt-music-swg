function addImageSrcListenerWithCallback(
  imageId: string, 
  onSrcChange?: (newSrc: string) => void
): void {
  const image = document.getElementById(imageId) as HTMLImageElement;
  
  if (!image) {
    console.warn(`Imagen con ID '${imageId}' no encontrada`);
    return;
  }

  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    mutations.forEach((mutation: MutationRecord) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        const newSrc = (mutation.target as HTMLImageElement).src;
        onSrcChange?.(newSrc);
      }
    });
  });

  observer.observe(image, {
    attributes: true,
    attributeFilter: ['src']
  });

  if (image.src) {
    onSrcChange?.(image.src);
  }
}
export {
  addImageSrcListenerWithCallback
}