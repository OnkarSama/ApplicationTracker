Rails.application.routes.draw do
  resource :application
  namespace :api, defaults: { format: :json } do
    resources :applications do
        collection do
            post :sync
        end
      resource :application_credential

    end
    resource :applicant_profile do
        resources :educations
        resources :work_experiences
    end
    resources :users, only: [:index, :show] do
        collection do
            post :update_avatar
            delete :destroy
        end
    end
    resource :session, only: [:show, :create, :destroy]
    resources :passwords, param: :token
    resource :signup, only: [:show, :create]

    resource :verification, only: [] do
      get :verify
      post :resend
    end
  end
end