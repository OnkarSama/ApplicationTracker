import applicationEndpoints from './application'
import sessionEndpoints from './session'
import userEndpoints from './user'
import signupEndpoints from './signup'

const endpoints = {
    applications : applicationEndpoints,
    sessions : sessionEndpoints,
    users : userEndpoints,
    signup : signupEndpoints,

}

export default endpoints;