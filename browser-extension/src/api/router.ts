import applicationEndpoints from './application'
import sessionEndpoints from './session'
import userEndpoints from './user'
import profileEndpoints from './profile'
import applicationCredentialEndpoints from "./applicationCredential.ts"

const endpoints = {
    applications : applicationEndpoints,
    sessions : sessionEndpoints,
    users : userEndpoints,
    profile : profileEndpoints,
    applicationCredentials : applicationCredentialEndpoints,

}

export default endpoints;