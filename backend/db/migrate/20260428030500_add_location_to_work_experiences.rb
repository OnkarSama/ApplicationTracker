class AddLocationToWorkExperiences < ActiveRecord::Migration[8.1]
  def change
    add_column :work_experiences, :location, :string
  end
end
