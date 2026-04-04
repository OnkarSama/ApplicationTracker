class ChangePriorityToStringInApplications < ActiveRecord::Migration[8.1]
  def up
    add_column :applications, :priority_label, :string, null: false, default: "Low"
    execute "UPDATE applications SET priority_label = CASE priority WHEN 0 THEN 'Low' WHEN 1 THEN 'Medium' WHEN 2 THEN 'High' ELSE 'Low' END"
    remove_column :applications, :priority
    rename_column :applications, :priority_label, :priority
  end

  def down
    add_column :applications, :priority_int, :integer, null: false, default: 0
    execute "UPDATE applications SET priority_int = CASE priority WHEN 'Low' THEN 0 WHEN 'Medium' THEN 1 WHEN 'High' THEN 2 ELSE 0 END"
    remove_column :applications, :priority
    rename_column :applications, :priority_int, :priority
  end
end
