json.applications do
    json.array! @applications do |app|
      json.id app.id
      json.status app.status
      json.credential do
        json.portal_link app.application_credential&.portal_link
        json.username app.application_credential&.username
        json.password_digest app.application_credential&.password_digest
      end
    end
  end