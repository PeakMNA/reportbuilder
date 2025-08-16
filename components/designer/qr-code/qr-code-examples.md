# QR Code Component Examples

This document provides usage examples for the QR Code component in the ReportBuilder application.

## Basic Usage Examples

### 1. Simple URL QR Code
```typescript
const urlQrProperties: QrCodeProperties = {
  data: 'https://company.com/product/12345',
  size: 100,
  errorCorrection: 'Medium',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  dataSource: null
};
```

### 2. Contact Information (vCard)
```typescript
const vCardQrProperties: QrCodeProperties = {
  data: `BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Acme Corporation
TEL:+1-555-123-4567
EMAIL:john.doe@acme.com
URL:https://acme.com
END:VCARD`,
  size: 150,
  errorCorrection: 'High',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  dataSource: null
};
```

### 3. WiFi Configuration
```typescript
const wifiQrProperties: QrCodeProperties = {
  data: 'WIFI:T:WPA;S:CompanyGuest;P:password123;H:false;',
  size: 120,
  errorCorrection: 'Medium',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  dataSource: null
};
```

## Data Binding Examples

### 1. Product Catalog with Dynamic URLs
```typescript
// Properties configuration
const productQrProperties: QrCodeProperties = {
  data: 'https://fallback.com', // Fallback URL
  size: 100,
  errorCorrection: 'Medium',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  dataSource: 'csv1.product_url' // Bind to product_url field
};

// Sample data source
const productData = [
  { 
    id: 1, 
    product_name: 'Widget A', 
    product_url: 'https://store.com/products/widget-a',
    price: 25.99 
  },
  { 
    id: 2, 
    product_name: 'Widget B', 
    product_url: 'https://store.com/products/widget-b',
    price: 15.50 
  }
];
```

### 2. Customer Portal Links
```typescript
const customerPortalProperties: QrCodeProperties = {
  data: 'https://portal.company.com/login',
  size: 120,
  errorCorrection: 'Medium',
  foregroundColor: '#1f2937',
  backgroundColor: '#ffffff',
  dataSource: 'csv1.customer_portal_url'
};

// Each customer gets their own portal link
const customerData = [
  { 
    customer_name: 'Acme Corp',
    customer_portal_url: 'https://portal.company.com/customer/acme-corp',
    account_id: 'ACC-001'
  }
];
```

### 3. Tracking Numbers for Shipments
```typescript
const trackingQrProperties: QrCodeProperties = {
  data: 'TRACK12345',
  size: 80,
  errorCorrection: 'High', // High error correction for shipping labels
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  dataSource: 'csv1.tracking_number'
};

const shipmentData = [
  { 
    order_id: 'ORD-001',
    tracking_number: 'TRK-ABC123456',
    carrier: 'UPS',
    tracking_url: 'https://ups.com/track?id=TRK-ABC123456'
  }
];
```

## Report Integration Scenarios

### 1. Invoice with Customer Portal Access
- **Use Case**: Add QR codes to invoices for easy customer portal access
- **QR Content**: Customer-specific portal URL with login token
- **Size**: 100px (standard business document size)
- **Error Correction**: Medium (good balance for print/digital)

### 2. Product Catalog with Item Details
- **Use Case**: Print catalog with QR codes linking to online product pages
- **QR Content**: Product detail URLs with analytics tracking
- **Size**: 80-120px depending on layout
- **Error Correction**: Medium to High for print quality

### 3. Event Tickets with Check-in Codes
- **Use Case**: Event tickets with QR codes for quick check-in
- **QR Content**: Encrypted attendee ID and event details
- **Size**: 150px for easy mobile scanning
- **Error Correction**: High for reliability in various lighting

### 4. Shipping Labels with Tracking
- **Use Case**: Package labels with tracking QR codes
- **QR Content**: Carrier tracking URLs or tracking numbers
- **Size**: 100px standard for shipping labels
- **Error Correction**: High for durability during shipping

## Technical Specifications

### Data Format Support
- **URLs**: `https://`, `http://` (auto-detected as 'url' format)
- **Email**: `mailto:email@domain.com` (auto-detected as 'email' format)
- **Phone**: `tel:+1-555-123-4567` (auto-detected as 'phone' format)
- **WiFi**: `WIFI:T:WPA;S:NetworkName;P:password;` (auto-detected as 'wifi' format)
- **vCard**: `BEGIN:VCARD...END:VCARD` (auto-detected as 'vcard' format)
- **Location**: `geo:37.7749,-122.4194` (auto-detected as 'location' format)
- **Plain Text**: Any other content (detected as 'text' format)

### Size Constraints
- **Minimum**: 50px × 50px
- **Maximum**: 300px × 300px
- **Recommended**: 80-150px for most use cases
- **Step**: 5px increments for precise sizing

### Data Length Limits
- **Low Error Correction**: ~2,953 characters
- **Medium Error Correction**: ~2,331 characters (recommended)
- **High Error Correction**: ~1,663 characters
- **Component Behavior**: Shows warning indicator for content >100 characters

### Color Requirements
- **Foreground**: Must contrast with background (typically black #000000)
- **Background**: Must contrast with foreground (typically white #ffffff)
- **Format**: Hex color codes (#RRGGBB)
- **Accessibility**: Ensure sufficient contrast ratio for readability

## Best Practices

### 1. Content Guidelines
- **URLs**: Use HTTPS for security
- **Length**: Keep content under 200 characters for reliable scanning
- **Testing**: Test QR codes with multiple scanner apps
- **Fallback**: Always provide alternative access methods

### 2. Visual Design
- **Size**: Minimum 0.5 inch (1.27cm) for print applications
- **Quiet Zone**: Ensure white space around QR code
- **Contrast**: High contrast between foreground and background
- **Error Correction**: Use High for outdoor/industrial applications

### 3. Data Binding
- **Validation**: Validate data source field contains scannable content
- **Fallback**: Provide static fallback content for missing data
- **Preview**: Test with sample data during report design
- **Performance**: Consider QR generation performance for large datasets

### 4. Print Considerations
- **Resolution**: Ensure adequate resolution for print quality
- **Size**: Larger QR codes scan more reliably when printed
- **Paper**: White or light-colored background for best results
- **Testing**: Print test pages and verify scanning reliability