import axios from 'axios';


export default async function generateSignature(params) {
    try{
    const base_url= process.env.REACT_APP_BACKEND_URL + "/art/get-signature";
    const data = await axios.post(base_url, params);
  
    return {
      success: true,
      signature: /'(.*?)'/.exec(data.data)[1],
      error_info: null, 
      error_message: null
    };
    } catch(err) {
      return {
        success: false,
        signature: null,
        error_info: 'auth error', 
        error_message: 'No se pude generar la firma. Inténtalo de nuevo.'
      };
    }
  }

//   module.exports = {generateSignature}