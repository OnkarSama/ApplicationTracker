# This file should ensure the existence of records required to run the application in every environment (production,
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
  name: "Alice Johnson",
  email: "alice@example.com",
  password_digest: "password"
)

user2 = User.create!(
  name: "Bob Smith",
  email: "bob@example.com",
  password_digest: "password"
)

puts "Seeding applications..."

app1 = Application.create!(
  user: user1,
  title: "Google Internship",
  notes: "Summer SWE internship",
  status: "Applied",
  priority: 1,
  category: "Internship"
)

app2 = Application.create!(
  user: user1,
  title: "Amazon New Grad",
  notes: "Backend role",
  status: "Interview",
  priority: 2,
  category: "Full-time"
)

app3 = Application.create!(
  user: user2,
  title: "Microsoft Internship",
  notes: "Cloud team",
  status: "Applied",
  priority: 1,
  category: "Internship"
)

puts "Seeding application credentials..."

ApplicationCredential.create!([
                                {
                                  application: app1,
                                  portal_link: "https://careers.google.com",
                                  username: "alice_google",
                                  password: "securepass1"
                                },
                                {
                                  application: app2,
                                  portal_link: "https://amazon.jobs",
                                  username: "alice_amazon",
                                  password: "securepass2"
                                },
                                {
                                  application: app3,
                                  portal_link: "https://careers.microsoft.com",
                                  username: "bob_microsoft",
                                  password: "securepass3"
                                }
                              ])

puts "Seed complete!"

