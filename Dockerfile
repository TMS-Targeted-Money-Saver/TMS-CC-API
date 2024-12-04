# Gunakan Node.js versi resmi sebagai base image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file proyek ke dalam container
COPY . .

# Expose port 3000 (sesuaikan jika menggunakan port lain)
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "index.js"]
