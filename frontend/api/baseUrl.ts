const baseUrls = {
    development: 'http://localhost:4000/api',
    staging: '',
    production: '',
    test: '',
}

const baseUrl = baseUrls[process.env.NODE_ENV || 'development'];

export default baseUrl;