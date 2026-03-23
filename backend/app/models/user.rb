class User < ApplicationRecord
    has_secure_password
    has_many :sessions, dependent: :destroy
    has_many :applications, dependent: :destroy
    has_many :notifications, dependent: :destroy
    after_create :create_applicant_profile
    has_one :applicant_profile, dependent: :destroy
    has_one_attached :avatar
    validates :email_address, uniqueness: true

    normalizes :email_address, with: ->(e) { e.strip.downcase }

    def verified?
        return self.email_verified_at.present?
    end

    def verify!
        self.email_verified_at = DateTime.current
        self.verification_token = nil
        self.verification_token_expires_at = nil
        self.save
    end

    def generate_verification_token!

        self.verification_token = SecureRandom.urlsafe_base64(32)
        self.verification_token_expires_at = Time.current + 24.hours
        self.save
    end


end
