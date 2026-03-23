class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
        t.index [:user_id, :read]
        t.references :user, null: false, foreign_key: true
        t.string :notification_type
        t.text :message
        t.boolean :read, default: false, null: false

        t.timestamps
    end
  end
end
