json.profile do
  json.first_name Current.user.first_name
  json.last_name Current.user.last_name
  json.email_address Current.user.email_address

  json.preferred_name @profile&.preferred_name
  json.contact_email @profile&.contact_email
  json.phone_number @profile&.phone_number
  json.linkedin_url @profile&.linkedin_url
  json.portfolio_url @profile&.portfolio_url
  json.bio @profile&.bio
end
