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

    def update_avatar
        Current.user.avatar.attach(params[:avatar])
        if Current.user.avatar.attached?
            render json: { avatar_url: url_for(Current.user.avatar) }
        else
            render json: { error: "Failed to attach avatar" }, status: :unprocessable_entity
        end
    end

    private
        def user_params
    end
end