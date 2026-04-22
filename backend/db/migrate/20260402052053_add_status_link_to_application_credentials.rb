class AddStatusLinkToApplicationCredentials < ActiveRecord::Migration[8.1]
  def change
      add_column :application_credentials, :status_page_link, :string
  end
end
