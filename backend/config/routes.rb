Rails.application.routes.draw do
  resource :application
  namespace :api, defaults: { format: :json } do
    resources :applications do
      resource :application_credential

    end
    resource :applicant_profile do
        resources :educations
        resources :work_experiences
    end
    resources :users, only: [:index, :show]
    resource :session, only: [:show, :create, :destroy]
    resources :passwords, param: :token
    resource :signup, only: [:show, :create]

  end
  get '*path', to: "static_pages#frontend_index"
end