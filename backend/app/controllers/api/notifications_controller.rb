# app/controllers/api/notifications_controller.rb
class Api::NotificationsController < ApplicationController
  def index
    render json: Current.user.notifications.order(created_at: :desc)
  end

  def update
    notification = Current.user.notifications.find(params[:id])
    if notification.update(read: true)
      render json: notification
    else
      render json: { errors: notification.errors.full_messages }, status: :unprocessable_entity
    end
  end
end