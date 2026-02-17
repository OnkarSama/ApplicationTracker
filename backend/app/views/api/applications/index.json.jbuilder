json.array! @applications do |app|
  json.extract! app, :id, :title, :notes, :status, :priority, :category, :user_id, :created_at, :updated_at
end
