class ApplicantProfile < ApplicationRecord
    belongs_to :user
    has_many :work_experiences, dependent: :destroy
    has_many :educations, dependent: :destroy
end
