# Beyond Solutions Component Library

This document showcases the core UI components of the Beyond Solutions platform, all styled with our new color palette. Each component follows our design principles and accessibility standards.

## Table of Contents

1. [Buttons](#buttons)
2. [Form Elements](#form-elements)
3. [Navigation](#navigation)
4. [Cards](#cards)
5. [Alerts & Notifications](#alerts--notifications)
6. [Modals & Dialogs](#modals--dialogs)
7. [Tables](#tables)
8. [Loaders & Progress Indicators](#loaders--progress-indicators)
9. [Typography Components](#typography-components)

## Buttons

Buttons are used to trigger actions or navigate between pages. They follow a consistent visual hierarchy to indicate their importance.

### Primary Button

```html
<button class="bg-primary-700 hover:bg-primary-800 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-colors">
  Primary Button
</button>
```

**Usage**: Main call-to-action, form submissions, primary actions

### Secondary Button

```html
<button class="bg-white hover:bg-primary-100 text-primary-700 font-medium py-2 px-4 rounded border border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-colors">
  Secondary Button
</button>
```

**Usage**: Alternative actions, secondary options, cancel operations

### Tertiary Button

```html
<button class="text-primary-700 hover:text-primary-800 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-colors">
  Tertiary Button
</button>
```

**Usage**: Less important actions, links that look like buttons

### Disabled Button

```html
<button class="bg-primary-300 text-primary-500 font-medium py-2 px-4 rounded cursor-not-allowed" disabled>
  Disabled Button
</button>
```

**Usage**: Unavailable actions, incomplete form submissions

### Icon Button

```html
<button class="bg-primary-700 hover:bg-primary-800 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-colors" aria-label="Add item">
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</button>
```

**Usage**: Compact UI, toolbar actions, inline actions

## Form Elements

Form elements are designed for clarity and ease of use, with consistent styling and clear feedback.

### Text Input

```html
<div class="mb-4">
  <label for="name" class="block text-primary-900 font-medium mb-1">Name</label>
  <input type="text" id="name" class="w-full px-3 py-2 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700" placeholder="Enter your name">
</div>
```

### Text Input with Error

```html
<div class="mb-4">
  <label for="email" class="block text-primary-900 font-medium mb-1">Email</label>
  <input type="email" id="email" class="w-full px-3 py-2 border border-red-500 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Enter your email">
  <p class="mt-1 text-red-500 text-sm">Please enter a valid email address.</p>
</div>
```

### Select Dropdown

```html
<div class="mb-4">
  <label for="country" class="block text-primary-900 font-medium mb-1">Country</label>
  <select id="country" class="w-full px-3 py-2 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 bg-white">
    <option value="" selected disabled>Select a country</option>
    <option value="us">United States</option>
    <option value="ca">Canada</option>
    <option value="mx">Mexico</option>
  </select>
</div>
```

### Checkbox

```html
<div class="mb-4">
  <label class="flex items-center">
    <input type="checkbox" class="h-4 w-4 text-primary-700 focus:ring-primary-700 border-primary-300 rounded">
    <span class="ml-2 text-primary-900">Subscribe to newsletter</span>
  </label>
</div>
```

### Radio Button

```html
<div class="mb-4">
  <div class="text-primary-900 font-medium mb-1">Preferred contact method</div>
  <div class="space-y-2">
    <label class="flex items-center">
      <input type="radio" name="contact" value="email" class="h-4 w-4 text-primary-700 focus:ring-primary-700 border-primary-300">
      <span class="ml-2 text-primary-900">Email</span>
    </label>
    <label class="flex items-center">
      <input type="radio" name="contact" value="phone" class="h-4 w-4 text-primary-700 focus:ring-primary-700 border-primary-300">
      <span class="ml-2 text-primary-900">Phone</span>
    </label>
  </div>
</div>
```

### Toggle Switch

```html
<div class="mb-4">
  <label class="flex items-center">
    <span class="text-primary-900 font-medium mr-3">Dark Mode</span>
    <div class="relative">
      <input type="checkbox" class="sr-only" id="toggle">
      <div class="w-10 h-5 bg-primary-300 rounded-full"></div>
      <div class="dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform" 
           :class="{ 'transform translate-x-5 bg-primary-700': checked }"></div>
    </div>
  </label>
</div>
```

## Navigation

Navigation components help users move through the application and understand their current location.

### Main Navigation

```html
<nav class="bg-primary-700 text-white py-4 px-6">
  <div class="container mx-auto flex justify-between items-center">
    <div class="flex items-center">
      <a href="#" class="font-bold text-xl">Beyond Solutions</a>
      <div class="hidden md:flex ml-6 space-x-4">
        <a href="#" class="py-2 px-3 rounded hover:bg-primary-600">Home</a>
        <a href="#" class="py-2 px-3 rounded hover:bg-primary-600">Features</a>
        <a href="#" class="py-2 px-3 rounded hover:bg-primary-600">Pricing</a>
        <a href="#" class="py-2 px-3 rounded hover:bg-primary-600">About</a>
        <a href="#" class="py-2 px-3 rounded hover:bg-primary-600">Contact</a>
      </div>
    </div>
    <div class="flex items-center">
      <button class="md:hidden p-2 rounded hover:bg-primary-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</nav>
```

### Breadcrumbs

```html
<nav class="py-3 px-6 text-sm">
  <ol class="flex items-center space-x-2">
    <li>
      <a href="#" class="text-primary-700 hover:text-primary-800">Home</a>
    </li>
    <li class="flex items-center">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-primary-400">
        <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </li>
    <li>
      <a href="#" class="text-primary-700 hover:text-primary-800">Projects</a>
    </li>
    <li class="flex items-center">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-primary-400">
        <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </li>
    <li>
      <span class="text-primary-500">Current Project</span>
    </li>
  </ol>
</nav>
```

### Pagination

```html
<div class="flex items-center justify-center space-x-1 my-8">
  <a href="#" class="px-3 py-2 rounded hover:bg-primary-100 text-primary-700">
    <span class="sr-only">Previous</span>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </a>
  <a href="#" class="px-3 py-2 rounded bg-primary-700 text-white">1</a>
  <a href="#" class="px-3 py-2 rounded hover:bg-primary-100 text-primary-700">2</a>
  <a href="#" class="px-3 py-2 rounded hover:bg-primary-100 text-primary-700">3</a>
  <span class="px-3 py-2 text-primary-500">...</span>
  <a href="#" class="px-3 py-2 rounded hover:bg-primary-100 text-primary-700">8</a>
  <a href="#" class="px-3 py-2 rounded hover:bg-primary-100 text-primary-700">
    <span class="sr-only">Next</span>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </a>
</div>
```

## Cards

Cards are used to group related content and actions in a visually distinct container.

### Basic Card

```html
<div class="bg-white rounded-lg shadow-sm p-6 border border-primary-200">
  <h3 class="text-xl font-semibold text-primary-900 mb-2">Card Title</h3>
  <p class="text-primary-700 mb-4">This is a basic card component with a title and content.</p>
  <a href="#" class="text-primary-700 hover:text-primary-800 font-medium">Learn More →</a>
</div>
```

### Feature Card

```html
<div class="bg-white rounded-lg shadow-md p-6 border border-primary-200 hover:shadow-lg transition-shadow">
  <div class="flex items-start">
    <div class="bg-primary-100 p-3 rounded-full mr-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-primary-700">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div>
      <h3 class="text-lg font-semibold text-primary-900 mb-2">Feature Title</h3>
      <p class="text-primary-700">This is a feature card with an icon, title, and description.</p>
    </div>
  </div>
</div>
```

### Project Card

```html
<div class="bg-white rounded-lg shadow-md overflow-hidden">
  <img src="https://via.placeholder.com/400x200" alt="Project Image" class="w-full h-48 object-cover">
  <div class="p-6">
    <h3 class="text-xl font-semibold text-primary-900 mb-2">Project Name</h3>
    <p class="text-primary-700 mb-4">Brief description of the project highlighting key features and benefits.</p>
    <div class="flex justify-between items-center">
      <span class="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">Residential</span>
      <button class="text-primary-700 hover:text-primary-800 font-medium">View Details</button>
    </div>
  </div>
</div>
```

## Alerts & Notifications

Alerts and notifications provide important feedback or information to users.

### Success Alert

```html
<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded" role="alert">
  <div class="flex items-start">
    <svg class="h-6 w-6 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <div>
      <p class="font-medium">Success!</p>
      <p>Your changes have been saved successfully.</p>
    </div>
  </div>
</div>
```

### Error Alert

```html
<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
  <div class="flex items-start">
    <svg class="h-6 w-6 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
    <div>
      <p class="font-medium">Error!</p>
      <p>There was a problem processing your request. Please try again.</p>
    </div>
  </div>
</div>
```

### Info Alert

```html
<div class="bg-primary-100 border-l-4 border-primary-700 text-primary-900 p-4 mb-4 rounded" role="alert">
  <div class="flex items-start">
    <svg class="h-6 w-6 mr-3 mt-0.5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <div>
      <p class="font-medium">Information</p>
      <p>This feature is only available to registered users.</p>
    </div>
  </div>
</div>
```

### Toast Notification

```html
<div class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md border-l-4 border-primary-700" role="alert">
  <div class="flex items-start">
    <svg class="h-6 w-6 mr-3 mt-0.5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <div class="flex-1">
      <p class="font-medium text-primary-900">New Message</p>
      <p class="text-primary-700">You have received a new message from John Doe.</p>
    </div>
    <button class="text-primary-500 hover:text-primary-700">
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>
</div>
```

## Modals & Dialogs

Modals and dialogs focus user attention on a specific task or information.

### Basic Modal

```html
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
    <div class="border-b border-primary-200 px-6 py-4">
      <h3 class="text-lg font-semibold text-primary-900">Modal Title</h3>
    </div>
    <div class="px-6 py-4">
      <p class="text-primary-700">This is the content of the modal dialog. It can contain text, forms, or other components.</p>
    </div>
    <div class="border-t border-primary-200 px-6 py-4 flex justify-end space-x-3">
      <button class="bg-white hover:bg-primary-100 text-primary-700 font-medium py-2 px-4 rounded border border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-colors">
        Cancel
      </button>
      <button class="bg-primary-700 hover:bg-primary-800 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-colors">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Confirmation Dialog

```html
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
    <div class="px-6 pt-6 pb-2">
      <div class="flex items-center">
        <div class="bg-red-100 rounded-full p-3 mr-4">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-primary-900">Delete Confirmation</h3>
      </div>
      <p class="text-primary-700 mt-4">Are you sure you want to delete this item? This action cannot be undone.</p>
    </div>
    <div class="px-6 py-4 flex justify-end space-x-3">
      <button class="bg-white hover:bg-primary-100 text-primary-700 font-medium py-2 px-4 rounded border border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-colors">
        Cancel
      </button>
      <button class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 transition-colors">
        Delete
      </button>
    </div>
  </div>
</div>
```

## Tables

Tables display structured data in rows and columns.

### Basic Table

```html
<div class="overflow-x-auto">
  <table class="min-w-full bg-white border border-primary-200">
    <thead>
      <tr class="bg-primary-100 text-primary-900">
        <th class="py-3 px-4 text-left font-semibold">Name</th>
        <th class="py-3 px-4 text-left font-semibold">Email</th>
        <th class="py-3 px-4 text-left font-semibold">Role</th>
        <th class="py-3 px-4 text-left font-semibold">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-primary-200">
      <tr class="hover:bg-primary-50">
        <td class="py-3 px-4 text-primary-900">John Doe</td>
        <td class="py-3 px-4 text-primary-700">john@example.com</td>
        <td class="py-3 px-4 text-primary-700">Administrator</td>
        <td class="py-3 px-4">
          <button class="text-primary-700 hover:text-primary-800 mr-2">Edit</button>
          <button class="text-red-600 hover:text-red-700">Delete</button>
        </td>
      </tr>
      <tr class="hover:bg-primary-50">
        <td class="py-3 px-4 text-primary-900">Jane Smith</td>
        <td class="py-3 px-4 text-primary-700">jane@example.com</td>
        <td class="py-3 px-4 text-primary-700">Editor</td>
        <td class="py-3 px-4">
          <button class="text-primary-700 hover:text-primary-800 mr-2">Edit</button>
          <button class="text-red-600 hover:text-red-700">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Loaders & Progress Indicators

Loaders and progress indicators provide visual feedback during loading or processing operations.

### Spinner

```html
<div class="flex justify-center items-center">
  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-700"></div>
</div>
```

### Progress Bar

```html
<div class="w-full bg-primary-200 rounded-full h-2.5">
  <div class="bg-primary-700 h-2.5 rounded-full" style="width: 45%"></div>
</div>
```

### Loading Skeleton

```html
<div class="animate-pulse">
  <div class="h-6 bg-primary-200 rounded w-3/4 mb-2"></div>
  <div class="h-4 bg-primary-200 rounded w-full mb-2"></div>
  <div class="h-4 bg-primary-200 rounded w-5/6 mb-2"></div>
  <div class="h-4 bg-primary-200 rounded w-4/6"></div>
</div>
```

## Typography Components

Typography components help create consistent text styles across the application.

### Page Title

```html
<h1 class="text-3xl font-bold text-primary-900 mb-4">Page Title</h1>
```

### Section Heading

```html
<div class="mb-6">
  <h2 class="text-2xl font-bold text-primary-900">Section Heading</h2>
  <div class="w-16 h-1 bg-primary-700 mt-2"></div>
</div>
```

### Card Heading

```html
<h3 class="text-xl font-semibold text-primary-900">Card Heading</h3>
```

### Highlighted Text

```html
<p class="text-primary-700">Regular text with <span class="text-primary-900 font-medium">highlighted text</span> for emphasis.</p>
```

### Quote

```html
<blockquote class="border-l-4 border-primary-700 pl-4 italic text-primary-700 my-4">
  <p>This is a quotation that stands out from the regular text content to highlight important information or testimonials.</p>
  <footer class="text-primary-600 mt-2">— John Doe, CEO</footer>
</blockquote>
```

---

This component library is a living document and will be updated as new components are developed or existing ones are refined. 