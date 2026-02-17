class Application < ApplicationRecord
  validates :title, presence: true, length: {maximum: 255}
  validates :notes, presence: true, length: {maximum: 1000}
  validates :status, presence: true, length: {maximum: 255}
  validates :priority, presence: true

  belongs_to :user
  has_one :application_credential, dependent: :destroy
end
