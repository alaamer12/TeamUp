# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-06-16

### Added
- Admin mode with hidden access (Ctrl+Shift+A)
- Admin ability to edit and delete any team request
- Supabase integration for secure database storage
- Team members table for more detailed team requirements
- Enhanced documentation for graduation project focus
- TypeScript support for improved type safety

### Changed
- Migrated from MongoDB to Supabase (PostgreSQL)
- Improved fingerprinting algorithm for better reliability
- Updated UI components with Shadcn UI
- Enhanced offline synchronization mechanism

### Fixed
- Fingerprint truncation bug in ownership verification
- Inconsistent property naming (camelCase vs snake_case)
- Admin authentication security issues

## [1.1.0] - 2024-06-13

### Added
- Team request editing functionality
- Offline mode support with local storage fallback
- Visual indicators for offline status
- Server-side update endpoint for team requests
- Batch script for easy server startup on Windows

### Changed
- Improved error handling and user feedback
- Enhanced API client with multi-port fallback mechanism
- Updated documentation to reflect new features

## [1.0.0] - 2024-06-10

### Added
- Initial release of TeamUp platform
- Team discovery and request functionality
- User dashboard for managing requests
- Search and filtering capabilities
- Backend API for data persistence
- Responsive design for all device sizes
- Browser fingerprinting for ownership verification

### Changed
- Migrated from local storage to server-based storage
- Updated API endpoints for better RESTful design

### Fixed
- Date formatting issues in team cards
- Search functionality performance improvements
- Mobile layout issues on smaller screens 