class RemoveNotesFromApplications < ActiveRecord::Migration[8.1]
  def change
    remove_column :applications, :notes, :text
  end
end