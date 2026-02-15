class Api::UsersController < ApplicationController
  allow_unauthenticated_access only: %i[index show]
  def index
    @users = User.all
    render :index
  end

  def show
    @user = User.find(params[:id])
    render :show
  end

  private
  def user_params
  end
end