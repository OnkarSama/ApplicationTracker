json.array! @users do |user|
  json.extract! user, :id, :name, :email

  json.applications do
    json.array! user.applications do |app|
      json.id app.id
      json.title app.title
      json.status app.status
    end
  end

end