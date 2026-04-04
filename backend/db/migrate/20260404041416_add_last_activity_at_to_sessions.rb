class AddLastActivityAtToSessions < ActiveRecord::Migration[8.1]
  def change
    add_column :sessions, :last_activity_at, :datetime
  end
end
