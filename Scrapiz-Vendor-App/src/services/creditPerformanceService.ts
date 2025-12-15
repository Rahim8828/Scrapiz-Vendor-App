interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  cacheHit?: boolean;
  dataSize?: number;
  error?: string;
}

interface PerformanceStats {
  averageDuration: number;
  totalOperations: number;
  successRate: number;
  cacheHitRate: number;
  slowOperations: PerformanceMetric[];
}

/**
 * Performance monitoring service for credit system operations
 * Tracks timing, cache hits, and identifies bottlenecks
 */
export class CreditPerformanceService {
  private static instance: CreditPerformanceService;
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 operations
  private slowOperationThreshold = 1000; // 1 second threshold

  private constructor() {}

  static getInstance(): CreditPerformanceService {
    if (!CreditPerformanceService.instance) {
      CreditPerformanceService.instance = new CreditPerformanceService();
    }
    return CreditPerformanceService.instance;
  }

  /**
   * Start timing an operation
   */
  startOperation(operation: string): string {
    const operationId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const metric: PerformanceMetric = {
      operation,
      startTime: performance.now(),
      success: false,
    };

    // Store with operation ID for later completion
    (metric as any).id = operationId;
    this.metrics.push(metric);

    // Maintain max metrics limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    return operationId;
  }

  /**
   * Complete an operation timing
   */
  completeOperation(
    operationId: string, 
    success: boolean = true, 
    cacheHit: boolean = false,
    dataSize?: number,
    error?: string
  ): void {
    const metric = this.metrics.find(m => (m as any).id === operationId);
    if (!metric) return;

    const endTime = performance.now();
    metric.endTime = endTime;
    metric.duration = endTime - metric.startTime;
    metric.success = success;
    metric.cacheHit = cacheHit;
    metric.dataSize = dataSize;
    metric.error = error;

    // Log slow operations
    if (metric.duration > this.slowOperationThreshold) {
      console.warn(`Slow operation detected: ${metric.operation} took ${metric.duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get performance statistics for an operation type
   */
  getOperationStats(operation?: string): PerformanceStats {
    const relevantMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation && m.duration !== undefined)
      : this.metrics.filter(m => m.duration !== undefined);

    if (relevantMetrics.length === 0) {
      return {
        averageDuration: 0,
        totalOperations: 0,
        successRate: 0,
        cacheHitRate: 0,
        slowOperations: [],
      };
    }

    const totalDuration = relevantMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const successfulOps = relevantMetrics.filter(m => m.success).length;
    const cacheHits = relevantMetrics.filter(m => m.cacheHit).length;
    const slowOps = relevantMetrics.filter(m => (m.duration || 0) > this.slowOperationThreshold);

    return {
      averageDuration: totalDuration / relevantMetrics.length,
      totalOperations: relevantMetrics.length,
      successRate: (successfulOps / relevantMetrics.length) * 100,
      cacheHitRate: (cacheHits / relevantMetrics.length) * 100,
      slowOperations: slowOps.slice(-10), // Last 10 slow operations
    };
  }

  /**
   * Get overall system performance summary
   */
  getPerformanceSummary(): {
    operations: { [key: string]: PerformanceStats };
    systemHealth: 'good' | 'warning' | 'critical';
    recommendations: string[];
  } {
    const operationTypes = [...new Set(this.metrics.map(m => m.operation))];
    const operations: { [key: string]: PerformanceStats } = {};

    for (const operation of operationTypes) {
      operations[operation] = this.getOperationStats(operation);
    }

    // Determine system health
    const overallStats = this.getOperationStats();
    let systemHealth: 'good' | 'warning' | 'critical' = 'good';
    const recommendations: string[] = [];

    if (overallStats.averageDuration > 500) {
      systemHealth = 'warning';
      recommendations.push('Consider optimizing slow operations or increasing cache usage');
    }

    if (overallStats.successRate < 95) {
      systemHealth = 'critical';
      recommendations.push('High error rate detected - investigate failing operations');
    }

    if (overallStats.cacheHitRate < 30) {
      recommendations.push('Low cache hit rate - consider preloading frequently accessed data');
    }

    if (overallStats.slowOperations.length > 5) {
      systemHealth = systemHealth === 'good' ? 'warning' : 'critical';
      recommendations.push('Multiple slow operations detected - review performance bottlenecks');
    }

    return {
      operations,
      systemHealth,
      recommendations,
    };
  }

  /**
   * Clear old metrics to free memory
   */
  clearOldMetrics(olderThanMs: number = 24 * 60 * 60 * 1000): void {
    const cutoffTime = Date.now() - olderThanMs;
    this.metrics = this.metrics.filter(m => m.startTime > cutoffTime);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration !== undefined);
  }

  /**
   * Measure and execute a function with performance tracking
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    cacheHit: boolean = false
  ): Promise<T> {
    const operationId = this.startOperation(operation);
    
    try {
      const result = await fn();
      const dataSize = typeof result === 'string' 
        ? result.length 
        : JSON.stringify(result).length;
      
      this.completeOperation(operationId, true, cacheHit, dataSize);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.completeOperation(operationId, false, cacheHit, undefined, errorMessage);
      throw error;
    }
  }

  /**
   * Measure synchronous function execution
   */
  measureSync<T>(
    operation: string,
    fn: () => T,
    cacheHit: boolean = false
  ): T {
    const operationId = this.startOperation(operation);
    
    try {
      const result = fn();
      const dataSize = typeof result === 'string' 
        ? result.length 
        : JSON.stringify(result).length;
      
      this.completeOperation(operationId, true, cacheHit, dataSize);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.completeOperation(operationId, false, cacheHit, undefined, errorMessage);
      throw error;
    }
  }

  /**
   * Get real-time performance metrics for monitoring
   */
  getRealTimeMetrics(): {
    recentOperations: number;
    averageResponseTime: number;
    errorRate: number;
    cacheEfficiency: number;
  } {
    const recentTime = Date.now() - 60000; // Last minute
    const recentMetrics = this.metrics.filter(
      m => m.startTime > recentTime && m.duration !== undefined
    );

    if (recentMetrics.length === 0) {
      return {
        recentOperations: 0,
        averageResponseTime: 0,
        errorRate: 0,
        cacheEfficiency: 0,
      };
    }

    const totalDuration = recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const errors = recentMetrics.filter(m => !m.success).length;
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;

    return {
      recentOperations: recentMetrics.length,
      averageResponseTime: totalDuration / recentMetrics.length,
      errorRate: (errors / recentMetrics.length) * 100,
      cacheEfficiency: (cacheHits / recentMetrics.length) * 100,
    };
  }
}

// Export singleton instance
export const creditPerformanceService = CreditPerformanceService.getInstance();