class Api::ApplicationsController < ApplicationController
    include ::ApiAuthentication
  before_action :require_authentication, only: [:index, :show, :create, :destroy, :update, :sync]
  before_action :require_api_authentication, only: [:update]
  before_action :set_bearer_token
  wrap_parameters include: Application.attribute_names

    def index
        if @bearer_token.nil?
            @q = Current.user.applications.ransack(params[:q])
            @applications = @q.result
            render :index
        else
            @applications = Current.user.applications
            render :api
        end
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

    def sync
        AutomaticStatusUpdateJob.perform_later(Current.user)
        render json: { isUpdated: true }, status: :accepted
    end

    def update
        if Current.user.nil?
            @application = Application.find_by(id: params[:id])
            return render json: { message: "Not found" }, status: :not_found unless @application
        else
            @application = Current.user.applications.find_by(id: params[:id])
            return render json: { message: "Not found" }, status: :not_found unless @application
        end

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
        params.require(:application).permit(:company, :salary, :position, :notes, :status, :priority, :category)
    end

    def set_bearer_token
        @bearer_token = request.headers['Authorization']&.start_with?('Bearer')
    end

end
