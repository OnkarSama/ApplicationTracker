module ApiAuthentication
    include ActiveSupport::Concern

    private

    def require_api_authentication
      request_authentication
    end

    def request_authentication
        if !verify_api_key
            render json: { error: "API Keys do not Match" }, status: :unauthorized
        end
    end

    def verify_api_key
        if ENV['AUTOMATIC_STATUS_UPDATE_API_KEY'] != request.headers['Authorization'].split(" ")[1]
            return false
        else
            return true
        end
    end

end