class Api::ApplicationCredentialsController < ApplicationController
  before_action :require_authentication
  before_action :set_application
  before_action :set_credential, only: [:show, :update, :destroy]

  # GET /api/application/:application_id/application_credentials
  def index
    render json: @application.application_credential
  end

  # GET /api/application/:application_id/application_credentials/:id
  def show
    render json: @credential
  end

  # POST /api/application/:application_id/application_credentials
  def create
    credential = @application.application_credential.new(credential_params)

    if credential.save
      render json: credential, status: :created
    else
      render json: { errors: credential.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /api/application/:application_id/application_credentials/:id
  def update
    if @credential.update(credential_params)
      render json: @credential
    else
      render json: { errors: @credential.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/application/:application_id/application_credentials/:id
  def destroy
    @credential.destroy
    render json: { message: "Credential deleted" }
  end

  private

  def set_application
    unless Current.user
      render json: { error: "Not logged in" }, status: :unauthorized and return
    end

    @application = Current.user.applications.find_by(id: params[:application_id])
  end

  def set_credential
    @credential = @application.application_credential
    render json: { error: "Credential not found" }, status: :not_found and return unless @credential
  end

  def credential_params
    params.require(:application_credential).permit(:username, :password_digest, :portal_link)
  end
end
