class StatusHistory < ApplicationRecord
  belongs_to :application

  validates :from_status, :to_status, :change_type, presence: true
  validates :change_type, inclusion: { in: %w[manual automatic] }
end
