class JwtService

    def self.encode(payload)
        secret = Rails.application.credentials.jwt_secret
        payload[:exp] = 1.hours.from_now.to_i
        JWT.encode(payload, secret,'HS256')

    end

    def self.decode(token)
        begin
            secret = Rails.application.credentials.jwt_secret

            decoded_val = JWT.decode(token, secret, true, { algorithm: 'HS256' })

            return decoded_val[0]
        rescue => e
            return nil
        end
    end

end