<?php

use App\Http\Controllers\AttributeController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\StoreRegistrationController;
use App\Http\Controllers\DashController;
use App\Http\Controllers\ExeController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentHistoryController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SubscriptionQuotaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Stripe\Stripe;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::middleware('guest')->group(function () {
    // ====== STORES ======
    Route::get('/store-registrations', [StoreRegistrationController::class, 'index']);
    Route::post('/store-registrations', [StoreRegistrationController::class, 'register']);
});

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     $user = $request->user();

//     $user->getRoleNames(); 
//     $user->getAllPermissions();

//     return response()->json([
//         'user' => $user,
//     ]);
// });

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    $user = $request->user();

    return response()->json([
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'photo' => $user->photo,
            'multi_store' => $user->multi_store,
            'roles' => $user->getRoleNames(), // Mengambil daftar peran
            'permissions' => $user->getAllPermissions()->pluck('name'), // Mengambil daftar nama izin
            'stores' => $user->stores,
        ],
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('/users', UserController::class);
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword'])->name('profile.change-password');
    Route::apiResource('/{storeId}/customers', CustomerController::class);
    Route::apiResource('/{storeId}/members', MemberController::class);
    Route::resource('/{storeId}/suppliers', SupplierController::class);
    Route::resource('/{storeId}/employees', EmployeeController::class);
    Route::post('/products/import', [ProductController::class, 'importStore'])->name('products.importStore');
    Route::get('/products/export', [ProductController::class, 'exportData'])->name('products.exportData');
    Route::resource('/{storeId}/products', ProductController::class);
    Route::resource('/{storeId}/categories', CategoryController::class);
    // ====== POS ======
    Route::get('/{storeId}/pos', [PosController::class, 'index'])->name('pos.index');
    Route::get('/{storeId}/product-sku', [ProductController::class, 'indexSKU']);
    Route::post('/{storeId}/pos/add', [PosController::class, 'addCart'])->name('pos.addCart');
    Route::post('/{storeId}/pos/update/{rowId}', [PosController::class, 'updateCart'])->name('pos.updateCart');
    Route::get('/{storeId}/pos/delete/{rowId}', [PosController::class, 'deleteCart'])->name('pos.deleteCart');
    Route::post('/{storeId}/pos/invoice/create', [PosController::class, 'createInvoice'])->name('pos.createInvoice');
    Route::post('/{storeId}/pos/invoice/print', [PosController::class, 'printInvoice'])->name('pos.printInvoice');
    // Create Order
    Route::post('/{storeId}/pos/order', [OrderController::class, 'storeOrder'])->name('pos.storeOrder');
    Route::put('/{storeSlug}/orders/update/status', [OrderController::class, 'updateStatus'])->name('order.updateStatus');
    Route::post('/{storeId}/pos/midtrans_token', [OrderController::class, 'midtransToken']);

    Route::get('/{storeSlug}/orders', [OrderController::class, 'completeOrders'])->name('order.completeOrders');
    Route::get('/{storeSlug}/orders-product', [OrderController::class, 'completeProductOrders']);
    Route::get('/{storeSlug}/top-product', [OrderController::class, 'topProducts']);
    Route::get('/{storeSlug}/orders/details/{order_id}', [OrderController::class, 'orderDetails'])->name('order.orderDetails');
    Route::get('/{storeSlug}/orders/invoice/download/{order_id}', [OrderController::class, 'invoiceDownload'])->name('order.invoiceDownload');
    // Pending Due
    Route::get('/pending/due', [OrderController::class, 'pendingDue'])->name('order.pendingDue');
    Route::get('/order/due/{id}', [OrderController::class, 'orderDueAjax'])->name('order.orderDueAjax');
    Route::post('/update/due', [OrderController::class, 'updateDue'])->name('order.updateDue');
    // Stock Management
    Route::get('/stock', [OrderController::class, 'stockManage'])->name('order.stockManage');
    // ====== STORES REGISTRATION ======
    Route::post('/store-registrations/{id}/approve', [StoreRegistrationController::class, 'approve']);
    // ====== STORES ======
    Route::apiResource('/stores', StoreController::class);
    Route::apiResource('/permissions', PermissionController::class);
    Route::apiResource('/roles', RoleController::class);
    // Role Permissions
    Route::get('/role/permission', [RolePermissionController::class, 'index']);
    Route::get('/role/permission/{id}', [RolePermissionController::class, 'show']);
    Route::put('/role/permission/{id}', [RolePermissionController::class, 'update']);
    Route::resource('/{storeId}/attributes', AttributeController::class);
});

// subscriptions
// ==========>
Route::post('subscriptions-test', [SubscriptionQuotaController::class, 'store'])->middleware('auth:sanctum');
Route::get('/subscription/current', [SubscriptionController::class, 'current'])->middleware('auth:sanctum');
Route::post('/subscription/midtrans-callback', [SubscriptionController::class, 'handleMidtransCallback']);
Route::post('/payment/create', [PaymentController::class, 'createPayment'])->middleware('auth:sanctum');
Route::post('/payment/notification', [PaymentController::class, 'handlePaymentNotification'])->middleware('auth:sanctum');
Route::post('/subscription/add-quota', [SubscriptionController::class, 'addQuota'])->middleware('auth:sanctum');
Route::post('/subscription/save-quota', [SubscriptionController::class, 'saveQuota'])->middleware('auth:sanctum');
Route::post('/subscription/handle-add-quota', [SubscriptionController::class, 'handleAddQuota'])->middleware('auth:sanctum');
Route::get('/quota-settings', [SubscriptionController::class, 'fetchQuotaSettings'])->middleware('auth:sanctum');
Route::get('/payment-history/last', [PaymentHistoryController::class, 'getLastPaymentHistory'])->middleware('auth:sanctum');
// ==========>

Route::get('plans', [PlanController::class, 'index'])->name('subscriptions.plans');
Route::get('subscriptions', [PlanController::class, 'indexSub'])->name('subscriptions');
Route::post('subscriptions', [PlanController::class, 'store']);
Route::post('subscription', [SubscriptionController::class, 'store'])->middleware('auth:sanctum');

Route::get('account', [PlanController::class, 'accountIndex']);
Route::get('detail', [PlanController::class, 'subscriptionDetail']);
Route::get('cancel', [Plancontroller::class, 'cancel']);
Route::get('resume', [Plancontroller::class, 'resume']);
Route::post('cancel', [SubscriptionController::class, 'cancel'])->name('account.subscriptions.cancel');
Route::post('resume', [SubscriptionController::class, 'resume'])->name('account.subscriptions.resume');
Route::post('stripe/setup-intent', function (Request $request) {
    return response()->json([
        'clientSecret' => $request->user()->createSetupIntent()->client_secret
    ]);
})->middleware('auth:sanctum');

Route::get('/settings', [SettingController::class, 'index']); // Get all settings
Route::get('/settings/{key}', [SettingController::class, 'show']); // Get specific setting
Route::put('/settings/{key}', [SettingController::class, 'update']); // Update setting

Route::get('/exe', [ExeController::class, 'index'])->middleware('auth:sanctum');

Route::post('/multi', [SettingController::class, 'multi'])->middleware('auth:sanctum');

Route::get('/owner-dash', [DashController::class, 'onwerDash'])->middleware('auth:sanctum');
Route::get('/owner-dash-orders', [DashController::class, 'orders'])->middleware('auth:sanctum');
Route::get('/owner-dash-topproducts', [DashController::class, 'topProducts'])->middleware('auth:sanctum');
Route::get('/admin-dash', [DashController::class, 'adminDash'])->middleware('auth:sanctum');

Route::apiResource('/payment-histories', PaymentHistoryController::class);
Route::get('/get-onwer-quota', [SubscriptionController::class, 'getOwnerStatistics'])->middleware('auth:sanctum');

Route::get('/active-subscriptions', [SubscriptionController::class, 'getActiveSubscriptions']);

require __DIR__ . '/api_auth.php';