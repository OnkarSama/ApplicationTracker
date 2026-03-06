json.array! @application_credential do |creds|
  json.extract! cre, :id, :password_digest, :portal_link, :username

end