json.array! @applications do |app|
  json.extract! app, :id, :company, :position, :notes, :status, :priority, :category, :salary, :user_id, :created_at, :updated_at
end
