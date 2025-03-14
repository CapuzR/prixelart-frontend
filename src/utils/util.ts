export const getImageSize = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = (error) => {
      console.error(`Failed to load image ${url}`, error);
      reject(error);
    };
    img.src = url;
  });
};

export const getUrlParams = (excludedParams: string[] = []): URLSearchParams => {
  const originalSearchParams = new URLSearchParams(window.location.search);
  const filteredParams = new URLSearchParams();

  originalSearchParams.forEach((value, key) => {
    if (!excludedParams.includes(key)) {
      filteredParams.append(key, value);
    }
  });

  return filteredParams;
}