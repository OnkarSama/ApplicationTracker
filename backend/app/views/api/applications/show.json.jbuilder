json.application do
  json.extract! @application,
                :id,
                :company,
                :position,
                :status,
                :priority,
                :category,
                :salary,
                :user_id,
                :created_at,
                :updated_at
end
