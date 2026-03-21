class AutomaticStatusUpdateJob < ApplicationJob
  queue_as :default

  def perform(*args)
    begin
        @isUpdated = AutomaticStatusUpdateService.requestUpdate()
    rescue Errno::ECONNREFUSED
        nil
    end
  end
end
