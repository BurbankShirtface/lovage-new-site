# Lovage Restaurant Website - Revamped

A modern, responsive website for Lovage Restaurant featuring an elegant design inspired by contemporary restaurant websites like Beba, Prime Seafood Palace, and Fat Rabbit.

## ✨ New Features

### 🎨 **Modern Design**

- Clean, minimalist aesthetic with improved typography
- Responsive design that works on all devices
- Enhanced visual hierarchy and spacing
- Smooth animations and hover effects

### 🍽️ **Enhanced Menu System**

- **Three menu types**: Lunch, Dinner, and Drinks
- **Accordion-style display**: Click to expand/collapse each menu section
- **Dynamic content**: Menus load automatically from your backend
- **Latest indicator**: Shows which menu is most recent
- **Upload date display**: Shows when each menu was last updated

### 🚀 **Improved User Experience**

- Sticky header with smooth navigation
- Hero section with restaurant branding
- Better mobile responsiveness
- Improved accessibility features
- Smooth scrolling between sections

### 🔧 **Enhanced Admin Panel**

- **Updated uploader**: Now supports drinks menus
- **Better file handling**: Improved error handling and validation
- **Modern interface**: Redesigned to match the new aesthetic
- **File preview**: See your menu before uploading

## 🏗️ Technical Improvements

### **Frontend**

- Modern CSS with CSS Grid and Flexbox
- Google Fonts integration (Marcellus + Inter)
- Improved JavaScript with better error handling
- Lazy loading for menu images
- Responsive breakpoints for all screen sizes

### **Backend**

- Enhanced `/menus` endpoint supporting drinks
- Better error handling and validation
- Improved file upload system
- Support for multiple menu types

## 🚀 Getting Started

### **Prerequisites**

- Node.js (v14 or higher)
- Firebase project with Storage enabled
- Environment variables configured

### **Installation**

1. **Clone/Download** the project files
2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables** in `.env`:

   ```env
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD=your_password
   # Firebase config should already be in firebase-config.js
   ```

4. **Start the server**:

   ```bash
   npm start
   ```

5. **Access your site**:
   - **Public site**: `http://localhost:3000`
   - **Admin panel**: `http://localhost:3000/uploader.html`

## 📱 How to Use

### **For Restaurant Staff (Admin)**

1. **Access the admin panel** at `/uploader.html`
2. **Upload new menus**:
   - Select menu file (JPEG, PNG, HEIC, WebP, PDF)
   - Choose menu type (Lunch, Dinner, or Drinks)
   - Click "Upload Menu"
3. **Reset menus** if needed using the reset button

### **For Customers**

1. **Browse menus** by clicking on Lunch, Dinner, or Drinks sections
2. **View latest menus** with upload dates
3. **Make reservations** via the Reservations section
4. **Find contact information** and hours in the Contact section

## 🎨 Customization

### **Colors**

The site uses a sophisticated color palette:

- **Primary Green**: `#143d2c` (Deep forest green)
- **Secondary Green**: `#0f2f23` (Darker accent)
- **Warm White**: `#f7f6e9` (Text and highlights)
- **Accent**: `#b4b3a6` (Parchment/beige)

### **Typography**

- **Headings**: Marcellus (elegant serif)
- **Body**: Inter (clean, readable sans-serif)

### **Layout**

- **Container width**: 1200px max
- **Responsive breakpoints**: 768px, 900px, 480px
- **Grid system**: CSS Grid for menu layouts

## 🔄 Menu Management

### **Supported File Types**

- JPEG (.jpg, .jpeg)
- PNG (.png)
- HEIC (.heic) - automatically converted to JPEG
- WebP (.webp)
- PDF (.pdf)

### **File Requirements**

- **Maximum size**: 5MB
- **Recommended dimensions**: 800px+ width for good quality
- **Format**: Any of the supported types above

### **Upload Process**

1. Select file from your device
2. Choose menu type (Lunch/Dinner/Drinks)
3. Upload - file is processed and stored
4. Menu automatically appears on the website

## 📱 Responsive Design

The website is fully responsive with:

- **Desktop**: Full layout with side-by-side content
- **Tablet**: Adjusted spacing and grid layouts
- **Mobile**: Single-column layout with optimized touch targets

## 🚀 Performance Features

- **Lazy loading** for menu images
- **Optimized fonts** with preconnect
- **Efficient CSS** with minimal repaints
- **Smooth animations** with hardware acceleration

## 🛠️ Troubleshooting

### **Common Issues**

1. **Menus not loading**:

   - Check Firebase configuration
   - Verify file permissions
   - Check browser console for errors

2. **Upload failures**:

   - Ensure file size is under 5MB
   - Check file format is supported
   - Verify admin credentials

3. **Styling issues**:
   - Clear browser cache
   - Check CSS file is loading
   - Verify Google Fonts are accessible

### **Debug Mode**

Enable console logging by checking the browser's developer tools for any error messages.

## 🔮 Future Enhancements

Potential improvements for future versions:

- **Menu categories** (Appetizers, Mains, Desserts)
- **Seasonal menu rotation**
- **Online ordering integration**
- **Customer reviews and ratings**
- **Event booking system**
- **Newsletter signup**

## 📞 Support

For technical support or questions about the website:

- **Email**: [Your contact email]
- **Documentation**: This README file
- **Code comments**: Inline documentation in source files

## 📄 License

This project is proprietary software for Lovage Restaurant.

---

**Built with ❤️ for Lovage Restaurant**  
_Stratford, Ontario_
