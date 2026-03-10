class UserMailer < ApplicationMailer
  def verification_email(user)
    @user = user
    @verification_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=#{user.verification_token}"
    mail(to: @user.email_address, subject: "Verify your email address")
  end
end