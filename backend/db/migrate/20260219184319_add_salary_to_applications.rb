class AddSalaryToApplications < ActiveRecord::Migration[8.1]
  def change
    add_column :applications, :salary, :decimal, precision: 12, scale: 2
  end
end
