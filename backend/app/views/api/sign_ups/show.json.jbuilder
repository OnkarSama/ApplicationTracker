json.user do
  json.first_name @user.first_name
  json.last_name @user.last_name
  json.email_address @user.email_address
end

json.meta do
  json.type "sign_up"
end
