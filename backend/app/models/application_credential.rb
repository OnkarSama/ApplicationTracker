class ApplicationCredential < ApplicationRecord
  belongs_to :application
  encrypts :password_digest

end
