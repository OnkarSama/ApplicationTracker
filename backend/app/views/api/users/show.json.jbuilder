json.user do
  json.extract! @user, :id, :email_address, :first_name, :last_name, :created_at, :updated_at

  json.applications do
    json.array! @user.applications do |app|
      json.id app.id
      json.title app.title
      json.status app.status
    end
  end
end
