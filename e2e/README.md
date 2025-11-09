# End-to-End Tests

This directory contains end-to-end tests for the PDF to Flipbook converter using Playwright.

## Test Overview

The e2e tests verify the complete user workflow:
1. Generate a flipbook from a PDF file
2. Serve the flipbook via HTTP
3. Test the flipbook interface in multiple browsers
4. Verify navigation, responsiveness, and functionality

## Running Tests

### Prerequisites
- Node.js and npm installed
- Project built (`npm run build`)
- Playwright browsers installed (`npm run test:e2e:install`)

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Tests in Specific Browser
```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit (Safari) only
npx playwright test --project=webkit
```

### View Test Results
```bash
npx playwright show-report
```

## Test Structure

### `flipbook.spec.ts`
Main test suite covering:

- **Flipbook Generation**: Verifies that the flipbook is created correctly from sample.pdf
- **Page Loading**: Checks that flipbook.html loads and displays properly
- **Image Loading**: Ensures WebP images are generated and load correctly
- **Navigation Controls**: Tests button-based navigation (First, Previous, Next, Last)
- **Keyboard Navigation**: Tests arrow keys, spacebar, Home, and End keys
- **Mouse Navigation**: Tests clicking left/right edges of pages
- **Progress Tracking**: Verifies progress bar updates
- **Responsive Design**: Tests mobile viewport behavior
- **Cross-Browser Compatibility**: Runs on Chromium, Firefox, and WebKit
- **File Structure**: Verifies all required files are generated

## Test Configuration

The tests are configured in `playwright.config.ts`:
- Runs on multiple browsers (Chromium, Firefox, WebKit)
- Tests mobile viewports (Chrome Mobile, Safari Mobile)
- Automatically starts a local HTTP server to serve the flipbook
- Generates HTML reports for test results

## Test Fixtures

- **Input**: `../sample.pdf` - Sample PDF file used as input
- **Output**: `./test-flipbook/` - Temporary directory for generated flipbook (cleaned up after tests)

## Troubleshooting

### Common Issues

1. **"Command failed" during flipbook generation**
   - Ensure the project is built: `npm run build`
   - Check that sample.pdf exists in the parent directory

2. **Browser tests fail to start**
   - Install browsers: `npm run test:e2e:install`
   - Check that HTTP server can start on port 3000

3. **Images don't load in tests**
   - Ensure CORS headers are enabled (configured in playwright.config.ts)
   - Check that WebP files were generated in the test-flipbook directory

### Debug Mode
```bash
# Run tests with debug mode
npx playwright test --debug

# Run tests in headed mode (see browser)
npx playwright test --headed
```

## Continuous Integration

For CI environments, the tests are configured to:
- Run in headless mode
- Use a single worker to avoid resource conflicts
- Retry failed tests (2 retries on CI)

## Test Coverage

The e2e tests cover:
- ✅ Complete conversion workflow
- ✅ User interface functionality
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness
- ✅ Keyboard and mouse navigation
- ✅ File generation validation

