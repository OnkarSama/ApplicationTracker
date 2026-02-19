class Api::UsersController < ApplicationController
  before_action :require_authentication

  def index
    @users = User.all
    render :index
  end

  def show
    @user = User.find(params[:id])
    render :show
  end

  def destroy
    Current.user.destroy
    reset_session
    render json: { message: "Account deleted successfully" }, status: :ok
  end

  private
  def user_params
  end
end