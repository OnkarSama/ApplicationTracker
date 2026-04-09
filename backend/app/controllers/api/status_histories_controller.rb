class Api::StatusHistoriesController < ApplicationController
  include ::ApiAuthentication
  before_action :require_authentication

  def index
    application = Current.user.applications.find(params[:application_id])
    histories   = application.status_histories.order(created_at: :desc)
    render json: histories.as_json(only: [:id, :from_status, :to_status, :change_type, :created_at])
  end
end
