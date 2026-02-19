json.application do
  json.extract! @application,
                :id,
                :title,
                :notes,
                :category,
                :user_id,
                :created_at,
                :updated_at
end
