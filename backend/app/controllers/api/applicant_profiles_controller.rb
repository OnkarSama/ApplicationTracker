class Api::ApplicantProfilesController < ApplicationController
  before_action :require_authentication

  def show
    @profile = Current.user.applicant_profile
  end
end
