# Install PDFKit for PDF Generation

To fix the PDF generation in the seeder, you need to install the PDFKit dependency:

```bash
cd backend
npm install pdfkit@0.15.0
```

## What This Fixes

The seeder was previously creating fake text files with `.pdf` extensions that couldn't be opened as PDFs. Now it will generate proper PDF documents with:

- Professional formatting
- Headers and footers
- Proper PDF structure
- Readable content that matches the document type

## After Installation

1. **Install the dependency**: `npm install pdfkit@0.15.0`
2. **Re-run the seeder**: `npm run data:import`
3. **Test the documents**: Click on document icons in the Fournisseur page

The PDFs will now open correctly in browsers and PDF viewers.