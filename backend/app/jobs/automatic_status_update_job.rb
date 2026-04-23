class AutomaticStatusUpdateJob < ApplicationJob
  queue_as :default

  def perform(user)
    begin
      is_updated, updated_apps = AutomaticStatusUpdateService.requestUpdate(user, true)

      ActionCable.server.broadcast(
        "status_sync_#{user.id}",
        { isUpdated: is_updated }
      )

      SendNotificationsViaEmailJob.perform_later(user.email_address, updated_apps) if is_updated
    rescue Errno::ECONNREFUSED
      ActionCable.server.broadcast(
        "status_sync_#{user.id}",
        { error: "Sync service unavailable" }
      )
    end
  end
end
