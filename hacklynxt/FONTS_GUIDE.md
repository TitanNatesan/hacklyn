# Professional Fonts Guide

The Hacklyn frontend now includes professional Google Fonts for enhanced typography. Here's how to use them:

## Available Fonts

### 1. **Inter** (Default Sans-serif)
- **Usage**: Default body text, regular content
- **Tailwind Class**: `font-sans` (default)
- **CSS Class**: (applied automatically to body)
- **Best for**: Body text, descriptions, regular content
- **Example**:
  ```jsx
  <p className="font-sans">Regular content using Inter</p>
  ```

### 2. **Outfit** (Display Font)
- **Usage**: Headings, main titles
- **Tailwind Class**: `font-display`
- **CSS Class**: `.font-display`
- **Best for**: Main page headings, hero titles
- **Example**:
  ```jsx
  <h1 className="font-display text-4xl font-bold">Your Heading</h1>
  ```

### 3. **Poppins** (Modern Professional)
- **Usage**: Modern, friendly professional content
- **Tailwind Class**: `font-poppins`
- **CSS Class**: `.font-poppins`
- **Best for**: Section headings, call-to-action text, navigation
- **Example**:
  ```jsx
  <h2 className="font-poppins font-bold text-2xl">Modern Heading</h2>
  <button className="font-poppins font-semibold">Click Me</button>
  ```

### 4. **Roboto** (Classic Professional)
- **Usage**: Corporate, traditional professional look
- **Tailwind Class**: `font-roboto`
- **CSS Class**: `.font-roboto`
- **Best for**: Dashboard content, business text, formal sections
- **Example**:
  ```jsx
  <div className="font-roboto">
    <p className="font-medium">Professional content</p>
  </div>
  ```

### 5. **Playfair Display** (Elegant Serif)
- **Usage**: Elegant, sophisticated, premium feel
- **Tailwind Class**: `font-elegant`
- **CSS Class**: `.font-elegant`
- **Best for**: Event titles, hero sections, premium content
- **Example**:
  ```jsx
  <h1 className="font-elegant text-5xl">Premium Event Title</h1>
  ```

## Font Weight Options

All fonts support these weights for styling:

| Font             | Weights                      | Usage                                                                    |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------ |
| Inter            | 300, 400, 500, 600, 700      | `font-light`, `font-normal`, `font-medium`, `font-semibold`, `font-bold` |
| Outfit           | 300, 400, 500, 600, 700, 800 | `font-light` to `font-black`                                             |
| Poppins          | 400, 500, 600, 700, 800      | `font-normal` to `font-black`                                            |
| Roboto           | 400, 500, 700                | `font-normal`, `font-medium`, `font-bold`                                |
| Playfair Display | 600, 700, 800                | `font-semibold`, `font-bold`, `font-black`                               |

## Usage Examples

### Professional Dashboard
```jsx
<div className="font-roboto">
  <h2 className="font-bold text-xl">Dashboard Statistics</h2>
  <p className="font-medium text-gray-600">Active Users</p>
</div>
```

### Modern Card
```jsx
<Card>
  <h3 className="font-poppins font-bold text-lg">Event Highlights</h3>
  <p className="font-sans text-gray-600">Join us for an amazing experience</p>
</Card>
```

### Premium Hero Section
```jsx
<section>
  <h1 className="font-elegant text-6xl font-bold text-primary">
    Welcome to Hacklyn
  </h1>
  <p className="font-poppins text-lg text-muted-foreground mt-4">
    The ultimate hackathon platform
  </p>
</section>
```

### Business Form
```jsx
<form>
  <label className="font-roboto font-medium">Organization Name</label>
  <input className="font-sans border rounded" />
</form>
```

## Best Practices

1. **Consistency**: Use the same font family for similar content types
2. **Hierarchy**: 
   - Main title: Elegant (Playfair)
   - Section headings: Poppins or Outfit
   - Body text: Inter
   - Professional sections: Roboto

3. **Performance**: Google Fonts are optimized and cached by browsers

4. **Readability**: Always pair fonts with appropriate sizes and weights

## Current Font Stack

- **Body**: Inter (sans-serif)
- **Headings**: Outfit (display font)
- **Utility classes**: Poppins, Roboto, Playfair available via classes

All fonts are imported from Google Fonts with display=swap for optimal loading performance.
