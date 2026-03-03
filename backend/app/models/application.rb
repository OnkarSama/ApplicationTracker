class Application < ApplicationRecord
  validates :title, presence: true, length: { maximum: 255 }
  validates :notes, presence: true, length: { maximum: 1000 }
  validates :status, presence: true, length: { maximum: 255 }
  validates :priority, presence: true
  validates :category, presence: true, length: { maximum: 255 }

  belongs_to :user
  has_one :application_credential, dependent: :destroy

  def self.ransackable_attributes(auth_object = nil)
    [
      "title",
      "notes",
      "status",
      "priority",
      "category",
      "salary",
    ]
  end

def self.ransackable_associations(auth_object = nil)
  []
end
end
