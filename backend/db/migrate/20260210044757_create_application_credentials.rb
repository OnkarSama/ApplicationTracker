class CreateApplicationCredentials < ActiveRecord::Migration[8.1]
  def change
    create_table :application_credentials do |t|
      t.references :application, null: false, foreign_key: true
      t.string :portal_link
      t.string :username
      t.string :password

      t.timestamps
    end
  end
end
