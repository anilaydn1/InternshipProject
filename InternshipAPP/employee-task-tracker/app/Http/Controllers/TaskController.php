<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks for the authenticated user.
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            // Get tasks created by user and tasks assigned to user
            $tasks = Task::with(['user', 'assignedTo'])
                ->where(function($query) use ($user) {
                    $query->where('user_id', $user->id)
                          ->orWhere('assigned_to', $user->id);
                })
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $tasks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve tasks.'
            ], 500);
        }
    }

    /**
     * Display the specified task.
     */
    public function show($id): JsonResponse
    {
        try {
            $user = Auth::user();
            $task = Task::with(['user', 'assignedTo'])
                ->where('id', $id)
                ->where(function($query) use ($user) {
                    $query->where('user_id', $user->id)
                          ->orWhere('assigned_to', $user->id);
                })
                ->first();
            
            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found or you do not have permission to view it.'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $task
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve task.'
            ], 500);
        }
    }

    /**
     * Store a newly created task.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'nullable|in:in_progress,future,completed',
                'progress' => 'nullable|integer|min:0|max:100',
                'assigned_to' => 'nullable|exists:users,id'
            ]);
            
            $user = Auth::user();
            
            $task = Task::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? 'future',
                'progress' => $validated['progress'] ?? 0,
                'user_id' => $user->id,
                'assigned_to' => $validated['assigned_to'] ?? null
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Task created successfully.',
                'data' => $task
            ], 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create task.'
            ], 500);
        }
    }

    /**
     * Update the specified task.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $task = Task::where('id', $id)
                ->where(function($query) use ($user) {
                    $query->where('user_id', $user->id)
                          ->orWhere('assigned_to', $user->id);
                })
                ->first();
            
            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found or you do not have permission to update it.'
                ], 404);
            }
            
            // Atanan kişi sadece status ve progress güncelleyebilir
            if ($task->assigned_to == $user->id && $task->user_id != $user->id) {
                $validated = $request->validate([
                    'status' => 'sometimes|in:in_progress,future,completed',
                    'progress' => 'sometimes|integer|min:0|max:100'
                ]);
            } else {
                // Görev sahibi tüm alanları güncelleyebilir
                $validated = $request->validate([
                    'title' => 'sometimes|required|string|max:255',
                    'description' => 'sometimes|nullable|string',
                    'status' => 'sometimes|in:in_progress,future,completed',
                    'progress' => 'sometimes|integer|min:0|max:100'
                ]);
            }
            
            $task->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Task updated successfully.',
                'data' => $task->load(['user', 'assignedTo'])
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update task.'
            ], 500);
        }
    }

    /**
     * Remove the specified task.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = Auth::user();
            $task = Task::where('id', $id)->where('user_id', $user->id)->first();
            
            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found or you do not have permission to delete it.'
                ], 404);
            }
            
            $task->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Task deleted successfully.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete task.'
            ], 500);
        }
    }

    /**
     * Assign a task to a user (only for managers).
     */
    public function assignTask(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Check if user is a manager
            if ($user->role !== 'manager') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only managers can assign tasks.'
                ], 403);
            }
            
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'assigned_to' => 'required|exists:users,id',
                'status' => 'nullable|in:in_progress,future,completed',
                'progress' => 'nullable|integer|min:0|max:100'
            ]);
            
            $task = Task::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? 'future',
                'progress' => $validated['progress'] ?? 0,
                'user_id' => $user->id, // Manager who created the task
                'assigned_to' => $validated['assigned_to'] // User assigned to the task
            ]);
            
            $task->load(['user', 'assignedTo']);
            
            return response()->json([
                'success' => true,
                'message' => 'Task assigned successfully.',
                'data' => $task
            ], 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign task.'
            ], 500);
        }
    }
}
