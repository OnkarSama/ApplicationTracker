class CreateStatusHistories < ActiveRecord::Migration[8.0]
  def change
    create_table :status_histories do |t|
      t.references :application, null: false, foreign_key: true
      t.string :from_status, null: false
      t.string :to_status,   null: false
      t.string :change_type, null: false, default: "manual"
      t.timestamps
    end

    add_index :status_histories, [:application_id, :created_at]
  end
end
