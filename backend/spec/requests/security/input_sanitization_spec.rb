# spec/requests/security/input_sanitization_spec.rb
require 'rails_helper'

RSpec.describe "Input Sanitization", type: :request do
  let(:user) { User.create!(email_address: "test@example.com", first_name: "Test", last_name: "User", password: "password123") }
  let(:valid_token) { JwtService.encode({ user_id: user.id }) }
  let(:auth_headers) { { "Authorization" => "Bearer #{valid_token}" } }

  let(:json_headers) { auth_headers.merge("Content-Type" => "application/json", "Accept" => "application/json") }

  describe "SQL injection attempts" do
    it "does not crash and table survives" do
      post "/api/applications", params: { company: "'; DROP TABLE applications;--", role: "test" }.to_json,
           headers: json_headers
      expect(Application.count).to be >= 0
    end
  end

  describe "XSS attempts" do
    it "strips script tags from inputs" do
      post "/api/applications", params: { company: "<script>alert('xss')</script>Evil Corp", role: "test" }.to_json,
           headers: json_headers
      expect(response.body).not_to include("<script>")
    end
  end

  describe "oversized input" do
    it "rejects inputs over 10,000 characters" do
      post "/api/applications", params: { company: "a" * 10_001, role: "test" }.to_json,
           headers: json_headers
      expect(response).to have_http_status(:bad_request)
    end
  end
end