class Api::PasswordsController < ApplicationController
  allow_unauthenticated_access
  before_action :set_user_by_token, only: [:update]
  rate_limit to: 10, within: 3.minutes, only: :create

  # POST /api/passwords
  # { email_address: "..." }
  def create
    if (user = User.find_by(email_address: params[:email_address]))
      PasswordsMailer.reset(user).deliver_later
    end
    # Always render success to avoid email enumeration
    render json: { message: "If that email exists you'll receive reset instructions shortly." }
  end

  # PATCH /api/passwords/:token
  # { password: "...", password_confirmation: "..." }
  def update
    if @user.update(params.permit(:password, :password_confirmation))
      @user.sessions.destroy_all
      render json: { message: "Password reset successfully. Please log in." }
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_user_by_token
    @user = User.find_by_token_for(:password_reset, params[:token])
    unless @user
      render json: { error: "Reset link is invalid or has expired." }, status: :unprocessable_entity
    end
  end
end
