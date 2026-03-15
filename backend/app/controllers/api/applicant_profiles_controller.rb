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

    private

    def set_profile
        @profile = Current.user.applicant_profile
    end

    def profile_params
        params.require(:applicant_profile).permit(
        :preferred_name, :contact_email, :phone_number,
        :linkedin_url, :portfolio_url, :bio,
        :date_of_birth, :nationality, :pronouns,
        :address_line_1, :address_line_2, :city,
        :state, :zip_code, :country, :github_url
        )
    end
end