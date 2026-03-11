const baseUrls = {
    development: '/api',
    staging: '',
    production: '',
    test: '',
}

const baseUrl = baseUrls[process.env.NODE_ENV || 'development'];

export default baseUrl;