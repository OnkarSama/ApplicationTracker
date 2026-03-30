class AddFieldsToApplicantProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :applicant_profiles, :date_of_birth, :date
    add_column :applicant_profiles, :nationality, :string
    add_column :applicant_profiles, :pronouns, :string
    add_column :applicant_profiles, :address_line_1, :string
    add_column :applicant_profiles, :address_line_2, :string
    add_column :applicant_profiles, :city, :string
    add_column :applicant_profiles, :state, :string
    add_column :applicant_profiles, :zip_code, :string
    add_column :applicant_profiles, :country, :string
    add_column :applicant_profiles, :github_url, :string
  end
end
