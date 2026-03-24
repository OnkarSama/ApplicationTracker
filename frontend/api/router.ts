import applicationEndpoints from './application'
import sessionEndpoints from './session'
import userEndpoints from './user'
import signupEndpoints from './signup'
import profileEndpoints from './profile'
import notesEndpoints from './note'
import passwordEndpoints from './password'
import interviewEndpoints from './interview'

const endpoints = {
    applications : applicationEndpoints,
    sessions : sessionEndpoints,
    users : userEndpoints,
    signup : signupEndpoints,
    profile : profileEndpoints,
    notes : notesEndpoints,
    passwords : passwordEndpoints,
    interviews : interviewEndpoints,

}

export default endpoints;