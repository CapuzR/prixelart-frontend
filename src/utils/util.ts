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