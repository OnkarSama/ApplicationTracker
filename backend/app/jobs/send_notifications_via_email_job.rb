class SendNotificationsViaEmailJob < ApplicationJob
  queue_as :default

  def perform(email, updated_apps)
    NotificationsMailer.status_updates(email, updated_apps).deliver_now
  end
end
