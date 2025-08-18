# Google Analytics 4 Integration

This document describes the Google Analytics 4 integration implemented for the JSONL Parser application.

## Overview

The analytics integration provides comprehensive tracking of user interactions, page views, and application performance. It's designed to be privacy-conscious and follows Google Analytics best practices.

## Architecture

### Core Components

1. **AnalyticsService** (`src/services/AnalyticsService.ts`)
   - Singleton service that manages Google Analytics 4 integration
   - Handles initialization, configuration, and event tracking
   - Provides error handling and debug capabilities

2. **useAnalytics Composable** (`src/composables/useAnalytics.ts`)
   - Vue composable that provides easy access to analytics functionality
   - Offers specialized tracking methods for different event types
   - Simplifies analytics usage throughout the application

3. **useUserTracking Composable** (`src/composables/useUserTracking.ts`)
   - Automatically tracks user behavior and interactions
   - Monitors scroll depth, clicks, form interactions, and page engagement
   - Sets up event listeners for comprehensive user behavior tracking

4. **Router Integration** (`src/router/index.ts`)
   - Automatically tracks page views and navigation events
   - Provides context about route changes and user navigation patterns

## Features

### Event Tracking

- **Page Views**: Automatic tracking of route changes and manual page view tracking
- **User Interactions**: Click tracking, scroll depth, form interactions
- **Tool Usage**: Specialized tracking for JSON parser and other tools
- **Tutorial Progress**: Track learning progress and tutorial completion
- **Sample Data**: Track sample data loading and usage
- **Performance**: Timing events and performance metrics
- **Errors**: Exception tracking and error reporting

### Privacy & Compliance

- **IP Anonymization**: Automatically anonymizes user IP addresses
- **No Personal Data**: Only tracks anonymous usage patterns
- **Consent Management**: Built-in consent handling capabilities
- **Debug Mode**: Development-only debug mode for testing

### Development Tools

- **Analytics Dashboard** (`src/components/common/AnalyticsDashboard.vue`)
  - Development-only dashboard showing real-time analytics events
  - Event history and debugging information
  - Analytics status monitoring

- **Analytics Demo** (`src/components/common/AnalyticsDemo.vue`)
  - Interactive demo component for testing analytics functionality
  - Manual event triggering for development and testing

## Configuration

### Environment Setup

The analytics service is configured in `src/main.ts`:

```typescript
const analyticsService = AnalyticsService.getInstance()

await analyticsService.init({
  measurementId: 'G-PX3P01GVCR', // Your GA4 Measurement ID
  enableDebug: import.meta.env.DEV, // Debug mode in development
  customDimensions: {
    app_version: '1.0.0',
    app_name: 'JSONL Parser'
  }
})
```

### HTML Integration

Google Analytics is loaded via the HTML head in `index.html`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PX3P01GVCR"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-PX3P01GVCR');
</script>
```

## Usage Examples

### Basic Event Tracking

```typescript
import { useAnalytics } from '@/composables/useAnalytics'

const { trackEvent, trackPageView } = useAnalytics()

// Track a custom event
trackEvent({
  category: 'user_interaction',
  action: 'button_click',
  label: 'header_menu'
})

// Track a page view
trackPageView('/tools', 'Tools Page', {
  section: 'tools',
  user_type: 'developer'
})
```

### Tool Usage Tracking

```typescript
const { trackTool } = useAnalytics()

// Track tool usage
trackTool.use('json_validator', 'large', {
  input_type: 'json',
  validation_result: 'success'
})

// Track tool success
trackTool.success('json_validator', 1500) // 1500ms processing time

// Track tool error
trackTool.error('json_validator', 'syntax_error')
```

### Tutorial Progress Tracking

```typescript
const { trackTutorial } = useAnalytics()

// Track tutorial start
trackTutorial.start('json-basics', {
  difficulty: 'beginner',
  estimated_time: 300
})

// Track progress
trackTutorial.progress('json-basics', 50) // 50% complete

// Track completion
trackTutorial.complete('json-basics', {
  completion_time: 280,
  score: 95
})
```

### Performance Tracking

```typescript
const { trackTiming, trackException } = useAnalytics()

// Track performance timing
trackTiming('json_parse', 150, 'performance', 'large_file')

// Track exceptions
trackException('JSON parsing failed', false) // non-fatal error
```

## Event Types

### Standard Events

- `page_view`: Page navigation and route changes
- `user_interaction`: General user interactions (clicks, scrolls, etc.)
- `tool`: Tool usage and results
- `tutorial`: Learning progress and completion
- `sample`: Sample data interactions
- `navigation`: Menu clicks and search
- `performance`: Timing and performance metrics
- `exception`: Error tracking

### Custom Parameters

All events support custom parameters for additional context:

```typescript
trackEvent({
  category: 'user_interaction',
  action: 'feature_toggle',
  customParameters: {
    feature_name: 'dark_mode',
    previous_state: 'light',
    user_preference: 'auto'
  }
})
```

## Testing

### Development Mode

In development mode, the analytics integration includes:

- Debug logging to console
- Real-time analytics dashboard
- Interactive demo component
- Event history and monitoring

### Unit Tests

Analytics functionality is tested in:

- `src/__tests__/services/AnalyticsService.test.ts`
- `src/__tests__/composables/useAnalytics.test.ts`

### Manual Testing

Use the Analytics Demo component (visible only in development) to manually test different event types and verify tracking functionality.

## Privacy Considerations

### Data Collection

The analytics integration only collects:

- Anonymous usage patterns
- Page views and navigation
- Feature usage statistics
- Performance metrics
- Error reports (without personal data)

### Data NOT Collected

- Personal information
- User content or data
- Identifiable information
- Sensitive application data

### Compliance

- IP addresses are automatically anonymized
- No cookies are set by the application
- Users can disable analytics if needed
- Follows GDPR and privacy best practices

## Troubleshooting

### Common Issues

1. **Analytics not initializing**
   - Check that the measurement ID is correct
   - Verify that gtag script is loaded
   - Check browser console for errors

2. **Events not tracking**
   - Ensure analytics service is initialized
   - Check that analytics is enabled
   - Verify debug mode shows events in console

3. **Development vs Production**
   - Debug mode is only enabled in development
   - Some features may behave differently in production
   - Test in both environments

### Debug Mode

Enable debug mode to see detailed logging:

```typescript
analyticsService.enableDebugMode()
```

This will log all analytics events to the browser console with detailed information.

## Future Enhancements

Potential improvements to the analytics integration:

1. **Enhanced E-commerce Tracking**: Track feature usage as virtual purchases
2. **Custom Dimensions**: Add more custom dimensions for better segmentation
3. **Conversion Tracking**: Track specific user goals and conversions
4. **A/B Testing Integration**: Support for Google Optimize or similar tools
5. **Real-time Reporting**: Dashboard for real-time analytics data
6. **Advanced Segmentation**: User cohort analysis and advanced segmentation

## References

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [gtag.js Reference](https://developers.google.com/analytics/devguides/collection/gtagjs)
- [Vue.js Analytics Best Practices](https://vuejs.org/guide/best-practices/performance.html)