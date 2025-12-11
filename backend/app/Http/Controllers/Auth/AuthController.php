<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\AccountConfirmation;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'role' => 'required|in:admin,staff,student',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'firstname' => $validated['firstname'],
            'lastname' => $validated['lastname'],
            'name' => $validated['firstname'] . ' ' . $validated['lastname'],
            'role' => $validated['role'],
            'is_active' => $validated['role'] === 'student' ? false : true, // Students need activation
            'email_verification_token' => Str::random(60),
        ]);

        // Send confirmation email
        if ($user->role === 'student') {
            Mail::to($user->email)->send(new AccountConfirmation($user));
        }

        return response()->json([
            'message' => 'User registered successfully. ' . 
                ($user->role === 'student' ? 'Please check your email to activate your account.' : '')
        ], 201);
    }

    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember_me' => 'boolean'
        ]);

        $credentials = request(['email', 'password']);
        
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Unauthorized. Invalid credentials.'
            ], 401);
        }

        $user = $request->user();

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is not active. Please check your email to activate your account.'
            ], 403);
        }

        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->only(['id', 'name', 'email', 'role'])
        ]);
    }

    /**
     * Logout user (Revoke the token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Get the authenticated User
     */
    public function user(Request $request)
    {
        return response()->json($request->user()->only(['id', 'name', 'email', 'role']));
    }

    /**
     * Verify email address
     */
    public function verifyEmail($token)
    {
        $user = User::where('email_verification_token', $token)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid verification token'], 404);
        }

        $user->update([
            'is_active' => true,
            'email_verified_at' => now(),
            'email_verification_token' => null
        ]);

        return response()->json(['message' => 'Email verified successfully']);
    }
}
