# app/controllers/api/applications_controller.rb
class Api::ApplicationsController < ApplicationController
  wrap_parameters include: Application.attribute_names
  before_action :require_logged_in

  def index
    @applications = current_user.applications
    render :index
  end

  def show
    @application = current_user.applications.find_by(id: params[:id])

    if @application
      render :show
    else
      render json: { message: "Not found" }, status: :not_found
    end
  end

  def create
    @application = current_user.applications.new(application_params)

    if @application.save
      render :show
    else
      render json: @application.errors.full_messages, status: :unprocessable_entity
    end
  end

  def update
    @application = current_user.applications.find_by(id: params[:id])

    if @application&.update(application_params)
      render :show
    else
      render json: { message: "Unable to update" }, status: :unprocessable_entity
    end
  end

  def destroy
    @application = current_user.applications.find_by(id: params[:id])

    if @application
      @application.destroy
      render json: { message: "Deleted successfully" }
    else
      render json: { message: "Not found" }, status: :not_found
    end
  end

  private

  def application_params
    params.require(:application).permit(:title, :description)
  end
end
