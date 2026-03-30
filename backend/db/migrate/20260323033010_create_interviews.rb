class CreateInterviews < ActiveRecord::Migration[8.1]
  def change
    create_table :interviews do |t|
      t.references :application, null: false, foreign_key: true
      t.string :interview_type
      t.datetime :scheduled_at
      t.text :notes

      t.timestamps
    end
  end
end
