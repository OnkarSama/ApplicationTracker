class RenameApplicationTitleToCompanyAndAddPosition < ActiveRecord::Migration[8.1]
  def change
    rename_column :applications, :title, :company
    add_column :applications, :position, :string
  end
end
