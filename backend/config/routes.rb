Rails.application.routes.draw do
  resource :application
  namespace :api, defaults: { format: :json } do
    resources :applications do
      resources :application_credential
    end
    resources :users, only: [:index, :show]
    resource :session, only: [:create, :destroy]
    resources :passwords, param: :token
  end
  get '*path', to: "static_pages#frontend_index"
end