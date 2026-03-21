class AutomaticStatusUpdateJob < ApplicationJob
  queue_as :default

  def perform(user)
    begin
        @isUpdated = AutomaticStatusUpdateService.requestUpdate(user)
    rescue Errno::ECONNREFUSED
        nil
    end
  end
end
