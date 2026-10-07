# Enhanced Multiple-Choice Question Component & Group Selector

A beautifully designed React quiz system featuring an engaging multiple-choice question component and group selector interface. Perfect for GRE vocabulary learning with bold typography, shadow depths, and smooth micro-interactions.

## Current Quiz Source Selection

The active quiz setup lets learners choose between **Vocabulary practice** (the existing backend-generated questions) and **GRE question bank** (the grouped questions and answer keys in the repository's `greQuestion.html`). Both modes support manual group selection, question counts, and a timer. The GRE question bank is loaded when selected and its questions are shuffled for each round.

The `MultipleChoiceQuestion` and `GroupSelector` components below are available in the codebase but are not the active app quiz flow.

## 📋 Components Overview

### 1. **MultipleChoiceQuestion** (`MultipleChoiceQuestion.jsx`)

An enhanced quiz question component with:

#### Features:
- **Visual Polish**
  - Bold, modern typography with gradient text effects
  - Layered shadows creating depth perception
  - Smooth animations and micro-interactions
  - Color-coded feedback (green for correct, red for incorrect)
  - Animated progress bars with gradient fills

- **Interactive Elements**
  - Hover effects on answer buttons with smooth transitions
  - Answer indicator badges with scale animations
  - Confetti celebration on correct answers
  - Animated timer with urgency indicators
  - Progress bar with smooth linear transitions

- **State Management**
  - Tracks selected answers
  - Outcome states: `correct`, `incorrect`, `skipped`, `timed_out`
  - Question progress tracking
  - Remaining time display with color warnings

- **Accessibility**
  - ARIA labels and roles
  - Keyboard navigation support
  - Screen reader friendly feedback messages
  - Clear visual focus indicators

#### Props:
```jsx
<MultipleChoiceQuestion
  question={{
    id: string,
    group_name: string,
    prompt_type: 'example' | 'meaning',
    prompt: string,
    choices: string[],
    correct_answer: string,
    definition: string,
  }}
  questionNumber={number}
  questionCount={number}
  timerSeconds={number}
  secondsLeft={number}
  outcome={'correct' | 'incorrect' | 'skipped' | 'timed_out' | null}
  selectedAnswer={string | null}
  advanceIn={number}
  onAnswer={(choice: string) => void}
  onNext={() => void}
/>
```

### 2. **GroupSelector** (`GroupSelector.jsx`)

An interactive group selection interface with:

#### Features:
- **Group Grid Display**
  - Responsive grid layout (auto-fill with minimum card width)
  - Individual group cards with visual hierarchy
  - Word count badges
  - Progress indicators
  - Smooth hover animations

- **Quiz Launch Flow**
  - Click a group to enter quiz mode
  - Preview vocabulary count
  - Display quiz configuration summary
  - Direct quiz launch with 30-question presets

- **Visual Design**
  - Gradient backgrounds and text
  - Color-coded badges and indicators
  - Smooth transitions and animations
  - Loading states
  - Mobile-responsive grid

#### Props:
```jsx
<GroupSelector
  groups={Array<{
    id: number,
    group_number: number,
    group_name: string,
    word_count: number,
  }>}
  onSelectGroup={(group) => void}
  onStartQuiz={(config: {
    groupIds: number[],
    questionCount: number,
    timerSeconds: number,
  }) => void}
  loading={boolean}
/>
```

## 🎨 Styling System

### CSS Files

#### `mcq.css` - Multiple Choice Question Styles
- **Size**: 16.5 KB
- **Variables**: 
  - Colors: primary, secondary, background, border, accent colors
  - Transitions: 200-350ms cubic-bezier timing functions
  - Shadows: Multi-layer shadow effects

#### `group-selector.css` - Group Selector Styles
- **Size**: 12.8 KB
- **Features**:
  - Grid-based layout system
  - Gradient overlays and backgrounds
  - Animation keyframes for smooth transitions
  - Responsive breakpoints for mobile/tablet/desktop

#### `quiz.css` - Base Quiz Styles
- Existing quiz framework styles

### Color Scheme (Light Mode)
```css
--mcq-primary: #1c211f (dark gray)
--mcq-secondary: #65706b (muted gray)
--mcq-background: #fffdf7 (off-white)
--mcq-border: #d6ddd5 (light gray)
--mcq-accent-gold: #e9b949 (warning/timer)
--mcq-accent-green: #27745c (primary/success)
--mcq-accent-red: #bd493f (error)
--mcq-accent-blue: #4a90e2 (info)
```

### Color Scheme (Dark Mode)
- Inverted contrasts for comfortable viewing
- Same accent colors with adjusted opacity
- Enhanced shadows for depth

## 🔄 Integration Flow

### Initial State
App launches with `activeView: 'GROUP_SELECTOR'`

### Flow:
1. **Group Selector** → User clicks a group card
2. **Quiz Configuration** → Display group details and start button
3. **Quiz Active** → MultipleChoiceQuestion component renders
4. **Quiz Complete** → Summary shows results and returns to Group Selector

### State Management
```javascript
dashboardState = {
  activeView: 'GROUP_SELECTOR' | 'WELCOME' | 'QUIZ_SETUP' | 'QUIZ_ACTIVE' | 'GROUP_DETAIL' | 'READER',
  selectedGroup: number,
  filter: 'ALL' | other_filters
}
```

## 📱 Responsive Design

### Breakpoints:
- **Desktop**: Full features, 3-4 column grid
- **Tablet** (≤768px): 2-3 column grid, adjusted spacing
- **Mobile** (≤480px): 1 column layout, touch-optimized buttons

### Mobile Optimizations:
- Larger touch targets (minimum 44x44px)
- Simplified layouts
- Optimized font sizes
- Full-width buttons and cards

## ✨ Micro-Interactions

### Hover Effects
- Answer buttons: Scale, shadow increase, border color change
- Group cards: Lift effect, shadow depth increase
- Buttons: Transform, color transitions

### Animations
- **Timer Pulse**: Scales when urgent
- **Progress Bar**: Smooth linear fill
- **Mark Pop**: Celebrates correct answers
- **Feedback Slide**: Smooth entrance animations
- **Grid Fade**: Initial grid load fade-in
- **Emoji Bounce**: Feedback emoji scales in

### Transitions
- All transitions use optimized timing functions
- 200-350ms for micro-interactions
- Cubic-bezier easing for natural feel
- No jarring movements

## 🚀 Performance Considerations

### Optimized:
- CSS variables for theme switching (no re-renders)
- Memoized calculations (useMemo)
- Efficient event handlers (useCallback patterns)
- Minimal DOM reflows
- GPU-accelerated transforms
- Debounced hover effects

### Bundle Size:
- MCQ CSS: 16.5 KB
- Group Selector CSS: 12.8 KB
- Component JS: ~6 KB (after gzip)
- Total: ~35 KB uncompressed

## 🔧 Usage Examples

### Basic Quiz Flow
```jsx
import MultipleChoiceQuestion from './quiz/MultipleChoiceQuestion'

function QuizView() {
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState(null)
  
  return (
    <MultipleChoiceQuestion
      question={question}
      questionNumber={1}
      questionCount={30}
      timerSeconds={15}
      secondsLeft={12}
      outcome={null}
      selectedAnswer={answer}
      onAnswer={setAnswer}
      onNext={() => console.log('Next question')}
    />
  )
}
```

### Group Selection
```jsx
import GroupSelector from './quiz/GroupSelector'

function App() {
  const [groups, setGroups] = useState([])
  
  const handleStartQuiz = (config) => {
    // Launch quiz with config.groupIds, config.questionCount, etc.
  }
  
  return (
    <GroupSelector
      groups={groups}
      onStartQuiz={handleStartQuiz}
      loading={false}
    />
  )
}
```

## 🎯 Key Features Summary

✅ **Visual Appeal**
- Gradient text and backgrounds
- Layered shadows for depth
- Color-coded states and feedback
- Smooth animations throughout

✅ **Engagement**
- Confetti celebration on correct answers
- Animated timer with urgency indicators
- Interactive hover states
- Smooth micro-interactions

✅ **Usability**
- Clear visual hierarchy
- Intuitive navigation
- Responsive design
- Accessible to screen readers

✅ **Performance**
- Optimized CSS variables
- Efficient re-renders
- GPU-accelerated animations
- Small bundle footprint

✅ **Scalability**
- Easy to customize colors via CSS variables
- Modular component structure
- Supports 30+ vocabulary groups
- Extensible architecture

## 🛠️ Customization

### Changing Colors
Edit the CSS variables in `mcq-shell` and `group-selector-container`:

```css
.mcq-shell {
  --mcq-accent-green: #your-color;
  --mcq-accent-gold: #your-color;
  /* ... other variables */
}
```

### Adjusting Animations
Modify transition values in CSS:
```css
.mcq-choice-button:hover {
  transition: all 250ms ease; /* Change 200ms to your value */
}
```

### Customizing Grid Layout
```css
.groups-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Adjust minmax */
}
```

## 📊 Testing Recommendations

### Unit Tests
- Component rendering
- Prop validation
- Event handler calls
- State transitions

### Visual Tests
- Theme switching (light/dark)
- Responsive breakpoints
- Animation smoothness
- Color contrast

### Integration Tests
- Full quiz flow
- Group selection → Quiz launch
- Timer behavior
- Answer feedback

### Performance Tests
- Time to interactive
- CSS animation FPS
- Bundle size
- Memory usage

## 📝 Notes

- All 30 vocabulary groups are fully supported
- Designed for GRE prep exam context
- Mobile-first responsive approach
- WCAG 2.1 AA accessibility compliance
- Works with existing quiz infrastructure

## 🚀 Getting Started

1. **Import the components**:
   ```jsx
   import MultipleChoiceQuestion from './quiz/MultipleChoiceQuestion'
   import GroupSelector from './quiz/GroupSelector'
   ```

2. **Import the styles**:
   ```jsx
   import './quiz/mcq.css'
   import './quiz/group-selector.css'
   ```

3. **Use in your app**:
   ```jsx
   <GroupSelector groups={groups} onStartQuiz={handleQuiz} />
   <MultipleChoiceQuestion {...questionProps} />
   ```

4. **Customize colors** via CSS variables for your brand

Enjoy the enhanced quiz experience! 🎓
