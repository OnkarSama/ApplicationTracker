class Application < ApplicationRecord
  validates :company, presence: true, length: { maximum: 255 }
  validates :position, length: { maximum: 255 }, allow_nil: true
  validates :status, presence: true, length: { maximum: 255 }
  validates :priority, presence: true, inclusion: { in: %w[Low Medium High] }
  validates :category, presence: true, length: { maximum: 255 }
  has_many :notes, dependent: :destroy
  has_many :interviews, dependent: :destroy
  has_many :status_histories, dependent: :destroy

  belongs_to :user
  has_one :application_credential, dependent: :destroy

  before_update :log_status_change, if: :status_changed?

  def self.ransackable_attributes(auth_object = nil)
    ["company", "position", "status", "priority", "category", "salary"]
  end

def self.ransackable_associations(auth_object = nil)
  []
end

  private

  def log_status_change
    status_histories.build(
      from_status: status_was,
      to_status:   status,
      change_type: Current.status_change_source || "manual"
    )
  end
end
