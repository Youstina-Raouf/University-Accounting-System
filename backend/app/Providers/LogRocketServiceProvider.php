<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;

class LogRocketServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Blade::directive('logrocket', function ($expression) {
            $appId = config('services.logrocket.app_id');
            
            if (empty($appId)) {
                return "<!-- LogRocket not configured -->";
            }

            return "<?php echo '\n' . '<!-- LogRocket -->' . '\n' . '<script src=\"https://cdn.lr-ingest.com/LogRocket.min.js\"></script>' . '\n' . '<script>window.LogRocket && window.LogRocket.init(\'" . $appId . "\');</script>' . '\n'; ?>";
        });

        Blade::directive('logrocketidentify', function ($expression) {
            return "<?php if (app()->environment('production') && \Auth::check()) { echo '<script>window.LogRocket && window.LogRocket.identify(' . $expression . ');</script>'; } ?>";
        });
    }
}
