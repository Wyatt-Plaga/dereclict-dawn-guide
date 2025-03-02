# Setting Up a Favicon for Derelict Dawn

A favicon is the small icon that appears in browser tabs, bookmarks, and other UI elements. This guide explains how to set up a favicon for your game.

## Quick Setup

1. Generate your favicon files using one of the tools mentioned below
2. Place the files in the `public` directory
3. Update your layout file to include the favicon links

## Required Files

For comprehensive browser support, prepare these files:

- `favicon.ico` - 16x16, 32x32, 48x48 (multi-size ICO file)
- `favicon-16x16.png` - 16x16 PNG
- `favicon-32x32.png` - 32x32 PNG
- `apple-touch-icon.png` - 180x180 PNG (for iOS devices)
- `android-chrome-192x192.png` - 192x192 PNG (for Android)
- `android-chrome-512x512.png` - 512x512 PNG (for Android)
- `site.webmanifest` - JSON file with app metadata

## HTML Links

Add these link tags to your layout file (`app/layout.tsx`):

```tsx
// app/layout.tsx
export const metadata = {
  title: 'Derelict Dawn',
  description: 'A space-themed idle game',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
};
```

## Favicon Generator Tools

### RealFaviconGenerator

[RealFaviconGenerator](https://realfavicongenerator.net/) is a comprehensive tool that:

1. Accepts an image upload (recommend at least 512x512px)
2. Allows customization for different platforms
3. Generates all necessary files and HTML code
4. Provides a package to download

### Favicon.io

[Favicon.io](https://favicon.io/) is simple and allows you to:

1. Generate favicons from text, images, or emojis
2. Choose fonts and colors for text-based favicons
3. Download a complete package of icons

## Design Suggestions

For a space-themed idle game like Derelict Dawn, consider:

1. **Minimalist Spaceship Silhouette**
   - Simple, recognizable outline of a spacecraft

2. **Stylized "DD" with a Space Theme**
   - Initials with a futuristic font
   - Subtle space elements like stars or orbital lines

3. **Energy Core Icon**
   - Glowing reactor or energy symbol
   - Fits the reactor theme of the game

4. **Cryo-Pod Silhouette**
   - Represents the "awakening crew" mechanic
   - Simple line art of a cryo-pod or sleeping crew member

## Example webmanifest

Create a `site.webmanifest` file in your public directory:

```json
{
  "name": "Derelict Dawn",
  "short_name": "DD",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e",
  "display": "standalone"
}
```

## Additional Tips

- **Keep it Simple**: Favicons are small, so simple designs work best
- **Test Across Browsers**: Check how your favicon appears in different browsers
- **Dark Mode Support**: Consider how your favicon appears against dark browser themes
- **Cache Issues**: If updating an existing favicon, you may need to clear browser cache to see changes 