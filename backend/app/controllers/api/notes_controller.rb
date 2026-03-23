# app/controllers/api/notes_controller.rb
class Api::NotesController < ApplicationController
  before_action :set_application

  def index
    render json: @application.notes
  end

  def create
    note = @application.notes.build(note_params)
    if note.save
      render json: note, status: :created
    else
      render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    note = current_application_note
    if note.update(note_params)
      render json: note
    else
      render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    current_application_note.destroy
    head :no_content
  end

  private

  def set_application
    @application = Current.user.applications.find(params[:application_id])
  end

  def current_application_note
    @application.notes.find(params[:id])
  end

  def note_params
    params.require(:note).permit(:content)
  end
end