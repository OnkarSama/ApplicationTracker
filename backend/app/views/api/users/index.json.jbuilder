json.array! @users do |user|
  json.extract! user, :id, :first_name, :last_name, :email_address
  
  json.applications do
    json.array! user.applications do |app|
      json.id app.id
      json.title app.title
      json.status app.status
    end
  end

end