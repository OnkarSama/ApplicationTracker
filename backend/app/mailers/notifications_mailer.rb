class NotificationsMailer < ApplicationMailer
  def status_updates(email, updated_apps)
    @updated_apps = updated_apps
    mail(to: email, subject: "#{updated_apps.size} Application Status Update#{updated_apps.size == 1 ? '' : 's'}")
  end
end
