<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    /**
     * Get all chat messages
     */
    public function index(): JsonResponse
    {
        try {
            $chats = Chat::with('user:id,name,role')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json($chats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Mesajlar alınırken bir hata oluştu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new chat message
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'message' => 'required|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Geçersiz veri.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $chat = Chat::create([
                'user_id' => Auth::id(),
                'message' => $request->message,
            ]);

            // Load the user relationship
            $chat->load('user:id,name,role');

            return response()->json($chat, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Mesaj gönderilirken bir hata oluştu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a chat message (only by the owner)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $chat = Chat::findOrFail($id);

            // Check if the user owns this message
            if ($chat->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Bu mesajı silme yetkiniz yok.'
                ], 403);
            }

            $chat->delete();

            return response()->json([
                'message' => 'Mesaj başarıyla silindi.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Mesaj silinirken bir hata oluştu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}