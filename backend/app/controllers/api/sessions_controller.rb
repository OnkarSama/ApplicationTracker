class Api::SessionsController < ApplicationController
    allow_unauthenticated_access only: %i[ new create ]
    rate_limit to: 10, within: 3.minutes, only: :create

    def new
    end

    def show
        if Current.user
            avatar_url = Current.user.avatar.attached? ? rails_blob_path(Current.user.avatar) : nil
            render json: {
                user: {
                    id: Current.user.id,
                    first_name: Current.user.first_name,
                    last_name: Current.user.last_name,
                    email_address: Current.user.email_address,
                    created_at: Current.user.created_at,
                    avatar_url: avatar_url
                }
            }
        else
            render json: { error: "Unauthenticated" }, status: :unauthorized
        end
    end

    def create
        if user = User.authenticate_by(params.permit(:email_address, :password))
            start_new_session_for user
            @token = JwtService.encode({ user_id: user.id })
            render :show
        else
            render json: {
                errors: ["Invalid email or password"]
            }, status: :unauthorized
        end
    end

    def destroy
        terminate_session
        render json: {message: 'successfully deleted!'}
    end
end
