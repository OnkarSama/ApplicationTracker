import applicationEndpoints from './application'
import sessionEndpoints from './session'
import userEndpoints from './user'
import signupEndpoints from './signup'
import profileEndpoints from './profile'
import notesEndpoints from './note'
import passwordEndpoints from './password'

const endpoints = {
    applications : applicationEndpoints,
    sessions : sessionEndpoints,
    users : userEndpoints,
    signup : signupEndpoints,
    profile : profileEndpoints,
    notes : notesEndpoints,
    passwords : passwordEndpoints,

}

export default endpoints;