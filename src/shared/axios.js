import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

// Add a request interceptor

instance.interceptors.request.use(config => {
    // Insert authorization token on request call
    const auth_token = localStorage.getItem('auth_token');
    if( auth_token ) config.headers['Authorization'] = auth_token;

    return config;
}, error => {
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use( response => {
    return response;
}, error => {
    return Promise.reject(error.response);
});

export default instance;
