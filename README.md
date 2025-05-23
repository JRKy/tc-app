# TimeSync - Global Time Zone Planner

A modern, responsive PWA for planning meetings across time zones with confidence.

## ✨ Features

- 🌍 **Smart Time Zone Planning** - Compare times across multiple zones
- ⏰ **Flexible Time Frames** - Choose from 2-24 hour windows  
- 🎯 **Optimal Meeting Detection** - Highlights best times for all participants
- 📱 **Progressive Web App** - Install on desktop and mobile
- 🌙 **Dark Mode Support** - Easy on the eyes
- 🖨️ **Print-Friendly** - Clean export for sharing
- 📴 **Offline Ready** - Works without internet connection

## 🚀 Quick Start

1. **Open**: Visit the live app or open `index.html`
2. **Set Date & Time**: Choose your meeting date and start time (UTC)
3. **Select Duration**: Pick your meeting time frame (2-24 hours)
4. **Add Time Zones**: Add locations for all participants
5. **Find Perfect Time**: Look for ✨ highlighted optimal slots

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

### Planning a Global Team Meeting
1. Set date to next Monday
2. Choose 4-hour duration starting at 14:00 UTC
3. Add zones: `America/New_York`, `Europe/London`, `Asia/Singapore`
4. Find the ✨ highlighted slots where everyone is awake!

### Quick Client Check-in
1. Use 2-hour duration for focused planning
2. Add client's time zone and yours
3. Export or share the clean schedule

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across browsers
5. Submit a pull request

## 🆕 What's New in v2.0

- Complete UI/UX redesign with modern aesthetics
- Customizable time frames instead of full-day view
- PWA support with offline functionality
- Touch-optimized mobile interface
- Smart meeting time detection with visual highlights
- Embedded styles and scripts for single-file simplicity

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Live Demo](https://JRKy.github.io/tc-app)
- [Report Issues](https://github.com/JRKy/tc-app/issues)
- [Feature Requests](https://github.com/JRKy/tc-app/discussions)
