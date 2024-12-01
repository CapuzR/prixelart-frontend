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

//TODO : Reemplazar Todos los URLSearchParams del app con este util.
export function getUrlParams(excludedParams: string[] = []): { name: string; value: string }[] {
  const searchParams = new URLSearchParams(window.location.search);
  const paramsArray: { name: string; value: string }[] = [];

  searchParams.forEach((value, key) => {
    if (!excludedParams.includes(key)) {
      paramsArray.push({ name: key, value });
    }
  });

  return paramsArray;
}

export function debounce(fn: (...args: any[]) => void, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
