class AutomaticStatusUpdateJob < ApplicationJob
  queue_as :default

  def perform(user, notify=false)
    begin
        @isUpdated = AutomaticStatusUpdateService.requestUpdate(user, notify)
    rescue Errno::ECONNREFUSED
        nil
    end
  end
end
