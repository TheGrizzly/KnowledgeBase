import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://localhost:6969/'
});

export default instance;