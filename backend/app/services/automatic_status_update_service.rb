require 'net/http'
require 'uri'
require 'json'

class AutomaticStatusUpdateService

    def self.requestUpdate(user, notify = false)

        uri = URI.parse(ENV['AUTOMATIC_STATUS_UPDATE_API_ROUTE'])
        api_key = ENV['AUTOMATIC_STATUS_UPDATE_API_KEY']

        applications = user.applications.includes(:application_credential)

        Net::HTTP.start(uri.hostname, uri.port) do |http|

            headers = {
                'Content-Type' => 'application/json',
                'Authorization' => "Bearer #{api_key}"
            }

            request = Net::HTTP::Post.new(uri.request_uri, headers)
            request.body = JSON.generate(applications.as_json(include: :application_credential))

            response = http.request(request)

            if notify
                parsedData = JSON.parse(response.body)
                Current.status_change_source = "automatic"
                if parsedData["applications"].present?
                  parsedData["applications"].each do |updated|
                    app = user.applications.find_by(id: updated["id"])
                    app&.update(status: updated["status"]) if updated["status"].present?
                  end
                end
                Current.status_change_source = nil
                return parsedData["Updated"]
            end
        end
    end

end