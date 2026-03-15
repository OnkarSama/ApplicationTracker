class AddCurrentToWorkExperiences < ActiveRecord::Migration[8.1]
  def change
    add_column :work_experiences, :current, :boolean
  end
end
