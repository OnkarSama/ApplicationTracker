class Api::VerificationsController < ApplicationController
  allow_unauthenticated_access only: %i[verify resend]
  rate_limit to: 5, within: 10.minutes, only: :resend

  # GET /api/verification/verify?token=xxx
  def verify
    user = User.find_by(verification_token: params[:token])

    if user.nil?
      return render json: { error: "Invalid verification token." }, status: :not_found
    end

    if user.verified?
      return render json: { message: "Email already verified." }, status: :ok
    end

    if user.verification_token_expires_at < Time.current
      return render json: { error: "Token expired. Please request a new verification email." }, status: :unprocessable_entity
    end

    user.verify!
    render json: { message: "Email verified successfully." }, status: :ok
  end

    def resend
      user = User.find_by(email_address: params[:email_address]&.downcase&.strip)

      unless user.nil? || user.verified?
        user.generate_verification_token!
        UserMailer.verification_email(user).deliver_later
      end

      # always return the same message regardless
      render json: { message: "If that email exists, a verification link has been sent." }
    end
end