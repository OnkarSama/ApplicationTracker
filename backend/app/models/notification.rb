class Notification < ApplicationRecord
  belongs_to :user
  validates :message, presence: true
  validates :notification_type, presence: true
end