class CreateEducations < ActiveRecord::Migration[8.1]
  def change
    create_table :educations do |t|
      t.string :institution
      t.string :degree
      t.string :area_of_study
      t.integer :start_year
      t.integer :end_year
      t.decimal :gpa
      t.references :applicant_profile, null: false, foreign_key: true

      t.timestamps
    end
  end
end
