class Api::ApplicationsController < ApplicationController
  before_action :require_authentication
  wrap_parameters include: Application.attribute_names

  def index
    @q = Current.user.applications.ransack(params[:q])
    @applications = @q.result
    render :index
  end

  def show
    @application = Current.user.applications.find_by(id: params[:id])
    return render json: { message: "Not found" }, status: :not_found unless @application
    render :show
  end

  def create
    @application = Current.user.applications.new(application_params)

    if @application.save
      render :show
    else
      render json: @application.errors.full_messages, status: :unprocessable_entity
    end
  end

  def update
    @application = Current.user.applications.find_by(id: params[:id])
    return render json: { message: "Not found" }, status: :not_found unless @application

    if @application.update(application_params)
      render :show
    else
      render json: @application.errors.full_messages, status: :unprocessable_entity
    end
  end

  def destroy
    @application = Current.user.applications.find_by(id: params[:id])
    return render json: { message: "Not found" }, status: :not_found unless @application

    @application.destroy
    render json: { message: "Deleted successfully" }
  end

  private

  def application_params
    params.require(:application).permit(:title, :notes, :status, :priority, :category)
  end
end
