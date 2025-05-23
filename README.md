# TimeSync

A modern, accessible time zone event planner web app.

## Features

- **Modern UI/UX**: Material-inspired design with consistent use of Google Material Icons.
- **Accessibility**: ARIA roles, labels, skip links, focus styles, and semantic HTML structure.
- **Time Zone Management**: Add and remove time zones with smart validation.
- **Table Generation**: Generate a table with correct time slot highlighting for work, sleep, and off hours.
- **Export Options**: Copy table as plain text and add events to Google, Outlook, and Apple Calendar.
- **Theme Toggle**: Switch between light and dark themes.

## Getting Started

1. Clone the repository.
2. Open `index.html` in your browser.
3. Start planning your events!

## Development

- **Debug Logs**: Debug logs have been removed for a cleaner console output.
- **Cache Control**: A custom Python server script is available to serve files with cache control headers disabled for development.

## Changelog

### Latest Changes
- Removed debug console logs for cleaner output.
- Added 'Copy Table' button to export table as plain text.
- Integrated calendar buttons for Google, Outlook, and Apple Calendar.
- Improved theme toggle for better accessibility and clarity.

### Previous Changes
- Refactored CSS and HTML for a modern, Material-inspired look.
- Updated all time displays and helper text to use 24-hour format.
- Enhanced accessibility with ARIA roles, labels, skip links, focus styles, and semantic HTML structure.
- Implemented a modular code structure, splitting logic into config.js, storage.js, timezone.js, ui.js, and table.js.

## ✨ Features

- 🌍 **Event-Centric Planning** - Set your event time and location, see how it appears globally
- ⏰ **Flexible Time Frames** - Choose from 2-24 hour windows  
- 🎯 **Smart Time Detection** - Highlights optimal times for all viewers
- 📱 **Progressive Web App** - Install on desktop and mobile
- 🌙 **Dark Mode Support** - Easy on the eyes
- 🖨️ **Print-Friendly** - Clean export for sharing
- 📴 **Offline Ready** - Works without internet connection

## 🚀 Quick Start

1. **Set Event Details**: Choose date, time, and timezone for your event
2. **Add Viewer Locations**: Add time zones where people will be viewing
3. **See Global Times**: Event timezone appears first, then viewer times
4. **Find Optimal Slots**: Look for ✨ highlighted times when everyone's awake

## 📱 Installation

### As a PWA:
- **Desktop**: Click the install button in your browser's address bar
- **Mobile**: Use "Add to Home Screen" from your browser menu

### Self-Hosted:
```bash
git clone https://github.com/JRKy/tc-app
cd tc-app
# Serve with any static file server
python -m http.server 8000
# or
npx serve .
```

## 🛠️ Technology

- **Vanilla JavaScript** - No dependencies
- **CSS Grid & Flexbox** - Responsive design
- **Web APIs**: Intl, Service Worker, Web Share
- **PWA Features**: Offline support, installable

## 📋 Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers with PWA support

## 🎯 Usage Examples

### Planning a Global Product Launch
1. Set event: "March 15, 2:00 PM in New York"
2. Add viewer zones: London, Tokyo, Sydney
3. See how 2 PM NYC = 7 PM London = 4 AM Tokyo = 6 AM Sydney
4. Find better time that works for more people

### Scheduling a Team Call
1. Set event: "Tomorrow, 10:00 AM in Denver" 
2. Add team locations: Toronto, Berlin, Mumbai
3. Get instant visibility of local times for everyone
4. Export clean schedule to share

## 🆕 What's New in v3.0

- **Event-centric design** - Plan from the event's perspective
- **Automatic time sync** - All times calculated from the event's timezone
- **Viewer-focused display** - See how your event appears to different audiences
- **Enhanced mobile experience** - Touch-optimized for all devices
- **Improved timezone handling** - More reliable time calculations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across browsers
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Live Demo](https://JRKy.github.io/tc-app)
- [Report Issues](https://github.com/JRKy/tc-app/issues)
- [Feature Requests](https://github.com/JRKy/tc-app/discussions)
