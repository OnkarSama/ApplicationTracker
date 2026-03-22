class WeeklyStatusSyncJob < ApplicationJob
  queue_as :default

  def perform(notify=true)
     begin
         User.all.each do |user|
           @isUpdated = AutomaticStatusUpdateService.requestUpdate(user, notify)
         end
        rescue Errno::ECONNREFUSED
            nil
        end
  end
end
