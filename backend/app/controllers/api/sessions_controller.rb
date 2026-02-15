class Api::SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[ new create ]
  rate_limit to: 10, within: 3.minutes, only: :create

  def new
  end

  def create
    if user = User.authenticate_by(params.permit(:email_address, :password))
      start_new_session_for user
      render :show
    else
      render json: {
        errors: ["Invalid email or password"]
      }, status: :unauthorized
    end
  end

  def destroy
    terminate_session
    render json: {message: 'success'}
  end
end
