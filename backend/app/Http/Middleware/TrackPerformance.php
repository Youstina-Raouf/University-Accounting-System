<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TrackPerformance
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Start timing
        $start = microtime(true);
        
        // Process the request
        $response = $next($request);
        
        // Calculate execution time
        $executionTime = microtime(true) - $start;
        
        // Get memory usage in MB
        $memoryUsage = memory_get_peak_usage(true) / 1024 / 1024; // Convert to MB
        
        // Log performance metrics to the API channel
        $logger = Log::channel('api');
        $logger->info('API Request', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'user_id' => $request->user() ? $request->user()->id : null,
            'performance' => [
                'execution_time_ms' => round($executionTime * 1000, 2),
                'memory_usage_mb' => round($memoryUsage, 2),
            ],
            'response' => [
                'status_code' => $response->getStatusCode(),
                'content_type' => $response->headers->get('Content-Type'),
            ],
        ]);
        
        // Add performance headers to the response
        $response->headers->set('X-Execution-Time', round($executionTime * 1000, 2) . 'ms');
        $response->headers->set('X-Memory-Usage', round($memoryUsage, 2) . 'MB');
        
        return $response;
    }
}
