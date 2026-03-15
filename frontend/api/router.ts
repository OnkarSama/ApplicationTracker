import applicationEndpoints from './application'
import sessionEndpoints from './session'
import userEndpoints from './user'
import signupEndpoints from './signup'
import profileEndpoints from './profile'

const endpoints = {
    applications : applicationEndpoints,
    sessions : sessionEndpoints,
    users : userEndpoints,
    signup : signupEndpoints,
    profile : profileEndpoints,

}

export default endpoints;