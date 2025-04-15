import React, { useState, useEffect } from 'react';

/**
 * Komponen tombol "Scroll to Top" yang muncul saat pengguna scroll ke bawah.
 * Ketika tombol diklik, halaman akan scroll ke bagian atas dengan animasi smooth.
 */
const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false); // State untuk menentukan apakah tombol terlihat atau tidak

    /**
     * Event handler untuk menangani scroll window.
     * Jika scroll lebih dari 200px, tampilkan tombol.
     * Jika tidak, sembunyikan tombol.
     */

    // Menangani scroll untuk menampilkan/menyembunyikan tombol
    const handleScroll = () => {
        if (window.scrollY > 200) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    /**
     * Fungsi untuk melakukan scroll ke atas halaman saat tombol diklik.
     * Menggunakan behavior 'smooth' agar animasi scroll lebih halus.
     */

    // Fungsi untuk scroll ke atas
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Animasi smooth saat scroll
        });
    };

    /**
     * useEffect untuk memasang dan membersihkan event listener saat komponen dimount dan di-unmount.
     * Berguna agar tidak terjadi memory leak atau duplikasi event.
     */
    useEffect(() => {
        window.addEventListener('scroll', handleScroll); // Tambahkan event scroll saat komponen mount
        return () => {
            window.removeEventListener('scroll', handleScroll); // Bersihkan saat unmount
        };
    }, []); // Dependency kosong = hanya dijalankan saat mount & unmount

    return (
        // button scroll ke atas, posisinya tetap (fixed) di pojok kanan bawah
        <button
            onClick={scrollToTop} // Jalankan scrollToTop saat diklik
            className={`fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg transition-opacity duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0' // Transisi muncul/hilang tergantung scroll
            }`}
            style={{
                zIndex: 1000, // Pastikan tombol tampil di atas elemen lain
            }}
        >
            ↑ {/* Simbol panah ke atas */}
        </button>
    );
};

export default ScrollToTopButton;
