# ReportBuilder Quick Start Guide

**Get up and running with ReportBuilder in under 5 minutes!**

## 🚀 Quick Setup

### 1. Start the Application
```bash
cd /Users/peak/dev/reportbuilder
npm run dev
```

### 2. Access the Designer
Open your browser to: **http://localhost:3000/designer**

### 3. Quick Demo Workflow

**Step 1: View Sample Data**
- The app loads with sample Sales Data (1,248 rows)
- Data preview panel shows CSV data at the bottom

**Step 2: Add a Component**
- Drag "Text Label" from the left palette to the canvas
- Select the component to see properties panel

**Step 3: Bind Data to Component**
- In properties panel, click "Data Binding" 
- Use the visual field mapper to drag data fields to component properties
- See live preview of bound data

**Step 4: Export**
- Click "Export PDF" in header to generate report

## 🎯 Key Features Demo

### **Visual Data Binding**
- Drag `customer_name` field → `content` property
- See real-time preview with "Acme Corp" sample data
- Type-safe mapping with color-coded data types

### **Component Library**
- **Popular**: Text Label, Data Field, Table, Chart
- **Layout**: Headers, Footers, Dividers, Containers
- **Data**: Formula, Group Banner/Footer
- **Media**: Image, QR Code
- **Shapes**: Rectangle, Circle

### **Data Sources**
- CSV/Excel file upload
- Sample data pre-loaded
- Real-time data preview
- Type detection and validation

## 📊 Feature Registry

Visit **http://localhost:3000/features** to see:
- 52 tracked features across 8 categories
- 92% overall completion status
- Real-time progress monitoring
- Feature validation criteria

## 🛠️ Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build  
npm run lint     # Code quality check
npm run test     # Run test suite
```

## 📁 Project Structure

```
reportbuilder/
├── app/designer/              # Main designer interface
├── app/features/              # Feature registry dashboard
├── components/designer/       # Core designer components
├── components/ui/             # ShadCN UI library
├── lib/                       # Utilities and stores
└── docs/                      # Documentation
```

## 🎨 UI Components

### **Main Interface Layout**
- **Header**: Navigation and controls
- **Left Sidebar**: Component palette (drag-and-drop)
- **Center**: Design canvas
- **Right Sidebar**: Properties panel
- **Bottom Panel**: Data preview

### **Key Interactions**
- **Drag & Drop**: Components from palette to canvas
- **Selection**: Click components to edit properties
- **Data Binding**: Visual field-to-property mapping
- **Zoom**: Canvas scaling (50%-200%)

## 🔧 Troubleshooting

### **Common Issues**
- **Port in use**: App runs on 3001 if 3000 is busy
- **Build errors**: Run `npm run lint` to check code quality
- **Data not loading**: Check browser console for errors

### **Reset Development Environment**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📚 Documentation

- **MVP Completion Report**: `MVP-COMPLETION-REPORT.md`
- **Project Handoff**: `PROJECT-HANDOFF.md`
- **Next Phase Roadmap**: `NEXT-PHASE-ROADMAP.md`
- **Technical Specs**: `UX-UI-Implementation-Plan.md`

## 🎯 Success Indicators

✅ **Application loads without errors**  
✅ **Component palette shows 16 components**  
✅ **Data preview displays sample CSV data**  
✅ **Drag and drop works from palette**  
✅ **Properties panel updates on selection**  
✅ **Feature registry shows 92% completion**

## 🚀 Ready for Next Steps

Once you've completed the quick demo:
1. **Review Feature Registry** for development priorities
2. **Check Project Handoff** for technical details  
3. **Explore Next Phase Roadmap** for future development
4. **Start advanced feature development**

**Happy building! 🎉**