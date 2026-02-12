json.array! @applications do |application|
  json.id application.id
  json.title application.title
  json.description application.description
  json.user_id application.user_id
  json.created_at application.created_at
  json.updated_at application.updated_at
end
