class Current < ActiveSupport::CurrentAttributes
  attribute :session
  attribute :status_change_source
  delegate :user, to: :session, allow_nil: true
end
