# This file should ensure the existence of records required to run the applications in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Clear existing data
ApplicationCredential.destroy_all
Application.destroy_all
User.destroy_all

puts "Seeding users..."

user1 = User.create!(
  first_name: "Alice",
  last_name: "Johnson",
  email_address: "alice@example.com",
  password: "password"
)

user2 = User.create!(
  first_name: "Bob",
  last_name: "Smith",
  email_address: "bob@example.com",
  password: "passwordtest"
)

puts "Seeding applications..."

app1 = Application.create!(
  user: user1,
  title: "Google Internship",
  notes: "Summer SWE internship",
  status: "Applied",
  priority: "high",
  category: "Internship"
)

app2 = Application.create!(
  user: user1,
  title: "Amazon New Grad",
  notes: "Backend role",
  status: "Interview",
  priority: "high",
  category: "Full-time"
)

app3 = Application.create!(
  user: user2,
  title: "Microsoft Internship",
  notes: "Cloud team",
  status: "Applied",
  priority: "high",
  category: "Internship"
)

puts "Seeding applications credentials..."

ApplicationCredential.create!([
                                {
                                  application: app1,
                                  portal_link: "https://careers.google.com",
                                  username: "alice_google",
                                  password_digest: "securepass1"
                                },
                                {
                                  application: app2,
                                  portal_link: "https://amazon.jobs",
                                  username: "alice_amazon",
                                  password_digest: "securepass2"
                                },
                                {
                                  application: app3,
                                  portal_link: "https://careers.microsoft.com",
                                  username: "bob_microsoft",
                                  password_digest: "securepass3"
                                }
                              ])

puts "Seed complete!"

