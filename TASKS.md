# StrataFusion Tasks

## Development Environment Setup

- [x] Change default VS Code terminal to Git Bash

## DriveUI Component Architectural Improvements

### Component Structure

- [x] Split DriveUI into smaller components (current component is 500+ lines)
  - [x] Create DriveHeader component (navigation, breadcrumbs, actions)
  - [x] Create DriveTable component (file/folder listing)
  - [x] Create DriveToolbar component (search, filters, view options)
  - [x] Only allow for one instance of a service account at a time.
    - [x] eg.Only allow for one instance of Google Drive - rhounslow@gmail.com
  - [x] Create DriveEmptyState component (for empty folders/search results)
  - [x] Create DriveErrorState component (for error handling)

### Logic Extraction

- [x] Extract complex logic into custom hooks
  - [x] Create useDriveNavigation hook (folder navigation, breadcrumb management)
  - [x] Create useDriveItems hook (fetching and filtering items)
  - [x] Create useDriveSearch hook (search functionality)
  - [ ] Create useDriveUpload hook (file upload operations)

### TypeScript Improvements

- [x] Implement proper TypeScript interfaces
  - [x] Move DriveItem and related interfaces to a separate types file
  - [x] Create proper discriminated unions for different item types
  - [x] Add comprehensive JSDoc comments for better developer experience

### State Management

- [x] Improve state management
  - [x] Reduce local component state in favor of context
  - [ ] Consider using a more robust state management solution for complex state
  - [ ] Implement proper loading/error states with skeleton loaders

### Performance

- [ ] Enhance performance
  - [ ] Implement virtualization for large file lists
  - [ ] Add pagination support for folders with many items
  - [ ] Optimize re-renders with memoization (useMemo, useCallback)
  - [ ] Implement proper data caching strategy

### Error Handling

- [x] Improve error handling
  - [x] Create a consistent error handling strategy
  - [x] Fix navigation errors with RSC and browser history
  - [ ] Add retry mechanisms for failed API calls
  - [ ] Implement proper error boundaries

### Testing

- [ ] Add comprehensive testing
  - [x] Write unit tests for useDriveNavigation and useDriveItems hooks
    - [x] Write unit tests for useDriveSearch hook
    - [x] Write unit tests for remaining hooks
  - [ ] Write component tests for UI elements
  - [ ] Write integration tests for the full DriveUI component
  - [ ] Add Storybook stories for all new components

### Accessibility

- [ ] Improve accessibility
  - [ ] Ensure proper keyboard navigation
  - [ ] Add ARIA attributes for screen readers
  - [ ] Implement focus management
  - [ ] Test with screen readers

### API Interaction

- [ ] Refactor API interaction
  - [ ] Create a dedicated API client for drive operations
  - [ ] Implement proper request/response types
  - [ ] Add request cancellation for aborted operations

### DriveUI Table 

- [ ] Refactor DriveUI Table
  - [ ] Use Icon/Image instead of text for service
  - [ ] Add proper skeleton loader states
  - [ ] Add proper pagination with page size
  - [ ] Sort by column
  - [ ] Filter by column - eg. only show this service account

### Fix 

- [ ] After disconnecting from a drive update and refresh table. 