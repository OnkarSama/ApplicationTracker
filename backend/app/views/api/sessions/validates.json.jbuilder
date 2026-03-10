json.user do
  json.extract! Current.user, :id, :email_address, :first_name, :last_name
  json.verified Current.user.verified?
end