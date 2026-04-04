class StatusSyncChannel < ActionCable::Channel::Base
  # Subscribes the user to their own status sync stream.
  # Each user gets a unique stream so broadcasts only reach the right user.
  def subscribed
    stream_from "status_sync_#{current_user.id}"
  end

  def unsubscribed
  end
end
