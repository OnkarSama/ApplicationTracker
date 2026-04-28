class Api::WorkExperiencesController < ApplicationController
  before_action :require_authentication

  def create
    work_experience = Current.user.applicant_profile.work_experiences.build(work_experience_params)
    if work_experience.save
      render json: work_experience, status: :created
    else
      render json: work_experience.errors.full_messages, status: :unprocessable_entity
    end
  end

  def update
    work_experience = Current.user.applicant_profile.work_experiences.find(params[:id])
    if work_experience.update(work_experience_params)
      render json: work_experience
    else
      render json: work_experience.errors.full_messages, status: :unprocessable_entity
    end
  end

  def destroy
    Current.user.applicant_profile.work_experiences.find(params[:id]).destroy
    head :no_content
  end

  private

  def work_experience_params
    params.require(:work_experience).permit(:employer, :job_title, :location,  :start_date, :end_date, :description)
  end
end