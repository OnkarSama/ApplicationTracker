if @user.persisted?
  json.status "created"

  json.user do
    json.id @user.id
    json.first_name @user.first_name
    json.last_name @user.last_name
    json.email_address @user.email_address
    json.created_at @user.created_at
  end
else
  json.status "error"

  json.errors @user.errors.to_hash(true)
end
