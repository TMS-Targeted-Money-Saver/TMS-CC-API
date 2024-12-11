const { nanoid } = require('nanoid');
const { db } = require('../firebaseConfig');
const { admin } = require('../firebaseConfig');

// Handler untuk menyimpan data DreamGoal
const saveDataHandler = async (request, h) => {
    const { uid } = request.auth; // UID dari middleware
    console.log('Handler UID:', uid); // Debug log

    const { 
        goal_image, 
        goal_title, 
        goal_amount, 
        goal_description, 
        goal_category, 
        goal_period, 
        goal_date_started, 
        amount_saved, 
        days_saved, 
        daily_save 
    } = request.payload;

    console.log('Payload:', request.payload); // Debug payload

    // Validasi UID
    if (!uid) {
        return h.response({ error: 'UID is missing' }).code(400);
    }

    // Validasi semua field yang diperlukan
    if (
        !goal_image || !goal_title || !goal_amount || !goal_description || 
        !goal_category || !goal_period || !goal_date_started || !daily_save
    ) {
        return h.response({ error: 'Missing required fields' }).code(400);
    }

    // Pastikan nilai default 0 untuk amount_saved dan days_saved
    const defaultAmountSaved = amount_saved ?? 0;
    const defaultDaysSaved = days_saved ?? 0;

    // Hitung days_remaining berdasarkan period dan days_saved
    const days_remaining = Math.max(goal_period - defaultDaysSaved, 0);

    const dreamGoal = {
        goal: { 
            image: '', 
            title: goal_title, 
            amount: goal_amount, 
            description: goal_description, 
            category: goal_category, 
            period: goal_period, 
            date_started: goal_date_started 
        },
        tracker: { 
            amount_saved: defaultAmountSaved, 
            days_saved: defaultDaysSaved, 
            days_remaining, 
            daily_save 
        },
    };

    try {
        const goalId = nanoid(10); // ID unik
        console.log('Generated Goal ID:', goalId); // Debug Goal ID

        // Upload gambar ke bucket Firebase Storage
        const bucket = admin.storage().bucket('targetted-money-saver.appspot.com'); // Format nama bucket yang benar
        const fileName = `goalImages/${uid}/${goalId}`; // Hilangkan ekstensi agar fleksibel
        let contentType = '';
    
        // Deteksi tipe konten berdasarkan header Base64
        const match = goal_image.match(/^data:(image\/\w+);base64,/);
        if (!match) {
            throw new Error('Invalid Base64 format');
        }
    
        contentType = match[1]; // Ambil tipe konten dari Base64
        const base64Data = goal_image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
    
        // Validasi tipe gambar yang diizinkan
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(contentType)) {
            throw new Error('Unsupported image type. Only JPG, JPEG, and PNG are allowed.');
        }
    
        // Tentukan ekstensi file berdasarkan tipe konten
        const extension = contentType.split('/')[1];
        const fullFileName = `${fileName}.${extension}`;
    
        // File di bucket
        const file = bucket.file(fullFileName);
    
        // Simpan file ke bucket Firebase Storage
        await file.save(buffer, {
            metadata: {
                contentType: contentType, // Gunakan contentType yang terdeteksi
            },
        });
    
        console.log('File uploaded:', fullFileName);
    
        // URL publik gambar
        const imageURL = `https://storage.googleapis.com/${bucket.name}/${fullFileName}`;
        dreamGoal.goal.image = imageURL; // Tambahkan URL gambar ke dokumen
    
        // Simpan data ke Firestore
        await db.collection('dreamGoals').doc(uid).collection('goals').doc(goalId).set(dreamGoal);
    
        return h.response({ 
            message: 'Data saved successfully', 
            id: goalId, 
            imageURL 
        }).code(200);
    
    } catch (error) {
        console.error('Error:', error.message);
        return h.response({ error: 'Failed to save data', details: error.message }).code(500);
    }
};


// Handler untuk mendapatkan data DreamGoals berdasarkan UID
const getDreamProductHandler = async (request, h) => {
    const { uid } = request.auth; // UID from the decoded Firebase token

    try {
        // Ambil semua goal di sub-koleksi 'goals'
        const goalsRef = db.collection('dreamGoals').doc(uid).collection('goals');
        const goalsSnapshot = await goalsRef.get();

        if (goalsSnapshot.empty) {
            return h.response({ error: 'No goals found for this user' }).code(404);
        }

        const dreamGoals = [];
        goalsSnapshot.forEach(doc => {
            dreamGoals.push({ id: doc.id, ...doc.data() });
        });

        return h.response({
            message: 'Dream goals fetched successfully',
            data: dreamGoals,
        }).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Failed to fetch dream goals', details: error.message }).code(500);
    }
};

// Handler untuk memperbarui tabungan
const updateSavingsHandler = async (request, h) => {
    const { uid } = request.auth; // UID from the decoded Firebase token
    const { goalId } = request.payload; // ID goal, tidak perlu savingsAmount dari body

    if (!goalId) {
        return h.response({ error: 'Goal ID is required' }).code(400);
    }

    try {
        // Ambil data goal tertentu berdasarkan goalId
        const goalRef = db.collection('dreamGoals').doc(uid).collection('goals').doc(goalId);
        const goalDoc = await goalRef.get();

        if (!goalDoc.exists) {
            return h.response({ error: 'No goal found with the specified ID' }).code(404);
        }

        // Ambil data saat ini
        const dreamGoal = goalDoc.data();
        const dailySave = dreamGoal.tracker.daily_save; // Ambil nilai daily_save

        if (!dailySave || dailySave <= 0) {
            return h.response({ error: 'Invalid daily_save value in the goal data' }).code(400);
        }

        const currentSaved = dreamGoal.tracker.amount_saved || 0;
        const currentDaysSaved = dreamGoal.tracker.days_saved || 0;

        // Tambahkan jumlah tabungan sesuai daily_save
        const updatedSaved = currentSaved + dailySave;
        const updatedDaysSaved = currentDaysSaved + 1; // Asumsikan setiap kali menabung dianggap menambah 1 hari

        // Hitung ulang days_remaining
        const daysRemaining = dreamGoal.goal.period - updatedDaysSaved;

        // Perbarui nilai di Firestore
        await goalRef.update({
            "tracker.amount_saved": updatedSaved,
            "tracker.days_saved": updatedDaysSaved,
            "tracker.days_remaining": daysRemaining
        });

        return h.response({
            message: 'Savings updated successfully',
            data: {
                amount_saved: updatedSaved,
                days_saved: updatedDaysSaved,
                days_remaining: daysRemaining,
                daily_save: dailySave,
            },
        }).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Failed to update savings', details: error.message }).code(500);
    }
};


// Handler untuk menghapus DreamGoal
const deleteDreamProductHandler = async (request, h) => {
    const { uid } = request.auth; // UID dari Firebase token
    const { goalId } = request.payload; // Ambil goalId dari body

    if (!goalId) {
        return h.response({ error: 'Goal ID is required' }).code(400);
    }

    try {
        // Referensi dokumen di subkoleksi
        const goalRef = db.collection('dreamGoals').doc(uid).collection('goals').doc(goalId);

        // Cek apakah dokumen ada
        const goalDoc = await goalRef.get();
        if (!goalDoc.exists) {
            return h.response({ error: 'No goal found with the specified ID' }).code(404);
        }

        // Hapus dokumen
        await goalRef.delete();

        return h.response({ message: 'Dream goal deleted successfully' }).code(200);
    } catch (error) {
        console.error('Error in delete handler:', error);
        return h.response({ error: 'Failed to delete dream goal', details: error.message }).code(500);
    }
};

module.exports = { saveDataHandler, getDreamProductHandler, updateSavingsHandler, deleteDreamProductHandler };
