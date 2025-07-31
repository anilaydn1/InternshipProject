import ApiService from './api';
import { Note, CreateNoteData } from '../types';

class NoteService {
  async getNotes(): Promise<Note[]> {
    try {
      return await ApiService.getNotes();
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  async createNote(noteData: CreateNoteData): Promise<Note> {
    try {
      return await ApiService.createNote(noteData);
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async updateNote(noteId: number, noteData: CreateNoteData): Promise<Note> {
    try {
      return await ApiService.updateNote(noteId, noteData);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(noteId: number): Promise<void> {
    try {
      await ApiService.deleteNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
}

export const noteService = new NoteService();
export default noteService;