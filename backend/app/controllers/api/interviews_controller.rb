# app/controllers/api/interviews_controller.rb
class Api::InterviewsController < ApplicationController
  before_action :set_application

  def index
    render json: @application.interviews
  end

  def create
    interview = @application.interviews.build(interview_params)
    if interview.save
      render json: interview, status: :created
    else
      render json: { errors: interview.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @application.interviews.find(params[:id]).destroy
    head :no_content
  end

  private

  def set_application
    @application = Current.user.applications.find(params[:application_id])
  end

  def interview_params
    params.require(:interview).permit(:interview_type, :scheduled_at, :notes)
  end
end