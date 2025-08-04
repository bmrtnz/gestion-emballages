// backend/data/seedUtils.js
const Minio = require('minio');
const fs = require('fs');
const path = require('path');

// Create local MinIO client for seeder (bypass Docker service names)
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_EXTERNAL_HOST || 'localhost',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER || 'VOTRE_ACCESS_KEY',
    secretKey: process.env.MINIO_ROOT_PASSWORD || 'VOTRE_SECRET_KEY'
});

const bucketName = 'documents';

/**
 * Delete all objects from MinIO bucket
 */
async function clearMinIOBucket() {
    try {
        console.log('Clearing MinIO bucket...');
        
        // List all objects in the bucket
        const objectsStream = minioClient.listObjectsV2(bucketName, '', true);
        const objects = [];
        
        return new Promise((resolve, reject) => {
            objectsStream.on('data', obj => objects.push(obj.name));
            objectsStream.on('error', reject);
            objectsStream.on('end', async () => {
                if (objects.length === 0) {
                    console.log('MinIO bucket is already empty');
                    resolve();
                    return;
                }
                
                // Delete all objects
                console.log(`Deleting ${objects.length} objects from MinIO...`);
                for (const objectName of objects) {
                    try {
                        await minioClient.removeObject(bucketName, objectName);
                    } catch (err) {
                        console.error(`Error deleting ${objectName}:`, err);
                    }
                }
                console.log('MinIO bucket cleared successfully');
                resolve();
            });
        });
    } catch (error) {
        console.error('Error clearing MinIO bucket:', error);
        throw error;
    }
}

/**
 * Generate a placeholder SVG image with text
 */
async function generatePlaceholderImage(text, width = 400, height = 300) {
    const lines = text.split('\n');
    const lineHeight = 24;
    const startY = height / 2 - (lines.length * lineHeight) / 2;
    
    const textElements = lines.map((line, index) => 
        `<text x="50%" y="${startY + index * lineHeight}" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
            ${line}
        </text>`
    ).join('\n');
    
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="#ddd" stroke-width="2"/>
            ${textElements}
        </svg>
    `;
    
    return Buffer.from(svg);
}

/**
 * Generate a proper PDF file
 */
async function generatePlaceholderPDF(title, content) {
    const PDFDocument = require('pdfkit');
    
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });
            
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            
            // Add header
            doc.fontSize(20)
               .fillColor('#2563eb')
               .text(title, { align: 'center' });
            
            doc.moveDown(2);
            
            // Add a separator line
            doc.strokeColor('#e5e7eb')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke();
            
            doc.moveDown(1);
            
            // Add content
            doc.fontSize(12)
               .fillColor('#374151')
               .text(content, {
                   align: 'left',
                   lineGap: 5
               });
            
            doc.moveDown(3);
            
            // Add footer
            doc.fontSize(10)
               .fillColor('#9ca3af')
               .text(`Generated on: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' })
               .text(`Document ID: ${Math.random().toString(36).substring(7)}`, { align: 'center' });
            
            // Add a simple logo/watermark
            doc.fontSize(8)
               .fillColor('#e5e7eb')
               .text('GESTION EMBALLAGES - Document de Test', 50, 750, { align: 'center' });
            
            doc.end();
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Upload a file to MinIO and return its URL
 */
async function uploadToMinIO(buffer, fileName, contentType) {
    try {
        const metadata = {
            'Content-Type': contentType
        };
        
        await minioClient.putObject(bucketName, fileName, buffer, buffer.length, metadata);
        
        // Return the file key (fileName) instead of full URL
        // The URL will be constructed by the application when needed
        return fileName;
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
        throw error;
    }
}

/**
 * Generate and upload supplier documents
 */
async function generateSupplierDocuments(supplier) {
    const uploadedDocuments = [];
    
    for (const doc of supplier.documents) {
        try {
            let buffer;
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(7);
            let fileName;
            let contentType;
            
            // Generate PDF based on document type
            const pdfContent = `
Document Type: ${doc.typeDocument}
Supplier: ${supplier.nom}
Specialization: ${supplier.specialisation}

This is a placeholder document for ${doc.nomDocument}.
It certifies that ${supplier.nom} meets the requirements for ${doc.typeDocument}.

Valid until: ${new Date(doc.dateExpiration).toLocaleDateString('fr-FR')}
            `;
            
            buffer = await generatePlaceholderPDF(doc.nomDocument, pdfContent);
            fileName = `${timestamp}-${randomStr}-${doc.nomDocument.replace(/\s+/g, '_')}.pdf`;
            contentType = 'application/pdf';
            
            const fileKey = await uploadToMinIO(buffer, fileName, contentType);
            
            uploadedDocuments.push({
                ...doc,
                urlStockage: fileKey
            });
            
        } catch (error) {
            console.error(`Error generating document ${doc.nomDocument}:`, error);
            uploadedDocuments.push(doc); // Keep original if upload fails
        }
    }
    
    return uploadedDocuments;
}

/**
 * Generate and upload article images
 */
async function generateArticleImage(articleCode, articleName, supplierName) {
    try {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        
        const text = `${articleCode}\n${articleName.substring(0, 30)}...\n${supplierName}`;
        const buffer = await generatePlaceholderImage(text);
        
        const fileName = `${timestamp}-${randomStr}-article_${articleCode}.svg`;
        const fileKey = await uploadToMinIO(buffer, fileName, 'image/svg+xml');
        
        return fileKey;
    } catch (error) {
        console.error(`Error generating image for article ${articleCode}:`, error);
        return null;
    }
}

module.exports = {
    clearMinIOBucket,
    generatePlaceholderImage,
    generatePlaceholderPDF,
    uploadToMinIO,
    generateSupplierDocuments,
    generateArticleImage
};