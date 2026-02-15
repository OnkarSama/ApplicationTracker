// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "controllers/applications"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"
eagerLoadControllersFrom("controllers", application)
