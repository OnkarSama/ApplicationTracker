module ApiAuthentication
    include ActiveSupport::Concern


    private

    def require_api_authentication
        return if Current.user.present?
        request_authentication
    end

    def request_authentication
        if !verify_api_key
            render json: { error: "API Keys do not Match" }, status: :unauthorized
        end
    end

    def verify_api_key
      auth_header = request.headers['Authorization']
      return false unless auth_header

      ENV['AUTOMATIC_STATUS_UPDATE_API_KEY'] != auth_header.split(" ")[1] ? false : true
    end

end