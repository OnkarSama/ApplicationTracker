class CreateWorkExperiences < ActiveRecord::Migration[8.1]
  def change
    create_table :work_experiences do |t|
      t.string :employer
      t.string :job_title
      t.date :start_date
      t.date :end_date
      t.string :description
      t.references :applicant_profile, null: false, foreign_key: true

      t.timestamps
    end
  end
end
