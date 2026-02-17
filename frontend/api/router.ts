import applicationEndpoints from './application'
import sessionEndpoints from './session'
import userEndpoints from './user'

const endpoints = {
    applications : applicationEndpoints,
    sessions : sessionEndpoints,
    users : userEndpoints

}

export default endpoints;