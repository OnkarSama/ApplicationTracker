json.array! @applications do |app|
  json.extract! app, :id, :title, :notes, :status, :priority, :category
end
