import { Art } from "../../../types/art.types";

export const searchPhotos = (
  queryValue: string | null,
  categories: string[] | null,
  prixerUsername: string | null,
  globalParams: URLSearchParams
): string => {
  const basePath: string = window.location.pathname;
  const isPrixer: string | null = prixerUsername || globalParams.get('prixer');
  const prixerParam: string = isPrixer ? `?prixer=${isPrixer}` : '';
  const queryParams = new URLSearchParams();

  if (categories && categories.length > 0) {
    queryParams.append('category', categories.join(','));
  }
  if (queryValue) {
    queryParams.append('name', queryValue);
  }

  const finalPath: string = isPrixer
    ? `${basePath}/s${prixerParam}${queryParams.toString() ? '&' + queryParams.toString() : ''}`
    : `${basePath}/s${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  return finalPath;
};



export const addingToCart = (
  e: React.MouseEvent<HTMLButtonElement>,
  tile: Art,
  setSelectedArt: (tile: Art) => void
): void => {
  e.preventDefault();
  setSelectedArt(tile);
};
