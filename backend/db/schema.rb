# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_23_043441) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "applicant_profiles", force: :cascade do |t|
    t.string "address_line_1"
    t.string "address_line_2"
    t.text "bio"
    t.string "city"
    t.string "contact_email"
    t.string "country"
    t.datetime "created_at", null: false
    t.date "date_of_birth"
    t.string "github_url"
    t.string "linkedin_url"
    t.string "nationality"
    t.string "phone_number"
    t.string "portfolio_url"
    t.string "preferred_name"
    t.string "pronouns"
    t.string "state"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "zip_code"
    t.index ["user_id"], name: "index_applicant_profiles_on_user_id", unique: true
  end

  create_table "application_credentials", force: :cascade do |t|
    t.bigint "application_id", null: false
    t.datetime "created_at", null: false
    t.string "password_digest"
    t.string "portal_link"
    t.datetime "updated_at", null: false
    t.string "username"
    t.index ["application_id"], name: "index_application_credentials_on_application_id"
  end

  create_table "applications", force: :cascade do |t|
    t.string "category"
    t.datetime "created_at", null: false
    t.integer "priority"
    t.decimal "salary", precision: 12, scale: 2
    t.string "status"
    t.string "title"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_applications_on_user_id"
  end

  create_table "educations", force: :cascade do |t|
    t.bigint "applicant_profile_id", null: false
    t.string "area_of_study"
    t.datetime "created_at", null: false
    t.string "degree"
    t.integer "end_year"
    t.decimal "gpa"
    t.string "institution"
    t.integer "start_year"
    t.datetime "updated_at", null: false
    t.index ["applicant_profile_id"], name: "index_educations_on_applicant_profile_id"
  end

  create_table "interviews", force: :cascade do |t|
    t.bigint "application_id", null: false
    t.datetime "created_at", null: false
    t.string "interview_type"
    t.text "notes"
    t.datetime "scheduled_at"
    t.datetime "updated_at", null: false
    t.index ["application_id"], name: "index_interviews_on_application_id"
  end

  create_table "notes", force: :cascade do |t|
    t.bigint "application_id", null: false
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["application_id"], name: "index_notes_on_application_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "message"
    t.string "notification_type"
    t.boolean "read"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.datetime "email_verified_at"
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.string "verification_token"
    t.datetime "verification_token_expires_at"
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  create_table "work_experiences", force: :cascade do |t|
    t.bigint "applicant_profile_id", null: false
    t.datetime "created_at", null: false
    t.boolean "current"
    t.string "description"
    t.string "employer"
    t.date "end_date"
    t.string "job_title"
    t.date "start_date"
    t.datetime "updated_at", null: false
    t.index ["applicant_profile_id"], name: "index_work_experiences_on_applicant_profile_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "applicant_profiles", "users"
  add_foreign_key "application_credentials", "applications"
  add_foreign_key "applications", "users"
  add_foreign_key "educations", "applicant_profiles"
  add_foreign_key "interviews", "applications"
  add_foreign_key "notes", "applications"
  add_foreign_key "notifications", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "work_experiences", "applicant_profiles"
end
