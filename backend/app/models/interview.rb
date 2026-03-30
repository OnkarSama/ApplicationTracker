# app/models/interview.rb
class Interview < ApplicationRecord
  belongs_to :application
  validates :interview_type, presence: true
  validates :scheduled_at, presence: true
end