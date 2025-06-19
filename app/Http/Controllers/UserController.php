<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    //
    public function check(Request $request){
        $user = User::query()->where('role', '1')->first();
        if (!$user || !Hash::check($request->code, $user->admin_code)) {
            return back()->withErrors(['code' => 'Неверный код безопасности']);
        }

        // Устанавливаем флаг в сессию
        session(['is_admin_verified' => true]);

        // Перенаправляем на админку
        return redirect('/admin');
    }

    public function exit(){
        session(['is_admin_verified' => false]);
        // Перенаправляем на админку
        return redirect()->back();
    }
}
