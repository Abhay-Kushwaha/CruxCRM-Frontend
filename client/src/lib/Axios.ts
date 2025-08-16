import axios from 'axios';

const Axios = axios.create({
    baseURL: process.env.Backend_url,
    withCredentials: true
})

export default Axios;
