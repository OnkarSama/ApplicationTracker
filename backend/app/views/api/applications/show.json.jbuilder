json.application do
  json.extract! @application,
                :id,
                :title,
                :notes,
                :status,
                :priority,
                :category,
                :salary,
                :user_id,
                :created_at,
                :updated_at
end
