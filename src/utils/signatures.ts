import axios from 'axios';

interface SignatureResult {
  success: boolean;
  signature: string | null;
  error_info: string | null;
  error_message: string | null;
}

export default async function generateSignature(params: any): Promise<SignatureResult> {
  try {
    const base_url: string = import.meta.env.VITE_BACKEND_URL + '/art/get-signature';
    const response = await axios.post(base_url, params);
    const regexResult = /'(.*?)'/.exec(response.data);
    const signature = regexResult ? regexResult[1] : null;

    return {
      success: true,
      signature,
      error_info: null,
      error_message: null,
    };
  } catch (err) {
    return {
      success: false,
      signature: null,
      error_info: 'auth error',
      error_message: 'No se pude generar la firma. Inténtalo de nuevo.',
    };
  }
}
