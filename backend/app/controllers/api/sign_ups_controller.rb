class Api::SignUpsController < ApplicationController
  allow_unauthenticated_access
  rate_limit to: 10,
             within: 3.minutes,
             only: :create,
             message: -> { { alert: "Try again later." } }

  def show
    @user = User.new
  end

  def create
    @user = User.new(sign_up_params)

    if @user.save
      start_new_session_for(@user)
      render :create, status: :created
    else
      render :create, status: :unprocessable_entity
    end
  end

  private

  def sign_up_params
    params.expect(user: [:first_name, :last_name, :email_address, :password, :password_confirmation])
  end
end
