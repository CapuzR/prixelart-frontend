import { PrixResponse } from "@prixpon/types/prixResponse.types";
import { Art } from "@prixpon/types/art.types";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchArtsByPrixer = async (username: string): Promise<Art[]> => {
  const res = await axios.post<PrixResponse>(
    `${BACKEND_URL}/art/read-by-prixer`,
    { username },
  );
  return res.data.result as Art[];
};

export const fetchTermsContent = async (): Promise<string> => {
  const res = await axios.get<{ terms: { termsAndConditions: string } }>(
    `${BACKEND_URL}/termsAndConditions/read`,
  );
  return res.data.terms.termsAndConditions;
};

export const fetchPriserTermsAgree = async (
  username: string,
): Promise<boolean> => {
  const res = await axios.get<{ termsAgree: boolean }>(
    `${BACKEND_URL}/prixer/get/${username}`,
  );
  return res.data.termsAgree;
};

export const updatePriserTermsAgree = async (
  username: string,
  termsAgree: boolean,
): Promise<PrixResponse> => {
  const res = await axios.put<PrixResponse>(
    `${BACKEND_URL}/prixer/update-terms/${username}`,
    { termsAgree },
  );
  return res.data;
};

export const updateArt = async (art: Art): Promise<PrixResponse> => {
  const res = await axios.put<PrixResponse>(
    `${BACKEND_URL}/art/update/${art.artId}`,
    {
      title: art.title,
      description: art.description,
      tags: art.tags,
      category: art.category,
      artId: art.artId,
      artType: art.artType,
      artLocation: art.artLocation,
      exclusive: art.exclusive,
      comission: Number(art.comission),
    },
  );
  return res.data;
};

export const deleteArt = async (artId: string): Promise<PrixResponse> => {
  const res = await axios.delete<PrixResponse>(
    `${BACKEND_URL}/art/delete/${artId}`,
  );
  return res.data;
};

export const toggleArtVisibility = async (
  artId: string,
  disabledReason: string,
  adminToken: string,
): Promise<PrixResponse> => {
  const res = await axios.put<PrixResponse>(
    `${BACKEND_URL}/art/disable/${artId}`,
    { art: { artId }, disabledReason, adminToken },
  );
  return res.data;
};

export const rankArt = async (
  art: Art,
  points: number,
  certificate: { code: string; serial: number; sequence: number },
  adminToken: string,
): Promise<PrixResponse> => {
  // attach your points & certificate to the payload however your backend expects
  const payload = { ...art, points, certificate };
  const res = await axios.put<PrixResponse>(
    `${BACKEND_URL}/art/rank/${art.artId}`,
    payload,
    { headers: { adminToken }, withCredentials: true },
  );
  return res.data;
};
