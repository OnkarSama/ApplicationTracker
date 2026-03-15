json.extract! @profile, :id, :preferred_name, :contact_email, :phone_number,
              :linkedin_url, :portfolio_url, :bio, :date_of_birth, :nationality,
              :pronouns, :address_line_1, :address_line_2, :city, :state,
              :zip_code, :country, :github_url

json.work_experiences @profile.work_experiences do |we|
  json.extract! we, :id, :employer, :job_title, :start_date, :end_date, :current, :description
end

json.educations @profile.educations do |edu|
  json.extract! edu, :id, :institution, :degree, :area_of_study, :start_year, :end_year, :gpa
end