const { nanoid } = require('nanoid');
const { db } = require('../firebaseConfig');
const { admin } = require('../firebaseConfig');

// Handler untuk menyimpan data DreamProduct
const saveDataHandler = async (request, h) => {
    const { uid } = request.auth; // UID dari middleware
    console.log('Handler UID:', uid); // Debug log

    const { title, price, date_start, saved, days_saved, photo, productUrl } = request.payload; // Tambahkan productUrl
    console.log('Payload:', request.payload); // Debug payload

    // Validasi UID
    if (!uid) {
        return h.response({ error: 'UID is missing' }).code(400);
    }

    // Validasi semua field yang diperlukan
    if (!title || !price || !date_start || saved === undefined || days_saved === undefined || !photo) {
        return h.response({ error: 'Missing required fields' }).code(400);
    }

    // Validasi productUrl (jika ada)
    if (productUrl && !isValidUrl(productUrl)) {
        return h.response({ error: 'Invalid productUrl' }).code(400);
    }

    // Hitung days dan days_remaining
    const days = Math.ceil(price / saved);
    const days_remaining = days - days_saved;

    const dreamProduct = {
        product: { title, price, productUrl }, // Tambahkan productUrl ke dalam product
        goals: { days, date_start },
        tracker: { saved, days_saved, days_remaining },
    };

    try {
        const productId = nanoid(10); // ID unik
        console.log('Generated Product ID:', productId); // Debug Product ID

        // Upload foto ke bucket Firebase Storage
        const bucket = admin.storage().bucket('targetted-money-saver.firebasestorage.app');
        const fileName = `productImage/${uid}/${productId}.jpg`; // Nama file unik dalam folder productImage
        const file = bucket.file(fileName);

        // Dekode base64
        const buffer = Buffer.from(photo, 'base64');
        await file.save(buffer, {
            metadata: {
                contentType: 'image/jpeg', // Pastikan tipe konten benar
            },
        });

        console.log('File uploaded:', fileName);

        // URL publik gambar
        const photoURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        dreamProduct.photoURL = photoURL; // Tambahkan URL foto ke dokumen

        // Simpan data ke Firestore
        await db.collection('dreamProduct').doc(uid).collection('products').doc(productId).set(dreamProduct);

        return h.response({ 
            message: 'Data saved successfully', 
            id: productId, 
            photoURL, 
            productUrl 
        }).code(200);
    } catch (error) {
        console.error('Error:', error.message);
        return h.response({ error: 'Failed to save data', details: error.message }).code(500);
    }
};



// Fungsi validasi URL
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
};

// Handler untuk mendapatkan data DreamProducts berdasarkan UID
const getDreamProductHandler = async (request, h) => {
    const { uid } = request.auth; // UID from the decoded Firebase token

    try {
        // Ambil semua produk di sub-koleksi 'products'
        const productsRef = db.collection('dreamProduct').doc(uid).collection('products');
        const productsSnapshot = await productsRef.get();

        if (productsSnapshot.empty) {
            return h.response({ error: 'No products found for this user' }).code(404);
        }

        const dreamProducts = [];
        productsSnapshot.forEach(doc => {
            dreamProducts.push({ id: doc.id, ...doc.data() });
        });

        return h.response({
            message: 'Dream products fetched successfully',
            data: dreamProducts,
        }).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Failed to fetch dream products', details: error.message }).code(500);
    }
};

// Handler untuk memperbarui tabungan
const updateSavingsHandler = async (request, h) => {
    const { uid } = request.auth; // UID from the decoded Firebase token
    const { productId, amount } = request.payload; // ID produk dan jumlah tabungan baru

    if (!productId || !amount || amount <= 0) {
        return h.response({ error: 'Invalid product ID or saving amount' }).code(400);
    }

    try {
        // Ambil data produk tertentu berdasarkan productId
        const productRef = db.collection('dreamProduct').doc(uid).collection('products').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return h.response({ error: 'No product found with the specified ID' }).code(404);
        }

        // Ambil data saat ini
        const dreamProduct = productDoc.data();
        const currentSaved = dreamProduct.tracker.saved || 0;
        const currentDaysSaved = dreamProduct.tracker.days_saved || 0;

        // Tambahkan jumlah tabungan baru
        const updatedSaved = currentSaved + amount;
        const updatedDaysSaved = currentDaysSaved + 1; // Asumsikan setiap kali menabung dianggap menambah 1 hari

        // Hitung ulang days_remaining
        const daysRemaining = dreamProduct.goals.days - updatedDaysSaved;

        // Perbarui nilai di Firestore
        await productRef.update({
            "tracker.saved": updatedSaved,
            "tracker.days_saved": updatedDaysSaved,
            "tracker.days_remaining": daysRemaining
        });

        return h.response({
            message: 'Savings added successfully',
            data: {
                saved: updatedSaved,
                days_saved: updatedDaysSaved,
                days_remaining: daysRemaining,
            },
        }).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Failed to add savings', details: error.message }).code(500);
    }
};

const deleteDreamProductHandler = async (request, h) => {
    const { uid } = request.auth; // UID dari Firebase token
    const { productId } = request.payload; // Ambil productId dari body

    if (!productId) {
        return h.response({ error: 'Product ID is required' }).code(400);
    }

    try {
        // Referensi dokumen di subkoleksi
        const productRef = db.collection('dreamProduct').doc(uid).collection('products').doc(productId);

        // Cek apakah dokumen ada
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            return h.response({ error: 'No product found with the specified ID' }).code(404);
        }

        // Hapus dokumen
        await productRef.delete();

        return h.response({ message: 'Dream product deleted successfully' }).code(200);
    } catch (error) {
        console.error('Error in delete handler:', error);
        return h.response({ error: 'Failed to delete dream product', details: error.message }).code(500);
    }
};

module.exports = { saveDataHandler, getDreamProductHandler, updateSavingsHandler, deleteDreamProductHandler };
