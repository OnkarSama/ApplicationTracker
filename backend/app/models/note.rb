class Note < ApplicationRecord
  belongs_to :application
  validates :content, presence: true
end