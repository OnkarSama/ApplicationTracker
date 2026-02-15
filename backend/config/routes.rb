Rails.application.routes.draw do
  resource :session
  namespace :api, defaults: { format: :json } do
    resources :applications
    resources :application_credentials
    resources :users, only: [:index, :show]
    resource :session, only: [:create, :destroy]
    resources :passwords, param: :token
  end
  get '*path', to: "static_pages#frontend_index"
end