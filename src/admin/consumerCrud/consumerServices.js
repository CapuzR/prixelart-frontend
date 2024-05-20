import axios from 'axios';

export const getAllConsumers = async ()=> {
    const base_url= process.env.REACT_APP_BACKEND_URL + "/consumer/read-all";
        const response = await axios.post(base_url);
        if(response.data){
            return response.data;
        } else {
            return { success: false, message: "No consumers" };
        }
}

export const getConsumerById = async (id)=> {
    const base_url= process.env.REACT_APP_BACKEND_URL + "/consumer/read";
        const response = await axios.post(base_url, id);
        if(response.data === false){
            return response.data;
        } else {
            return { result: false, message: "No consumers" };
        }
}

export const searchConsumer = async (text)=> {
    const base_url= process.env.REACT_APP_BACKEND_URL + "/consumer/read-by-query";
        const response = await axios.post(base_url, {query:text});
        if(response.data){
            return response.data;
        } else {
            return { result: false, message: "No consumers" };
        }
}

