export const helpers = {
  nextSlide: (
    currentIndex: number,
    images: { url: string }[],
    setCurrentIndex: (index: number) => void,
    infinite: boolean,
    qtyPerSlide: number
  ) => {
    return () => {
      if (qtyPerSlide > 1 && currentIndex === images.length - qtyPerSlide) {
        setCurrentIndex(0);
      } else if (infinite || currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
      }
    };
  },
  prevSlide: (
    currentIndex: number,
    images: { url: string }[],
    setCurrentIndex: (index: number) => void,
    infinite: boolean,
    qtyPerSlide: number
  ) => {
    return () => {
      if (qtyPerSlide > 1 && currentIndex === 0) {
        setCurrentIndex(images.length - qtyPerSlide);
      } else if (infinite || currentIndex > 0) {
        setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
      }
    };
  },
};
