# Clear existing data (order matters because of foreign keys)
ApplicationCredential.destroy_all
Application.destroy_all
ApplicantProfile.destroy_all
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

puts "Seeding applicant profiles..."

ApplicantProfile.create!([
                           {
                             user: user1,
                             preferred_name: "Ali",
                             contact_email: "alice.contact@example.com",
                             phone_number: "555-123-4567",
                             linkedin_url: "https://linkedin.com/in/alicejohnson",
                             portfolio_url: "https://alice.dev",
                             bio: "Computer Science student interested in backend systems."
                           },
                           {
                             user: user2,
                             preferred_name: "Bobby",
                             contact_email: "bob.contact@example.com",
                             phone_number: "555-987-6543",
                             linkedin_url: "https://linkedin.com/in/bobsmith",
                             portfolio_url: "https://bob.dev",
                             bio: "Cloud engineering enthusiast and distributed systems learner."
                           }
                         ])

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

puts "Seeding application credentials..."

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
