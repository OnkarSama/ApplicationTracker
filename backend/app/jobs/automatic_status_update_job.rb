class AutomaticStatusUpdateJob < ApplicationJob
  queue_as :default

  def perform(user)
    begin
      is_updated = AutomaticStatusUpdateService.requestUpdate(user, true)

      # Broadcast result to the user's ActionCable stream once all scraping is done
      ActionCable.server.broadcast(
        "status_sync_#{user.id}",
        { isUpdated: is_updated }
      )
    rescue Errno::ECONNREFUSED
      ActionCable.server.broadcast(
        "status_sync_#{user.id}",
        { error: "Sync service unavailable" }
      )
    end
  end
end
