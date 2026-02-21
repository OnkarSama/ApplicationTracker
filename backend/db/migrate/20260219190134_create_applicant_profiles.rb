class CreateApplicantProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :applicant_profiles do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :preferred_name
      t.string :contact_email
      t.string :phone_number
      t.string :linkedin_url
      t.string :portfolio_url
      t.text :bio

      t.timestamps
    end
  end
end
