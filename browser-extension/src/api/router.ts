import applicationEndpoints from './application'
import sessionEndpoints from './session'
import userEndpoints from './user'
import profileEndpoints from './profile'

const endpoints = {
    applications : applicationEndpoints,
    sessions : sessionEndpoints,
    users : userEndpoints,
    profile : profileEndpoints,

}

export default endpoints;