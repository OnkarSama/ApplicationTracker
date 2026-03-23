module InputSanitizer
  extend ActiveSupport::Concern

  included do
    before_action :sanitize_params
  end

  private

  def sanitize_params
    sanitize_hash(params)
  end

  def sanitize_hash(hash)
    hash.each do |key, value|
      if value.is_a?(String)
        hash[key] = ActionController::Base.helpers.strip_tags(value).strip
        raise ActionController::BadRequest, "Input too long" if hash[key].length > 10_000
      elsif value.is_a?(ActionController::Parameters)
        sanitize_hash(value)
      end
    end
  end
end