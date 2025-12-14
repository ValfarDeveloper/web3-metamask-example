# AI Development Guidelines

## Component Architecture

### File Structure
```
ComponentName/
├── index.js          # React component (state + render only)
├── behaviors.js      # Business logic
├── index.css        # Styles
└── components/       # Child components
    └── ChildComponent/
        ├── index.js
        ├── behaviors.js
        └── index.css
```

**Rules:**
- `index.js`: State declarations + JSX rendering only
- `behaviors.js`: All business logic, event handlers, API calls
- `index.css`: Component styles
- Child components go in `components/` subdirectory

### General Elements (Reusable Components)
Generic, highly reusable components go in `src/components/GeneralElements/`:

```
src/components/
├── GeneralElements/          # Shared UI components
│   ├── SidebarModal/         # Generic sidebar modal
│   ├── Button/               # Reusable button
│   └── Card/                 # Generic card
├── PatientList/              # Feature-specific
└── PatientDetail/            # Feature-specific
```

**When to use GeneralElements:**
- Component is used across 2+ different features
- Component has no business logic specific to one feature
- Component is a pure UI element (modals, buttons, cards, inputs)
- Component could be extracted to a component library

**Examples:**
- ✅ SidebarModal - Used by PatientList, could be used by ConsentManagement
- ✅ Button - Reusable across entire app
- ✅ Card - Generic container component
- ❌ PatientCard - Specific to patients feature, goes in `PatientList/components/`

**Structure:**
Same as regular components (index.js, behaviors.js, index.css), following all architecture rules above.

## State Management

### Single State Object
```javascript
const [state, setState] = useState({
  data: [],
  loading: false,
  error: null,
  // ... all state properties
});
```

**Benefits:**
- Fewer useState calls
- Cleaner function signatures
- Easier to scale
- All state visible in one place

### State Updates
Always use spread operator:
```javascript
setState(prev => ({ ...prev, newProp: value }));
```

## React Hooks

### Maximum 3 Lines per Hook
Extract complex logic to `behaviors.js`:

```javascript
// ✅ Good - One line
useEffect(() => fetchData(state, setState), [state.page]);

// ✅ Good - Calls behavior function
useEffect(() => {
  handleDebounce(state.input, setState);
}, [state.input]);

// ❌ Bad - Too much logic in component
useEffect(() => {
  const timer = setTimeout(() => {
    // ... complex logic
  }, 300);
  return () => clearTimeout(timer);
}, [dependency]);
```

## Business Logic (behaviors.js)

### Function Signatures
Pass `state` and `setState`:

```javascript
// Async operations
const fetchData = async (state, setState) => {
  setState(prev => ({ ...prev, loading: true }));
  try {
    const response = await api.getData(state.page);
    setState(prev => ({ ...prev, data: response, loading: false }));
  } catch (err) {
    setState(prev => ({ ...prev, error: err.message, loading: false }));
  }
};

// Sync operations
const handleInputChange = (value, setState) => {
  setState(prev => ({ ...prev, input: value }));
};

// Operations using current state
const handlePageChange = (state, setState) => {
  const newPage = state.currentPage + 1;
  setState(prev => ({ ...prev, currentPage: newPage }));
};
```

### Exports
Always destructured at end of file:
```javascript
export {
  fetchData,
  handleInputChange,
  handlePageChange,
};
```

## Anti-Patterns

### ❌ Avoid
- Multiple `useState` calls → Use single state object
- `useRef` for state data → Use `useState`
- Functions with 5+ parameters → Pass `state` object
- Logic in component files → Move to `behaviors.js`
- Hooks longer than 3 lines → Extract to `behaviors.js`

### ✅ Prefer
- Single state object with `useState`
- Simple function signatures: `(state, setState)` or `(value, setState)`
- All logic in `behaviors.js`
- One-line hooks calling behavior functions
- `useRef` only for DOM refs or subscriptions

## Code Style

- Clean and readable
- No unnecessary complexity
- Validate assumptions - ask if uncertain
- Keep it simple (KISS principle)
- Use modern CSS (Grid, Flexbox, animations)
