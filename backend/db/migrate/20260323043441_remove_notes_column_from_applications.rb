class RemoveNotesColumnFromApplications < ActiveRecord::Migration[8.1]
    def change
        remove_column :applications, :notes, :text, if_exists: true
    end
end
