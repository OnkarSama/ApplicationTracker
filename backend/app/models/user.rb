class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :applications, dependent: :destroy
  after_create :create_applicant_profile
  has_one :applicant_profile, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }
end
