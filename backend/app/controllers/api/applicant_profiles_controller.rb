class Api::ApplicantProfilesController < ApplicationController
  before_action :require_authentication
  before_action :set_profile

  def show
    @profile
  end

  def update
    if @profile.update(profile_params)
      render :show
    else
      render json: @profile.errors.full_messages, status: :unprocessable_entity
    end
  end

  def set_profile
    unless Current.user
      render json: { error: "Not logged in" }, status: :unauthorized and return
    end

    @profile = Current.user.applicant_profile
  end

  def profile_params
    params.require(:profile).permit(:preferred_name,
                                              :contact_email,
                                              :phone_number,
                                              :linkedin_url,
                                              :portfolio_url,
                                              :bio)
  end
end
