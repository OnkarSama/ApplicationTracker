class CreateApplications < ActiveRecord::Migration[8.1]
  def change
    create_table :applications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.text :notes
      t.string :status
      t.integer :priority
      t.string :category

      t.timestamps
    end
  end
end
