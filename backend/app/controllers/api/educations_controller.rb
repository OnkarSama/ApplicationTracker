class Api::EducationsController < ApplicationController
  before_action :require_authentication

  def create
    education = Current.user.applicant_profile.educations.build(education_params)
    if education.save
      render json: education, status: :created
    else
      render json: education.errors.full_messages, status: :unprocessable_entity
    end
  end

  def update
    education = Current.user.applicant_profile.educations.find(params[:id])
    if education.update(education_params)
      render json: education
    else
      render json: education.errors.full_messages, status: :unprocessable_entity
    end
  end

  def destroy
    Current.user.applicant_profile.educations.find(params[:id]).destroy
    head :no_content
  end

  private

  def education_params
    params.require(:education).permit(:institution, :degree, :area_of_study, :start_year, :end_year, :gpa)
  end
end