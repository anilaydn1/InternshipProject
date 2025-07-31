<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class NoteController extends Controller
{
    /**
     * Display a listing of the notes.
     */
    public function index(): JsonResponse
    {
        try {
            \Log::info('Fetching notes for user: ' . Auth::id());
            $notes = Note::with('user:id,name,role')
                ->orderBy('created_at', 'desc')
                ->get();
            \Log::info('Found ' . $notes->count() . ' notes');

            return response()->json($notes);
        } catch (\Exception $e) {
            \Log::error('Error fetching notes: ' . $e->getMessage());
            return response()->json([
                'message' => 'Notlar yüklenirken bir hata oluştu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created note in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            \Log::info('Creating new note for user: ' . Auth::id());
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string|max:5000',
            ]);

            $note = Note::create([
                'user_id' => Auth::id(),
                'title' => $validated['title'],
                'content' => $validated['content'],
            ]);

            $note->load('user:id,name,role');
            \Log::info('Note created successfully with ID: ' . $note->id);

            return response()->json($note, 201);
        } catch (ValidationException $e) {
            \Log::error('Validation error creating note: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Geçersiz veri.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating note: ' . $e->getMessage());
            return response()->json([
                'message' => 'Not oluşturulurken bir hata oluştu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified note.
     */
    public function show(Note $note): JsonResponse
    {
        try {
            $note->load('user:id,name,role');
            return response()->json($note);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Not bulunamadı.',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified note in storage.
     */
    public function update(Request $request, Note $note): JsonResponse
    {
        try {
            \Log::info('Attempting to update note ID: ' . $note->id . ' by user: ' . Auth::id());
            // Check if user can update this note (only the creator can update)
            if ($note->user_id !== Auth::id()) {
                \Log::warning('User ' . Auth::id() . ' attempted to update note ' . $note->id . ' without permission');
                return response()->json([
                    'message' => 'Bu notu güncelleme yetkiniz yok.'
                ], 403);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string|max:5000',
            ]);

            $note->update($validated);
            $note->load('user:id,name,role');
            \Log::info('Note ' . $note->id . ' updated successfully');

            return response()->json($note);
        } catch (ValidationException $e) {
            \Log::error('Validation error updating note: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Geçersiz veri.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating note: ' . $e->getMessage());
            return response()->json([
                'message' => 'Not güncellenirken bir hata oluştu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified note from storage.
     */
    public function destroy(Note $note): JsonResponse
    {
        try {
            \Log::info('Attempting to delete note ID: ' . $note->id . ' by user: ' . Auth::id());
            // Check if user can delete this note (creator or manager/admin)
            $user = Auth::user();
            if ($note->user_id !== $user->id && !in_array($user->role, ['manager', 'admin'])) {
                \Log::warning('User ' . $user->id . ' attempted to delete note ' . $note->id . ' without permission');
                return response()->json([
                    'message' => 'Bu notu silme yetkiniz yok.'
                ], 403);
            }

            $note->delete();
            \Log::info('Note ' . $note->id . ' deleted successfully');

            return response()->json([
                'message' => 'Not başarıyla silindi.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting note: ' . $e->getMessage());
            return response()->json([
                'message' => 'Not silinirken bir hata oluştu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}