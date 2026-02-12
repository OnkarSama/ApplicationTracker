json.user do
  json.extract! @user, :id, :email, :name, :created_at, :updated_at
  json.application do
    json.array! @user.application do |app|
      json.id app.id
      json.title app.title
      json.status app.status
    end
  end
end