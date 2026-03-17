module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :require_authentication
    helper_method :authenticated?
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :require_authentication, **options
    end
  end

  private
    def authenticated?
      resume_session
    end

    def require_authentication
      resume_session || request_authentication
    end

    def resume_session
      Current.session ||= find_session_by_cookie || find_session_by_jwt
    end

    def find_session_by_cookie
      Session.find_by(id: cookies.signed[:session_id]) if cookies.signed[:session_id]
    end

    def find_session_by_jwt

        token = request.headers["Authorization"]&.split(" ")&.last
        return nil unless token

        decoded_token_array = JwtService.decode(token)
        return nil unless decoded_token_array


        user = User.find_by(id: decoded_token_array["user_id"])
        return nil unless user

        user.sessions.last
    end
    #
    # def request_authentication
    #   session[:return_to_after_authenticating] = request.url
    #   redirect_to new_session_path
    # end
  def request_authentication
    if request.format.json?
      render json: { error: "You must be logged in" }, status: :unauthorized
    else
      session[:return_to_after_authenticating] = request.url
      redirect_to new_session_path
    end
  end

  def after_authentication_url
      session.delete(:return_to_after_authenticating) || root_url
    end

    def start_new_session_for(user)
      user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
        Current.session = session
        cookies.signed.permanent[:session_id] = { value: session.id, httponly: true, same_site: :lax }
      end
    end

    def terminate_session
      Current.session.destroy
      cookies.delete(:session_id)
    end
end