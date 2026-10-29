<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileAvatarPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_uploaded_avatar_is_saved_and_returned_after_login(): void
    {
        Storage::fake('public');

        $user = User::create([
            'name' => 'Profile Owner',
            'email' => 'profile-owner@example.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user, 'sanctum')->post('/api/v1/user/profile', [
            '_method' => 'PUT',
            'first_name' => 'Profile',
            'last_name' => 'Owner',
            'email' => 'profile-owner@example.com',
            'phone' => '081234567890',
            'avatar' => UploadedFile::fake()->image('avatar.png'),
        ])->assertOk();

        $avatarUrl = $response->json('user.avatar');
        $this->assertNotEmpty($avatarUrl);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'avatar' => $avatarUrl,
        ]);

        $this->getJson('/api/v1/profile')
            ->assertOk()
            ->assertJsonPath('data.avatar', $avatarUrl);

        Auth::forgetGuards();
        Auth::shouldUse('web');
        $this->postJson('/api/v1/login', [
            'email' => 'profile-owner@example.com',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('data.user.avatar', $avatarUrl);

        $storedPath = ltrim(parse_url($avatarUrl, PHP_URL_PATH), '/');
        $this->assertStringStartsWith('storage/', $storedPath);
        Storage::disk('public')->assertExists(substr($storedPath, strlen('storage/')));
    }
}
